import mongoose from "mongoose";

export const SEATING_PREFERENCES = [
  "panoramic-rooftop",
  "indoor-lounge",
  "standard-dining",
];

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

const reservationSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true }, // HH:mm
    guests: { type: Number, required: true, min: 1 },
    tableNumber: { type: Number, default: null },
    seatingPreference: {
      type: String,
      enum: SEATING_PREFERENCES,
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: RESERVATION_STATUSES,
      default: "pending",
    },
    confirmationCode: { type: String, required: true, unique: true },
    reservationCode: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

reservationSchema.pre("validate", function syncContactFields() {
  if (!this.customerEmail && this.email) this.customerEmail = this.email;
  if (!this.email && this.customerEmail) this.email = this.customerEmail;
  if (!this.reservationCode && this.confirmationCode) {
    this.reservationCode = this.confirmationCode;
  }
  if (!this.confirmationCode && this.reservationCode) {
    this.confirmationCode = this.reservationCode;
  }
});

export const Reservation = mongoose.model("Reservation", reservationSchema);

export async function countBookedReservations(date, timeSlot) {
  return Reservation.countDocuments({
    date,
    timeSlot,
    status: { $in: ["pending", "confirmed"] },
  });
}

export async function bookedCountBySlot(date) {
  const rows = await Reservation.aggregate([
    { $match: { date, status: { $in: ["pending", "confirmed"] } } },
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
  return Reservation.create({ ...data, status: data.status ?? "pending" });
}
