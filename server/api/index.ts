import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

const app = createApp();

connectDB();

export default function handler(req: any, res: any) {
  return app(req, res);
}