// routes/riot.ts

import express from "express";
import { z } from "zod";
import { RiotAPI } from "../app";
import { riotRateLimiter } from "../middleware/rateLimiter";
import { APIError } from "../utils/errors";

const router = express.Router();

// Apply rate limiting to all routes
router.use(riotRateLimiter);

// Input validation schemas
const riotIdSchema = z.object({
  gameName: z.string().min(3).max(16),
  tagLine: z.string().min(2).max(5),
});

const puuidSchema = z.object({
  puuid: z.string().min(1),
});

const activeShardsSchema = z.object({
  game: z.string().min(1),
  puuid: z.string().min(1),
});

// Validation middleware
const validate =
  (schema: z.ZodSchema) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const data = {
        ...req.params,
        ...req.query,
      };
      await schema.parseAsync(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(
          new APIError(400, "Invalid input", "VALIDATION_ERROR", error.errors)
        );
      } else {
        next(error);
      }
    }
  };

// Routes matching Riot API endpoints
router.get(
  "/riot/account/v1/accounts/by-riot-id/:gameName/:tagLine",
  validate(riotIdSchema),
  async (req, res, next) => {
    try {
      const { gameName, tagLine } = req.params;
      const account = await RiotAPI.getAccountByRiotId(gameName, tagLine);
      res.json(account);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/riot/account/v1/accounts/by-puuid/:puuid",
  validate(puuidSchema),
  async (req, res, next) => {
    try {
      const { puuid } = req.params;
      const account = await RiotAPI.getAccountByPuuid(puuid);
      res.json(account);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/riot/account/v1/active-shards/by-game/:game/by-puuid/:puuid",
  validate(activeShardsSchema),
  async (req, res, next) => {
    try {
      const { game, puuid } = req.params;
      const shard = await RiotAPI.getActiveShard(game, puuid);
      res.json(shard);
    } catch (error) {
      next(error);
    }
  }
);

const matchQuerySchema = z.object({
  puuid: z.string().min(1),
  region: z.string().min(1),
  count: z.string().optional(),
});

// Add this route for getting match IDs
router.get(
  "/lol/match/v5/matches/by-puuid/:puuid/ids",
  validate(matchQuerySchema),
  async (req, res, next) => {
    try {
      const { puuid } = req.params;
      const region = (req.query.region as string) || "EUW";
      const count = req.query.count ? parseInt(req.query.count as string) : 10;
      const matchIds = await RiotAPI.getMatchIds(puuid, region, count);
      res.json(matchIds);
    } catch (error) {
      next(error);
    }
  }
);

// Modify the match details endpoint to match Riot's structure
router.get("/lol/match/v5/matches/:matchId", async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const region = (req.query.region as string) || "EUW";
    const match = await RiotAPI.getMatchDetails(matchId, region);
    res.json(match);
  } catch (error) {
    next(error);
  }
});

// Update the timeline endpoint to match Riot's structure
router.get(
  "/lol/match/v5/matches/:matchId/timeline",
  async (req, res, next) => {
    try {
      const { matchId } = req.params;
      const region = (req.query.region as string) || "EUW";
      const timeline = await RiotAPI.getMatchTimeline(matchId, region);
      res.json(timeline);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
