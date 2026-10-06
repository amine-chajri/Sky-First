import { MenuItem } from "../models/MenuItem.js";
import { seedMenuItems } from "../seed/data.js";

export async function connectDB(): Promise<void> {
  if (MenuItem.count() === 0) {
    MenuItem.insertMany(
      seedMenuItems.map((item) => ({ ...item, isAvailable: true }))
    );
    console.log(
      `[db] Seeded ${seedMenuItems.length} menu items into in-memory database`
    );
  }
  console.log("[db] In-memory database ready (no MongoDB required)");
}

export async function disconnectDB(): Promise<void> {
  // In-memory database needs no cleanup on shutdown.
}