import mongoose from "mongoose";

export const USER_ROLES = ["admin", "waiter"];
export const SHIFT_STATUSES = ["on-shift", "off-shift", "day-off"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    shiftStatus: { type: String, enum: SHIFT_STATUSES, default: "off-shift" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
