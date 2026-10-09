import mongoose from "mongoose";
import { config } from "./config/index.js";

async function fix() {
  await mongoose.connect(config.mongoUri);
  await mongoose.connection.db.collection("users").updateMany({}, { $set: { isActive: true } });
  console.log("Updated users");
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });