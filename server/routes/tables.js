import { Router } from "express";
import { Contact } from "../models/Contact.js";
import { Reservation } from "../models/Reservation.js";
import { Table, TABLE_STATUSES } from "../models/Table.js";
import { ApiError, asyncHandler } from "../middleware/index.js";
import { requireAuth, requireActiveUser, requireRole } from "../middleware/auth.js";

const router = Router();
const staffAuth = [requireAuth, requireActiveUser, requireRole("admin", "waiter")];

function tableNumberPattern(tableNumber) {
  return new RegExp(`(^|\\D)${Number(tableNumber)}(\\D|$)`);
}

async function archiveActiveOrders(table) {
  const filters = [
    {
      "order.status": "Pending",
      "order.tableNumber": { $regex: tableNumberPattern(table.tableNumber) },
    },
  ];
  if (table.currentOrderId) {
    filters.push({ "order.status": "Pending", "order.orderId": table.currentOrderId });
  }
  const result = await Contact.updateMany(
    { $or: filters },
    {
      $set: {
        "order.status": "Completed",
        "order.archivedAt": new Date().toISOString(),
      },
    }
  );
  return result.modifiedCount ?? 0;
}

async function completeActiveReservation(table) {
  const today = new Date().toLocaleDateString("en-CA");
  const result = await Reservation.updateMany(
    { tableNumber: table.tableNumber, date: today, status: "confirmed" },
    { $set: { status: "completed" } }
  );
  return result.modifiedCount ?? 0;
}

function serializeTable(table) {
  return {
    ...table.toObject(),
    id: table._id.toString(),
    activeOrders: [],
    orderItems: table.orderItems ?? [],
    reservation: null,
    reservationName: null,
  };
}

router.get(
  "/",
  ...staffAuth,
  asyncHandler(async (_req, res) => {
    const today = new Date().toLocaleDateString("en-CA");
    const [tables, reservations, contacts] = await Promise.all([
      Table.find().sort({ tableNumber: 1 }).lean(),
      Reservation.find({ date: today, status: "confirmed", tableNumber: { $ne: null } }).lean(),
      Contact.find({ "order.status": "Pending" }).lean(),
    ]);
    const reservationsByTable = new Map(reservations.map((reservation) => [reservation.tableNumber, reservation]));
    const ordersByTable = new Map();
    for (const contact of contacts) {
      const tableNumber = contact.order?.tableNumber?.match(/\d+/)?.[0];
      if (!tableNumber) continue;
      const key = Number(tableNumber);
      const current = ordersByTable.get(key) || [];
      current.push({
        id: String(contact._id),
        orderId: contact.order.orderId,
        dishName: contact.order.dishName,
        quantity: contact.order.quantity,
        specialInstructions: contact.order.specialInstructions || "",
        status: contact.order.status,
        timestamp: contact.order.timestamp,
      });
      ordersByTable.set(key, current);
    }

    res.json({ tables: tables.map((table) => {
      const reservation = reservationsByTable.get(table.tableNumber);
      const activeOrders = ordersByTable.get(table.tableNumber) || [];
      const activeOrder = activeOrders.at(-1);
      const hasActiveOrder = activeOrders.length > 0;
      const status = table.status === "OCCUPIED" || hasActiveOrder ? "OCCUPIED" : reservation ? "RESERVED" : table.status;
      return {
        ...table,
        id: table._id.toString(),
        status,
        activeOrders,
        reservationId: reservation?._id.toString() || null,
        reservationName: reservation?.name || null,
        reservation: reservation
          ? {
              id: String(reservation._id),
              name: reservation.name,
              timeSlot: reservation.timeSlot,
              guests: reservation.guests,
              phone: reservation.phone,
            }
          : null,
        currentOrderId: activeOrder?.orderId || (hasActiveOrder ? null : table.currentOrderId),
        orderItems: hasActiveOrder ? activeOrders.map((order) => `${order.quantity} × ${order.dishName}${order.specialInstructions ? ` — ${order.specialInstructions}` : ""}`) : table.orderItems,
      };
    }) });
  })
);

