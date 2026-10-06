import mongoose from "mongoose";

export const USER_ROLES = ["admin", "waiter"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
