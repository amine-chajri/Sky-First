import { z } from "zod";
import { SEATING_PREFERENCES } from "../models/Reservation.js";
import { BUSINESS } from "../config/index.js";

export const reservationSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    timeSlot: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time slot"),
    guests: z.coerce.number().int().min(1).max(20),
    seatingPreference: z.enum(SEATING_PREFERENCES).default("standard-dining"),
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    phone: z
      .string()
      .trim()
      .min(6, "Valid phone number required")
      .max(20)
      .regex(/^[+0-9 ()-]+$/, "Invalid phone format"),
    email: z.string().trim().email("Valid email required").max(120),
    specialRequests: z.string().trim().max(500).default(""),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    const [y, m, d] = data.date.split("-").map(Number);
    const booked = new Date(y, m - 1, d);
    if (booked.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Reservation date cannot be in the past",
      });
    }

    const hour = Number(data.timeSlot.split(":")[0]);
    if (hour < BUSINESS.openHour || hour >= BUSINESS.closeHour) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["timeSlot"],
        message: `We are open daily from ${BUSINESS.openHour}:00 to ${BUSINESS.closeHour}:00`,
      });
    }
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional().default(""),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(2000),
});

export const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type AvailabilityQuery = z.infer<typeof availabilitySchema>;