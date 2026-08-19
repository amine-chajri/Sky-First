import { Router } from "express";
import {
  bookedCountBySlot,
  countBookedReservations,
  createReservation,
  listReservations,
} from "../models/Reservation.js";
import { validate, validateQuery, asyncHandler, ApiError } from "../middleware/index.js";
import { reservationSchema, availabilitySchema } from "../schemas/validation.js";
import {
  generateConfirmationCode,
  businessTimeSlots,
  MAX_SLOT_CAPACITY,
} from "../utils/index.js";

const router = Router();

router.get(
  "/availability",
  validateQuery(availabilitySchema),
  asyncHandler(async (req, res) => {
    const { date } = req.query as { date: string };

    const bookedMap = bookedCountBySlot(date);

    const slots = businessTimeSlots().map((time) => {
      const taken = bookedMap.get(time) ?? 0;
      return {
        time,
        available: taken < MAX_SLOT_CAPACITY,
        remaining: Math.max(0, MAX_SLOT_CAPACITY - taken),
      };
    });

    res.json({ date, slots });
  })
);

router.post(
  "/",
  validate(reservationSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;

    if (countBookedReservations(data.date, data.timeSlot) >= MAX_SLOT_CAPACITY) {
      throw new ApiError(409, "This time slot is fully booked. Please pick another.");
    }

    const reservation = createReservation({
      ...data,
      confirmationCode: generateConfirmationCode(),
    });

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
      },
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { date, status } = req.query as { date?: string; status?: string };
    const reservations = listReservations({ date, status });
    res.json({ reservations });
  })
);

export default router;