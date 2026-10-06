import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";

async function bootstrap() {
  const app = createApp();

  await connectDB();

  app.listen(config.port, () => {
    console.log(`[server] Sky First API listening on http://localhost:${config.port}`);
  });
}

bootstrap();