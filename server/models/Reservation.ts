import mongoose, { type InferSchemaType } from "mongoose";

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

const reservationSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true }, // HH:mm
    guests: { type: Number, required: true, min: 1 },
    seatingPreference: {
      type: String,
      enum: SEATING_PREFERENCES,
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: RESERVATION_STATUSES,
      default: "confirmed",
    },
    confirmationCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type ReservationDoc = InferSchemaType<typeof reservationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Reservation = mongoose.model("Reservation", reservationSchema);

export type NewReservation = Omit<
  ReservationDoc,
  "_id" | "createdAt" | "updatedAt"
>;

export async function countBookedReservations(
  date: string,
  timeSlot: string
): Promise<number> {
  return Reservation.countDocuments({
    date,
    timeSlot,
    status: "confirmed",
  });
}

export async function bookedCountBySlot(
  date: string
): Promise<Map<string, number>> {
  const rows = await Reservation.aggregate<{ _id: string; count: number }>([
    { $match: { date, status: "confirmed" } },
    { $group: { _id: "$timeSlot", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id, r.count]));
}

export async function listReservations(filter: {
  date?: string;
  status?: string;
}) {
  const query: Record<string, unknown> = {};
  if (filter.date) query.date = filter.date;
  if (filter.status) query.status = filter.status;
  return Reservation.find(query).sort({ date: 1, timeSlot: 1 }).lean();
}

export async function createReservation(data: NewReservation) {
  return Reservation.create({ ...data, status: "confirmed" });
}
