// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis, { RedisKey } from "ioredis";

// Configure Redis client if you have Redis, otherwise use memory store
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Riot API rate limits
const SHORT_TERM_LIMIT = 20; // requests
const SHORT_TERM_WINDOW = 1; // seconds
const LONG_TERM_LIMIT = 100; // requests
const LONG_TERM_WINDOW = 120; // seconds

export const riotRateLimiter = rateLimit({
  store: redis
    ? new RedisStore({
        sendCommand: (command: string, ...args: (string | number | Buffer)[]) =>
          redis.call(command, ...args) as Promise<any>,
      })
    : undefined,
  windowMs: SHORT_TERM_WINDOW * 1000,
  max: SHORT_TERM_LIMIT,
  message: {
    error: "Too many requests",
    details: "Please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { rateLimit };
// Apply to riot routes in your routes file:
// Apply to riot routes in your routes file:
// import { riotRateLimiter } from "../middleware/rateLimiter";
// router.use(riotRateLimiter);
