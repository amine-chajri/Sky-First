import { createApp } from "../app.js";
import { connectDB } from "../config/db.js";

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      await connectDB();
      return createApp();
    })();
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
