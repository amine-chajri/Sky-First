import mongoose, { type InferSchemaType } from "mongoose";

export const CONTACT_STATUSES = ["new", "read", "replied"] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: CONTACT_STATUSES, default: "new" },
  },
  { timestamps: true }
);

export type ContactDoc = InferSchemaType<typeof contactSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Contact = mongoose.model("Contact", contactSchema);

export type NewContact = Omit<ContactDoc, "_id" | "createdAt" | "updatedAt">;

export async function createContact(data: NewContact) {
  return Contact.create({ ...data, status: "new" });
}
