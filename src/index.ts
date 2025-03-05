// src/index.ts
import { startApp } from "./app";

startApp().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
