import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Always read server/.env, whatever directory the process was started from,
// then fall back to a .env in the current working directory.
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/skyfirst",
  jwtSecret: process.env.JWT_SECRET ?? "sky-first-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  email: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.EMAIL_FROM ?? "",
  },
};

export const BUSINESS = {
  name: "Sky First",
  address: "4 Av. de France, Rabat 10090, Morocco",
  plusCode: "X5X4+H3 Rabat",
  phone: "+212 6 59 33 33 30",
  phoneHref: "tel:+212659333330",
  openHour: 7,
  closeHour: 23,
  timezone: "Africa/Casablanca",
  rating: 4.6,
  reviewCount: 519,
  priceRange: "MAD 50-100",
};
