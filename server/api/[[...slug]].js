import { createApp } from "../app.js";
import { connectDB } from "../config/db.js";

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      try {
        await connectDB();
      } catch (err) {
        console.error("[db] connection failed:", err);
        throw err;
      }
      return createApp();
    })();
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error("[handler] error:", err);
    res.status(500).json({ message: "Server error", error: err?.message });
  }
}
