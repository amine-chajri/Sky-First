import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";

async function bootstrap() {
  const app = createApp();

  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[server] Sky First API listening on http://localhost:${config.port}`);
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
