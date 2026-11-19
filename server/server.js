import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";
import { emailStatus, verifyEmailTransport } from "./utils/mailer.js";

async function reportEmailStatus() {
  const status = emailStatus();
  if (!status.configured) {
    console.warn(
      `[email] Reservation emails are DISABLED — missing ${status.missing.join(
        ", "
      )} in server/.env. Requests still succeed, but no email is sent.`
    );
    return;
  }
  console.log(`[email] SMTP configured via ${config.email.host}:${config.email.port}, verifying connection...`);
  const result = await verifyEmailTransport();
  if (result.verified) {
    console.log(`[email] SMTP connection OK — sending as ${config.email.from || config.email.user}`);
  } else {
    console.error(`[email] SMTP connection FAILED — ${result.error?.message ?? result.error}`);
  }
}

async function bootstrap() {
  const app = createApp();

  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[server] Sky First API listening on http://localhost:${config.port}`);
    reportEmailStatus().catch((err) => console.error("[email] Status check failed:", err));
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[server] Port ${config.port} is already in use. Stop the other process or set PORT to a free port in server/.env.`
      );
    } else {
      console.error("[server] Failed to start:", err);
    }
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("[server] Startup error:", err);
  process.exit(1);
});
