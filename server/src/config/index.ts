import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
} as const;

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
} as const;