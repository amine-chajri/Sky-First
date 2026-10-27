import { Router } from "express";
import { Contact } from "../models/Contact.js";
import { Reservation } from "../models/Reservation.js";
import { Table, TABLE_STATUSES } from "../models/Table.js";
import { ApiError, asyncHandler } from "../middleware/index.js";
import { requireAuth, requireActiveUser, requireRole } from "../middleware/auth.js";

const router = Router();
const staffAuth = [requireAuth, requireActiveUser, requireRole("admin", "waiter")];

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
      current.push(contact.order);
      ordersByTable.set(key, current);
    }

    res.json({ tables: tables.map((table) => {
      const reservation = reservationsByTable.get(table.tableNumber);
      const orders = ordersByTable.get(table.tableNumber) || [];
      const activeOrder = orders.at(-1);
      const hasActiveOrder = orders.length > 0;
      const status = table.status === "OCCUPIED" || hasActiveOrder ? "OCCUPIED" : reservation ? "RESERVED" : table.status;
      return {
        ...table,
        id: table._id.toString(),
        status,
        reservationId: reservation?._id.toString() || null,
        reservationName: reservation?.name || null,
        currentOrderId: activeOrder?.orderId || (hasActiveOrder ? null : table.currentOrderId),
        orderItems: hasActiveOrder ? orders.map((order) => `${order.quantity} × ${order.dishName}${order.specialInstructions ? ` — ${order.specialInstructions}` : ""}`) : table.orderItems,
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
        if (table.currentOrderId) {
          await Contact.updateMany(
            { "order.orderId": table.currentOrderId, "order.status": "Pending" },
            { $set: { "order.status": "Completed" } }
          );
        }
        table.currentOrderId = null;
        table.orderItems = [];
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
