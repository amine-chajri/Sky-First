import { createCollection, type BaseDoc, type NewDoc } from "../db/store.js";

export const SEATING_PREFERENCES = [
  "panoramic-rooftop",
  "indoor-lounge",
  "standard-dining",
] as const;

export type SeatingPreference = (typeof SEATING_PREFERENCES)[number];

export const RESERVATION_STATUSES = [
  "confirmed",
  "cancelled",
  "completed",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export interface ReservationDoc extends BaseDoc {
  date: string; // YYYY-MM-DD in business timezone
  timeSlot: string; // HH:mm (24h)
  guests: number;
  seatingPreference: SeatingPreference;
  name: string;
  phone: string;
  email: string;
  specialRequests: string;
  status: ReservationStatus;
  confirmationCode: string;
}

export type NewReservation = NewDoc<ReservationDoc>;

export const Reservation = createCollection<ReservationDoc>();

export function countBookedReservations(date: string, timeSlot: string): number {
  return Reservation.all().filter(
    (r) => r.date === date && r.timeSlot === timeSlot && r.status === "confirmed"
  ).length;
}

export function bookedCountBySlot(date: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const r of Reservation.all()) {
    if (r.date !== date || r.status !== "confirmed") continue;
    counts.set(r.timeSlot, (counts.get(r.timeSlot) ?? 0) + 1);
  }
  return counts;
}

export function listReservations(filter: {
  date?: string;
  status?: string;
}): ReservationDoc[] {
  const { date, status } = filter;
  return Reservation.all()
    .filter(
      (r) =>
        (!date || r.date === date) && (!status || r.status === status)
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot)
    );
}

export function createReservation(data: NewDoc<ReservationDoc>): ReservationDoc {
  return Reservation.insert({ ...data, status: "confirmed" });
}