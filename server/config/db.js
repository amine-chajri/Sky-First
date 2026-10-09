import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./index.js";
import { MenuItem } from "../models/MenuItem.js";
import { User } from "../models/User.js";
import { seedMenuItems } from "../seed/data.js";

export async function connectDB() {
  await mongoose.connect(config.mongoUri);
  console.log(`[db] MongoDB connected: ${mongoose.connection.name}`);

  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(
      seedMenuItems.map((item) => ({ ...item, isAvailable: true }))
    );
    console.log(`[db] Seeded ${seedMenuItems.length} menu items`);
  }

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create([
      {
        name: "Admin",
        email: "admin@skyfirst.ma",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        isActive: true,
      },
      {
        name: "Waiter",
        email: "waiter@skyfirst.ma",
        password: await bcrypt.hash("waiter123", 10),
        role: "waiter",
        isActive: true,
      },
    ]);
    console.log("[db] Seeded default users (admin@skyfirst.ma / admin123, waiter@skyfirst.ma / waiter123)");
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
