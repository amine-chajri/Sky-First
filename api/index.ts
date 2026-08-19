import { createApp } from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

const app = createApp();

connectDB();

export default function handler(req: any, res: any) {
  return app(req, res);
}