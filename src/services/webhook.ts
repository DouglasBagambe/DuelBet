// src/routes/webhook.ts
import { Router, Request, Response } from "express";
import { telegramService } from "../app";
import crypto from "crypto";
import { TwitterWebhookRequest } from "../types/webhook";

const router = Router();

// Telegram webhook route
router.post("/telegram", async (req: Request, res: Response) => {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Log incoming webhook data for debugging
    console.log("Received Telegram webhook:", req.body);

    await telegramService.bot.handleUpdate(req.body);
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Twitter/X webhook route
router.post("/twitter", async (req: Request, res: Response) => {
  const twitterReq = req as TwitterWebhookRequest;
  const signature = twitterReq.headers[
    "x-twitter-webhooks-signature"
  ] as string;
  const payload = JSON.stringify(twitterReq.body);

  // Verify twitter webhook signature
  const hmac = crypto.createHmac(
    "sha256",
    process.env.TWITTER_WEBHOOK_SECRET || ""
  );
  const expectedSignature = `sha256=${hmac.update(payload).digest("hex")}`;

  if (signature !== expectedSignature) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  try {
    const { event_type, data } = twitterReq.body;

    switch (event_type) {
      case "tweet_create":
        await handleTweetCreate(data);
        break;
      case "tweet_delete":
        await handleTweetDelete(data);
        break;
      default:
        console.log("Unhandled Twitter webhook event:", event_type);
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Twitter webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Tweet event handlers
const handleTweetCreate = async (data: any): Promise<void> => {
  if (data.in_reply_to_status_id) {
    // Handle replies to your challenges
    console.log("Received reply to tweet:", data);
  }
};

const handleTweetDelete = async (data: any): Promise<void> => {
  console.log("Tweet deleted:", data);
};

export default router;
