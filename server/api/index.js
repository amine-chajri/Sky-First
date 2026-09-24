import { createApp } from "../dist/app.js";
import { connectDB } from "../dist/config/db.js";

const app = createApp();

connectDB();

export default function handler(req, res) {
  return app(req, res);
}