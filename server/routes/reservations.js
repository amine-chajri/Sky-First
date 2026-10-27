import { Router } from "express";
import {
  bookedCountBySlot,
  countBookedReservations,
  createReservation,
  listReservations,
  Reservation,
} from "../models/Reservation.js";
import { Table } from "../models/Table.js";
import { validate, validateQuery, asyncHandler, ApiError } from "../middleware/index.js";
import { reservationSchema, availabilitySchema } from "../schemas/validation.js";
import { requireAuth, requireActiveUser, requireRole } from "../middleware/auth.js";
import { generateConfirmationCode, businessTimeSlots, MAX_SLOT_CAPACITY } from "../utils/index.js";

const router = Router();
const staffAuth = [requireAuth, requireActiveUser, requireRole("admin", "waiter")];

router.get(
  "/availability",
  validateQuery(availabilitySchema),
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    const bookedMap = await bookedCountBySlot(date);
    const slots = businessTimeSlots().map((time) => {
      const taken = bookedMap.get(time) ?? 0;
      return { time, available: taken < MAX_SLOT_CAPACITY, remaining: Math.max(0, MAX_SLOT_CAPACITY - taken) };
    });
    res.json({ date, slots });
  })
);

router.post(
  "/",
  validate(reservationSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    if ((await countBookedReservations(data.date, data.timeSlot)) >= MAX_SLOT_CAPACITY) {
      throw new ApiError(409, "This time slot is fully booked. Please pick another.");
    }

    let table;
    if (data.tableNumber) {
      table = await Table.findOne({ tableNumber: data.tableNumber });
      if (!table) throw new ApiError(400, "Selected table does not exist");
      if (table.capacity < data.guests) throw new ApiError(400, "The selected table does not have enough seats");
      if (await Reservation.exists({ tableNumber: table.tableNumber, date: data.date, status: "confirmed" })) {
        throw new ApiError(409, "The selected table is already reserved for this date");
      }
    } else {
      const zone = {
        "panoramic-rooftop": "Panoramic Rooftop",
        "indoor-lounge": "Indoor Lounge",
        "standard-dining": "Standard Dining",
      }[data.seatingPreference];
      const availableTables = await Table.find({ capacity: { $gte: data.guests } }).sort({ capacity: 1, tableNumber: 1 });
      for (const candidate of availableTables) {
        const isReserved = await Reservation.exists({ tableNumber: candidate.tableNumber, date: data.date, status: "confirmed" });
        if (!isReserved && candidate.zone === zone) {
          table = candidate;
          break;
        }
      }
      if (!table) {
        for (const candidate of availableTables) {
          const isReserved = await Reservation.exists({ tableNumber: candidate.tableNumber, date: data.date, status: "confirmed" });
          if (!isReserved) {
            table = candidate;
            break;
          }
        }
      }
      if (!table) throw new ApiError(409, "No suitable table is available for this party and date");
    }

    const reservation = await createReservation({
      ...data,
      tableNumber: table.tableNumber,
      confirmationCode: generateConfirmationCode(),
    });
    if (reservation.date === new Date().toLocaleDateString("en-CA")) {
      table.reservationId = String(reservation._id);
      table.reservationDate = reservation.date;
      if (table.status !== "OCCUPIED") table.status = "RESERVED";
      await table.save();
    }
    res.status(201).json({
      message: "Table reserved successfully",
      reservation: {
        id: reservation._id,
        confirmationCode: reservation.confirmationCode,
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        guests: reservation.guests,
        seatingPreference: reservation.seatingPreference,
        name: reservation.name,
        status: reservation.status,
        tableNumber: reservation.tableNumber,
      },
    });
  })
);

router.get(
  "/",
  ...staffAuth,
  asyncHandler(async (req, res) => {
    const { date, status } = req.query;
    const reservations = await listReservations({ date, status });
    res.json({ reservations });
  })
);

router.patch(
  "/:id/status",
  ...staffAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body ?? {};
    if (!["confirmed", "cancelled", "completed"].includes(status)) throw new ApiError(400, "Invalid status");
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!reservation) throw new ApiError(404, "Reservation not found");
    const table = await Table.findOne({ tableNumber: reservation.tableNumber });
    if (table && table.reservationId === String(reservation._id)) {
      table.reservationId = null;
      table.reservationDate = null;
      if (table.status === "RESERVED") table.status = "FREE";
      await table.save();
    }
    res.json({ reservation });
  })
);

export default router;
