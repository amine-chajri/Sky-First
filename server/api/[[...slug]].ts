import { createApp } from "../app.js";
import { connectDB } from "../config/db.js";

await connectDB();

const app = createApp();

export default app;
