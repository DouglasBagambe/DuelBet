// src/routes/preview.ts

import { Router } from "express";
import previewService from "../services/preview";
import RiotAPI from "../apis/riot/riot";

const router = Router();

router.get("/challenge/:id", async (req, res) => {
  try {
    const previewData = await previewService.getPreviewData(
      `challenge:${req.params.id}`,
      async () => {
        // Fetch challenge data from cache
        const challengeData = await previewService.getPreviewData(
          `challenge:${req.params.id}`,
          async () => ({ id: req.params.id, type: "challenge" })
        );
        return challengeData;
      }
    );
    res.status(200).json(previewData);
  } catch (error) {
    console.error("Error handling challenge preview request:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve challenge preview data." });
  }
});

router.get("/match/:id", async (req, res) => {
  try {
    const previewData = await previewService.getPreviewData(
      `match:${req.params.id}`,
      async () => {
        // Fetch match data using RiotAPI
        const matchData = await RiotAPI.getMatchDetails(req.params.id);
        return matchData;
      }
    );
    res.status(200).json(previewData);
  } catch (error) {
    console.error("Error handling match preview request:", error);
    res.status(500).json({ error: "Failed to retrieve match preview data." });
  }
});

export default router;
