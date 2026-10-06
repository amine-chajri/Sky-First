import { connectDB, disconnectDB } from "../config/db.js";
import { MenuItem, menuCategoryCounts } from "../models/MenuItem.js";
import { seedMenuItems } from "./data.js";

async function seed() {
  try {
    await connectDB();

    await MenuItem.deleteMany({});
    const inserted = await MenuItem.insertMany(
      seedMenuItems.map((item) => ({ ...item, isAvailable: true }))
    );
    console.log(`[seed] Inserted ${inserted.length} menu items`);

    for (const c of await menuCategoryCounts()) {
      console.log(`[seed]   ${c._id}: ${c.count} items`);
    }
  } finally {
    await disconnectDB();
  }
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
