// src/apis/routes/lichess.ts
import express from "express";
import { z } from "zod";
import { LichessAPI } from "../app";
import { lichessRateLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.use(lichessRateLimiter);

const usernameSchema = z.object({
  username: z.string().min(1).max(20),
});

const gameQuerySchema = z.object({
  username: z.string().min(1),
  max: z.string().optional(),
});

const validate =
  (schema: z.ZodSchema) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const data = { ...req.params, ...req.query };
      schema.parse(data);
      next();
    } catch (error) {
      res
        .status(400)
        .json({
          error: "Invalid input",
          details: error instanceof z.ZodError ? error.errors : "Unknown",
        });
    }
  };

router.get(
  "/lichess/user/:username",
  validate(usernameSchema),
  async (req, res) => {
    try {
      const { username } = req.params;
      const user = await LichessAPI.getUser(username);
      res.json(user);
    } catch (error) {
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : "Unknown" });
    }
  }
);

router.get(
  "/lichess/games/user/:username",
  validate(gameQuerySchema),
  async (req, res) => {
    try {
      const { username } = req.params;
      const max = req.query.max ? parseInt(req.query.max as string) : 5;
      const games = await LichessAPI.getUserGames(username, max);
      res.json(games);
    } catch (error) {
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : "Unknown" });
    }
  }
);

router.get("/lichess/game/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await LichessAPI.getGameDetails(gameId);
    res.json(game);
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : "Unknown" });
  }
});

export default router;
