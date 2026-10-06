import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";
import menuRoutes from "./routes/menu.js";
import reservationRoutes from "./routes/reservations.js";
import contactRoutes from "./routes/contact.js";
import healthRoutes from "./routes/health.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.clientOrigin === "*" ? true : config.clientOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "50kb" }));
  app.use(morgan("dev"));

  app.use("/api/health", healthRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/contact", contactRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}