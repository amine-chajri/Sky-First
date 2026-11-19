import { config } from "../config/index.js";
import { emailStatus, sendMail } from "../utils/mailer.js";

// Usage: npm run email:test [recipient]
// Verifies the SMTP settings in server/.env by sending one real message.
const to = process.argv[2] || config.email.user;

const status = emailStatus();
if (!status.configured) {
  console.error(`[email:test] Missing ${status.missing.join(", ")} in server/.env.`);
  process.exit(1);
}

console.log(`[email:test] Sending via ${config.email.host}:${config.email.port} to ${to} ...`);

const result = await sendMail({
  to,
  subject: "Sky First email test",
  text: "If you can read this, your Sky First email settings work and reservation emails will be delivered.",
  html: "<p>If you can read this, your Sky First email settings work and <strong>reservation emails will be delivered</strong>.</p>",
});

if (result.sent) {
  console.log(`[email:test] Sent to ${to}. Check the inbox (and the spam folder).`);
} else {
  console.error("[email:test] Failed:", result.error?.message ?? result.error);
  process.exit(1);
}
