import { z } from "zod";
import { SEATING_LABELS } from "../../data/business";
import type { SeatingPreference } from "../../types";

export const RESERVATION_STEPS = 4;

export const seatingOptions: { value: SeatingPreference; label: string }[] = (
  Object.entries(SEATING_LABELS) as [SeatingPreference, string][]
).map(([value, label]) => ({ value, label }));

export const reservationFormSchema = z.object({
  date: z.string().min(1, "Please choose a date"),
  timeSlot: z.string().min(1, "Please choose a time slot"),
  guests: z
    .number({ required_error: "Please select guest count" })
    .int()
    .min(1, "At least 1 guest")
    .max(12, "For groups larger than 12 please call us directly"),
  seatingPreference: z.enum(
    ["panoramic-rooftop", "indoor-lounge", "standard-dining"],
    { required_error: "Please choose a seating preference" }
  ),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(20)
    .regex(/^[+0-9 ()-]+$/, "Invalid phone format"),
  email: z.string().trim().email("Please enter a valid email"),
  specialRequests: z.string().trim().max(500, "Maximum 500 characters").optional(),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

export const stepFields: (keyof ReservationFormValues)[][] = [
  ["date", "timeSlot"],
  ["guests"],
  ["seatingPreference"],
  ["name", "phone", "email", "specialRequests"],
];

export const DEFAULT_VALUES: ReservationFormValues = {
  date: "",
  timeSlot: "",
  guests: 2,
  seatingPreference: "standard-dining",
  name: "",
  phone: "",
  email: "",
  specialRequests: "",
};