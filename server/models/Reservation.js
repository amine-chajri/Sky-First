import mongoose from "mongoose";

export const SEATING_PREFERENCES = [
  "panoramic-rooftop",
  "indoor-lounge",
  "standard-dining",
];

export const RESERVATION_STATUSES = [
  "confirmed",
  "cancelled",
  "completed",
];

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

export const Reservation = mongoose.model("Reservation", reservationSchema);

export async function countBookedReservations(date, timeSlot) {
  return Reservation.countDocuments({
    date,
    timeSlot,
    status: "confirmed",
  });
}

export async function bookedCountBySlot(date) {
  const rows = await Reservation.aggregate([
    { $match: { date, status: "confirmed" } },
    { $group: { _id: "$timeSlot", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id, r.count]));
}

export async function listReservations(filter = {}) {
  const query = {};
  if (filter.date) query.date = filter.date;
  if (filter.status) query.status = filter.status;
  return Reservation.find(query).sort({ date: 1, timeSlot: 1 }).lean();
}

export async function createReservation(data) {
  return Reservation.create({ ...data, status: "confirmed" });
}
