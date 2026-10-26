import { z } from "zod";
import { SEATING_LABELS } from "../../data/business";
export const RESERVATION_STEPS = 4;
export const seatingOptions = Object.entries(SEATING_LABELS).map(([value, label]) => ({ value, label }));
export const reservationFormSchema = z.object({
    date: z.string().min(1, "Please choose a date"),
    timeSlot: z.string().min(1, "Please choose a time slot"),
    guests: z
        .number({ required_error: "Please select guest count" })
        .int()
        .min(1, "At least 1 guest")
        .max(12, "For groups larger than 12 please call us directly"),
    seatingPreference: z.enum(["panoramic-rooftop", "indoor-lounge", "standard-dining"], { required_error: "Please choose a seating preference" }),
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
export const stepFields = [
    ["date", "timeSlot"],
    ["guests"],
    ["seatingPreference"],
    ["name", "phone", "email", "specialRequests"],
];
export const DEFAULT_VALUES = {
    date: "",
    timeSlot: "",
    guests: 2,
    seatingPreference: "standard-dining",
    name: "",
    phone: "",
    email: "",
    specialRequests: "",
};
