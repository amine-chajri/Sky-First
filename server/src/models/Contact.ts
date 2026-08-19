import { createCollection, type BaseDoc, type NewDoc } from "../db/store.js";

export const CONTACT_STATUSES = ["new", "read", "replied"] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export interface ContactDoc extends BaseDoc {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
}

export type NewContact = NewDoc<ContactDoc>;

export const Contact = createCollection<ContactDoc>();

export function createContact(data: NewDoc<ContactDoc>): ContactDoc {
  return Contact.insert({ ...data, status: "new" });
}