// src/types/webhook.ts
import { Request } from "express";

export interface TwitterWebhookData {
  event_type: "tweet_create" | "tweet_delete";
  data: any;
}

export interface TwitterWebhookRequest extends Request {
  body: TwitterWebhookData;
}