router.post(
  "/",
  ...staffAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const tableNumber = Number(req.body?.tableNumber);
    const capacity = Number(req.body?.capacity ?? 4);
    if (!Number.isInteger(tableNumber) || tableNumber < 1 || !Number.isInteger(capacity) || capacity < 1 || capacity > 30) {
      throw new ApiError(400, "A valid table number and capacity (1–30) are required");
    }
    const table = await Table.create({ tableNumber, capacity, zone: req.body?.zone || "Standard Dining" });
    res.status(201).json({ table: { ...table.toObject(), id: table._id.toString() } });
  })
);

router.patch(
  "/:id/status",
  ...staffAuth,
  asyncHandler(async (req, res) => {
    const { status, createOrder } = req.body ?? {};
    if (!TABLE_STATUSES.includes(status)) throw new ApiError(400, "Invalid table status");
    const table = await Table.findById(req.params.id);
    if (!table) throw new ApiError(404, "Table not found");

    let archivedOrders = 0;
    let completedReservations = 0;

    if (status === "OCCUPIED" && createOrder && !table.currentOrderId) {
      table.currentOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      table.orderItems = [];
    }
    if (status === "FREE") {
      archivedOrders = await archiveActiveOrders(table);
      completedReservations = await completeActiveReservation(table);
      table.currentOrderId = null;
      table.orderItems = [];
      table.reservationId = null;
      table.reservationDate = null;
    }

    table.status = status;
    await table.save();
    res.json({ table: serializeTable(table), archivedOrders, completedReservations });
  })
);

router.post(
  "/:id/clear",
  ...staffAuth,
  asyncHandler(async (req, res) => {
    const table = await Table.findById(req.params.id);
    if (!table) throw new ApiError(404, "Table not found");

    const archivedOrders = await archiveActiveOrders(table);
    const completedReservations = await completeActiveReservation(table);

    table.status = "FREE";
    table.currentOrderId = null;
    table.orderItems = [];
    table.reservationId = null;
    table.reservationDate = null;
    await table.save();

    res.json({ table: serializeTable(table), archivedOrders, completedReservations });
  })
);

router.patch(
  "/:id",
  ...staffAuth,
  asyncHandler(async (req, res) => {
    const { status, capacity, zone, assignedWaiterId, createOrder, addItem } = req.body ?? {};
    const table = await Table.findById(req.params.id);
    if (!table) throw new ApiError(404, "Table not found");
    if (status !== undefined) {
      if (!TABLE_STATUSES.includes(status)) throw new ApiError(400, "Invalid table status");
      table.status = status;
      if (status === "OCCUPIED" && createOrder && !table.currentOrderId) {
        table.currentOrderId = `ORD-${Date.now().toString().slice(-6)}`;
        table.orderItems = [];
      }
      if (status === "FREE") {
        await archiveActiveOrders(table);
        await completeActiveReservation(table);
        table.currentOrderId = null;
        table.orderItems = [];
        table.reservationId = null;
        table.reservationDate = null;
      }
    }
    if (addItem !== undefined) {
      const item = String(addItem).trim();
      if (!item) throw new ApiError(400, "Order item cannot be empty");
      if (!table.currentOrderId) table.currentOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      table.orderItems = [...(table.orderItems || []), item];
    }
    if (capacity !== undefined) {
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) throw new ApiError(400, "Capacity must be between 1 and 30");
      table.capacity = capacity;
    }
    if (zone !== undefined) table.zone = String(zone).trim() || "Standard Dining";
    if (assignedWaiterId !== undefined) {
      if (!assignedWaiterId) {
        table.assignedWaiter = { id: null, name: null };
      } else {
        const { User } = await import("../models/User.js");
        const waiter = await User.findOne({ _id: assignedWaiterId, role: "waiter", isActive: true }).select("name").lean();
        if (!waiter) throw new ApiError(400, "Choose an active waiter");
        table.assignedWaiter = { id: String(assignedWaiterId), name: waiter.name };
      }
    }
    await table.save();
    res.json({ table: { ...table.toObject(), id: table._id.toString() } });
  })
);

export default router;
