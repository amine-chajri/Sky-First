import crypto from "node:crypto";
import { BUSINESS } from "../config/index.js";

export function generateConfirmationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return `SF-${code}`;
}

export function generateTimeSlots(openHour, closeHour, stepMinutes = 30) {
  const slots = [];
  for (let h = openHour; h < closeHour; h++) {
    for (const m of [0, stepMinutes === 60 ? 0 : 30]) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function businessTimeSlots() {
  return generateTimeSlots(BUSINESS.openHour, BUSINESS.closeHour, 30);
}

export const MAX_SLOT_CAPACITY = 6;

export function toMAD(price) {
  return Math.round(price * 100) / 100;
}
