import mongoose from "mongoose";
import { config } from "./index.js";
import { MenuItem } from "../models/MenuItem.js";
import { seedMenuItems } from "../seed/data.js";

export async function connectDB(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log(`[db] MongoDB connected: ${mongoose.connection.name}`);

  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(
      seedMenuItems.map((item) => ({ ...item, isAvailable: true }))
    );
    console.log(`[db] Seeded ${seedMenuItems.length} menu items`);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
