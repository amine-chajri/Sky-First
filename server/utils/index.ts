import crypto from "node:crypto";
import { BUSINESS } from "../config/index.js";

export function generateConfirmationCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return `SF-${code}`;
}

export function generateTimeSlots(openHour: number, closeHour: number, stepMinutes = 30): string[] {
  const slots: string[] = [];
  for (let h = openHour; h < closeHour; h++) {
    for (const m of [0, stepMinutes === 60 ? 0 : 30]) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function businessTimeSlots(): string[] {
  return generateTimeSlots(BUSINESS.openHour, BUSINESS.closeHour, 30);
}

export const MAX_SLOT_CAPACITY = 6;

export function toMAD(price: number): number {
  return Math.round(price * 100) / 100;
}