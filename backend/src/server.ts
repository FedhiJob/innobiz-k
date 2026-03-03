import "dotenv/config";
import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  // Keep startup log compact and readable in local dev.
  console.log(`API listening on http://localhost:${env.PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
