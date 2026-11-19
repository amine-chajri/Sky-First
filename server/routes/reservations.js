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
import {
  emailStatus,
  sendReservationRequestEmail,
  sendReservationConfirmedEmail,
  sendReservationCancelledEmail,
} from "../utils/mailer.js";

const router = Router();
const staffAuth = [requireAuth, requireActiveUser, requireRole("admin", "waiter")];

function isTodayOrEarlier(dateString) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return true;
  const requested = new Date(year, month - 1, day);
  if (Number.isNaN(requested.getTime())) return true;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return requested <= today;
}

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
    if (isTodayOrEarlier(data.date)) {
      res.status(400).json({ message: "Same-day reservations are not allowed. Please select tomorrow or a future date." });
      return;
    }
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

    const reservationCode = generateConfirmationCode();
    const reservation = await createReservation({
      ...data,
      tableNumber: table.tableNumber,
      customerEmail: data.email,
      confirmationCode: reservationCode,
      reservationCode,
    });
    if (reservation.date === new Date().toLocaleDateString("en-CA")) {
      table.reservationId = String(reservation._id);
      table.reservationDate = reservation.date;
      if (table.status !== "OCCUPIED") table.status = "RESERVED";
      await table.save();
    }
    try {
      await sendReservationRequestEmail(reservation);
    } catch (error) {
      console.error(
        `[email] Could not send request email for reservation ${reservationCode}:`,
        error
      );
    }

    res.status(201).json({
      message: "Table reserved successfully",
      reservation: {
        id: reservation._id,
        confirmationCode: reservation.confirmationCode,
        reservationCode: reservation.reservationCode,
        customerEmail: reservation.customerEmail,
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

router.post(
  "/:id/resend-email",
  ...staffAuth,
  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) throw new ApiError(404, "Reservation not found");

    const to = reservation.customerEmail || reservation.email;
    if (!to) throw new ApiError(400, "This reservation has no customer email address");

    if (!emailStatus().configured) {
      throw new ApiError(
        503,
        "Email is not configured on the server. Set SMTP_HOST, SMTP_USER and SMTP_PASS in server/.env."
      );
    }

    // Resend the email that matches the reservation's current state.
    const send =
      reservation.status === "cancelled"
        ? sendReservationCancelledEmail
        : reservation.status === "pending"
          ? sendReservationRequestEmail
          : sendReservationConfirmedEmail;

    const result = await send(reservation);
    if (!result.sent) {
      throw new ApiError(
        502,
        `The email to ${to} could not be sent. Check the server logs for the SMTP error.`
      );
    }

    res.json({ message: `Email sent to ${to}`, sentTo: to, status: reservation.status });
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
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) throw new ApiError(404, "Reservation not found");
    reservation.status = status;
    await reservation.save();
    const table = await Table.findOne({ tableNumber: reservation.tableNumber });
    if (table && table.reservationId === String(reservation._id)) {
      table.reservationId = null;
      table.reservationDate = null;
      if (table.status === "RESERVED") table.status = "FREE";
      await table.save();
    }

    try {
      if (status === "confirmed") {
        await sendReservationConfirmedEmail(reservation);
      } else if (status === "cancelled") {
        await sendReservationCancelledEmail(reservation);
      }
    } catch (error) {
      console.error(
        `[email] Could not send ${status} email for reservation ${
          reservation.reservationCode || reservation.confirmationCode
        }:`,
        error
      );
    }

    res.json({ reservation });
  })
);

export default router;
