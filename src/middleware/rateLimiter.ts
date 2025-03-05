// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const lichessRateLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1, // 1 request per second (public API limit)
  message: { error: "Too many requests", details: "Try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export { rateLimit };
