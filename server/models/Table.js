import mongoose from "mongoose";

export const TABLE_STATUSES = ["FREE", "RESERVED", "OCCUPIED"];
export const DEFAULT_TABLES = [
  { tableNumber: 1, capacity: 2, zone: "Panoramic Rooftop" },
  { tableNumber: 2, capacity: 4, zone: "Panoramic Rooftop" },
  { tableNumber: 3, capacity: 4, zone: "Indoor Lounge" },
  { tableNumber: 4, capacity: 6, zone: "Indoor Lounge" },
  { tableNumber: 5, capacity: 2, zone: "Standard Dining" },
  { tableNumber: 6, capacity: 4, zone: "Standard Dining" },
];

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true, min: 1 },
    capacity: { type: Number, required: true, min: 1, max: 30, default: 4 },
    zone: { type: String, default: "Standard Dining" },
    status: { type: String, enum: TABLE_STATUSES, default: "FREE" },
    currentOrderId: { type: String, default: null },
    orderItems: { type: [String], default: [] },
    assignedWaiter: {
      id: { type: String, default: null },
      name: { type: String, default: null },
    },
    reservationId: { type: String, default: null },
    reservationDate: { type: String, default: null },
  },
  { timestamps: true }
);

export const Table = mongoose.model("Table", tableSchema);

export async function ensureDefaultTables() {
  await Promise.all(
    DEFAULT_TABLES.map(({ tableNumber, ...defaults }) =>
      Table.updateOne(
        { tableNumber },
        { $setOnInsert: { tableNumber, ...defaults } },
        { upsert: true }
      )
    )
  );
}
