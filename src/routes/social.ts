// src/routes/social.ts
import { Router } from "express";
import { telegramService, twitterService } from "../app";

const router = Router();

// Get recent challenges from social media
router.get("/challenges", async (req, res) => {
  try {
    const tweets = await twitterService.getChallengeTweets();
    res.json({
      success: true,
      challenges: tweets,
    });
  } catch (error) {
    console.error("Error fetching social challenges:", error);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

// Register new social media account
router.post("/register", async (req, res) => {
  try {
    const { platform, username } = req.body;

    // Add logic to link social media accounts to user profiles

    res.json({
      success: true,
      message: "Social account registered",
    });
  } catch (error) {
    console.error("Error registering social account:", error);
    res.status(500).json({ error: "Failed to register social account" });
  }
});

export default router;
