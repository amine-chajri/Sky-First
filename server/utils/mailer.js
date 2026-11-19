import nodemailer from "nodemailer";
import { BUSINESS, config } from "../config/index.js";

const SEATING_LABELS = {
  "panoramic-rooftop": "Panoramic Rooftop",
  "indoor-lounge": "Indoor Lounge",
  "standard-dining": "Standard Dining",
};

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.email.host) return null;

  const port = Number.isFinite(config.email.port) ? config.email.port : 587;
  const auth =
    config.email.user && config.email.pass
      ? { user: config.email.user, pass: config.email.pass }
      : undefined;

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port,
    secure: port === 465,
    auth,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return transporter;
}

export function emailStatus() {
  const missing = [];
  if (!config.email.host) missing.push("SMTP_HOST");
  if (!config.email.user) missing.push("SMTP_USER");
  if (!config.email.pass) missing.push("SMTP_PASS");
  return { configured: missing.length === 0, missing };
}

export async function verifyEmailTransport() {
  const status = emailStatus();
  if (!status.configured) return { ...status, verified: false };
  try {
    await getTransporter().verify();
    return { ...status, verified: true };
  } catch (error) {
    return { ...status, verified: false, error };
  }
}

export async function sendMail({ to, subject, text, html }) {
  if (!to) {
    console.warn(`[email] No recipient address for "${subject}"; email skipped.`);
    return { skipped: true };
  }

  try {
    const transport = getTransporter();
    if (!transport) {
      console.warn(
        `[email] SMTP not configured; skipped "${subject}" to ${to}. Set SMTP_HOST, SMTP_USER and SMTP_PASS in server/.env.`
      );
      return { skipped: true };
    }

    const from =
      config.email.from ||
      (config.email.user
        ? `"Sky First" <${config.email.user}>`
        : '"Sky First" <no-reply@skyfirst.ma>');

    const info = await transport.sendMail({ from, to, subject, text, html });
    console.log(`[email] Sent "${subject}" to ${to} (${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
    return { sent: false, error };
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );
}

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeSlot) {
  if (!timeSlot) return "";
  const [hours, minutes] = String(timeSlot).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return timeSlot;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function getCustomerEmail(reservation) {
  return reservation.customerEmail || reservation.email || "";
}

function getReservationCode(reservation) {
  return reservation.reservationCode || reservation.confirmationCode || "";
}

function getReservationDetails(reservation) {
  const details = [
    ["Reservation code", getReservationCode(reservation)],
    ["Date", formatDate(reservation.date)],
    ["Time", formatTime(reservation.timeSlot)],
    ["Guests", String(reservation.guests ?? "")],
    [
      "Seating",
      SEATING_LABELS[reservation.seatingPreference] ||
        reservation.seatingPreference ||
        "Standard Dining",
    ],
  ];

  if (reservation.tableNumber) {
    details.push(["Table", String(reservation.tableNumber)]);
  }
  if (reservation.specialRequests) {
    details.push(["Special requests", reservation.specialRequests]);
  }

  return details;
}

function renderTextEmail({ heading, intro, reservation, outro }) {
  const details = getReservationDetails(reservation)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return [
    heading,
    "",
    `Hello ${reservation.name || "there"},`,
    "",
    intro,
    "",
    details,
    "",
    outro,
    "",
    `If you need to make changes, contact us at ${BUSINESS.phone}.`,
    "",
    BUSINESS.name,
    BUSINESS.address,
    BUSINESS.phone,
  ].join("\n");
}

function renderHtmlEmail({ heading, intro, reservation, outro }) {
  const rows = getReservationDetails(reservation)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 8px 0; color: #78716c; font-size: 13px; vertical-align: top; width: 150px;">${escapeHtml(label)}</td>
          <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600; vertical-align: top;">${escapeHtml(value).replace(/\n/g, "<br />")}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin: 0; padding: 0; background: #f4efe4; color: #1c1917; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
      <div style="background: #0b0b10; border-top: 4px solid #d4a437; border-radius: 16px 16px 0 0; padding: 28px 32px;">
        <p style="margin: 0; color: #d4a437; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Sky First</p>
        <h1 style="margin: 8px 0 0; color: #f8f1e3; font-size: 26px; line-height: 1.25;">${escapeHtml(heading)}</h1>
      </div>
      <div style="background: #ffffff; padding: 32px;">
        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">Hello ${escapeHtml(reservation.name || "there")},</p>
        <p style="margin: 0 0 24px; color: #57534e; font-size: 15px; line-height: 1.7;">${escapeHtml(intro)}</p>
        <div style="margin: 0 0 24px; border: 1px solid #e7e1d5; border-radius: 12px; background: #fbf8f1; padding: 8px 20px;">
          <table style="width: 100%; border-collapse: collapse;">${rows}</table>
        </div>
        <p style="margin: 0 0 16px; color: #57534e; font-size: 15px; line-height: 1.7;">${escapeHtml(outro)}</p>
        <p style="margin: 0; color: #57534e; font-size: 15px; line-height: 1.7;">If you need to make changes, contact us at <a href="${escapeHtml(BUSINESS.phoneHref)}" style="color: #a16207; font-weight: 600;">${escapeHtml(BUSINESS.phone)}</a>.</p>
      </div>
      <div style="background: #0b0b10; border-radius: 0 0 16px 16px; padding: 20px 32px; color: #a8a29e; font-size: 12px; line-height: 1.7;">
        <p style="margin: 0;">${escapeHtml(BUSINESS.name)} &middot; ${escapeHtml(BUSINESS.address)}</p>
        <p style="margin: 4px 0 0;">${escapeHtml(BUSINESS.phone)}</p>
      </div>
    </div>
  </body>
</html>`;
}

async function sendReservationEmail(reservation, { subject, heading, intro, outro }) {
  return sendMail({
    to: getCustomerEmail(reservation),
    subject,
    text: renderTextEmail({ heading, intro, reservation, outro }),
    html: renderHtmlEmail({ heading, intro, reservation, outro }),
  });
}

export async function sendReservationRequestEmail(reservation) {
  const code = getReservationCode(reservation);
  return sendReservationEmail(reservation, {
    subject: `Sky First reservation request received — ${code}`,
    heading: "Reservation request received",
    intro:
      "Thank you for choosing Sky First. We have received your reservation request and it is currently pending confirmation from our team.",
    outro:
      "We will email you as soon as your reservation is confirmed. If you have any questions in the meantime, just reply to this email or call us.",
  });
}

export async function sendReservationConfirmedEmail(reservation) {
  const code = getReservationCode(reservation);
  return sendReservationEmail(reservation, {
    subject: `Sky First reservation confirmed — ${code}`,
    heading: "Your reservation is confirmed",
    intro:
      "Good news — your reservation at Sky First is confirmed. We look forward to welcoming you.",
    outro:
      "Please arrive a few minutes before your reserved time. If your plans change, let us know as soon as possible.",
  });
}

export async function sendReservationCancelledEmail(reservation) {
  const code = getReservationCode(reservation);
  return sendReservationEmail(reservation, {
    subject: `Sky First reservation cancelled — ${code}`,
    heading: "Your reservation was cancelled",
    intro: "Your reservation at Sky First has been cancelled.",
    outro:
      "If you believe this was a mistake or would like help booking another time, please contact us.",
  });
}
