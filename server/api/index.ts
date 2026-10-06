import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

connectDB();

const app = createApp();

export default app;