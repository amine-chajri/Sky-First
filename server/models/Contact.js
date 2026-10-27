import mongoose from "mongoose";

export const CONTACT_STATUSES = ["new", "read", "replied"];

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    order: { type: mongoose.Schema.Types.Mixed, default: undefined },
    status: { type: String, enum: CONTACT_STATUSES, default: "new" },
  },
  { timestamps: true }
);

export const Contact = mongoose.model("Contact", contactSchema);

export async function createContact(data) {
  return Contact.create({ ...data, status: "new" });
}
