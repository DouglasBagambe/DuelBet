//src/app.ts

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import axios, { AxiosError } from "axios";
import WebSocketService from "./services/websocket";
import riotRoutes from "./routes/riot";
import socialRoutes from "./routes/social";
import webhookRouter from "./services/webhook";
import TelegramService from "./social/telegram";
import TwitterService from "./social/x";
import { RiotAPIError, RIOT_ERROR_CODES } from "./utils/errors";

dotenv.config();

// Cache Service Implementation
class CacheService {
  private cache: Map<string, { value: any; expiry?: number }>;
  private static _instance: CacheService;

  private constructor() {
    this.cache = new Map();
  }

  static get instance(): CacheService {
    if (!this._instance) {
      this._instance = new CacheService();
    }
    return this._instance;
  }

  set<T>(key: string, value: T, expirationInSeconds: number = 3600): void {
    const expiry =
      expirationInSeconds > 0
        ? Date.now() + expirationInSeconds * 1000
        : undefined;
    this.cache.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  isReady(): boolean {
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

// RiotAPI class updates for app.ts

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface ActiveShard {
  puuid: string;
  game: string;
  activeShard: string;
}

interface MatchSummary {
  matchId: string;
  timestamp: number;
  gameType: string;
  kills: number;
  deaths: number;
  assists: number;
  result: "win" | "loss";
}

class RiotAPI {
  private static readonly RIOT_API_KEY = process.env.RIOT_API_KEY;
  private static readonly REGION_BASE_URL = "https://europe.api.riotgames.com";
  private static readonly cacheService = CacheService.instance;

  private static handleError(error: unknown): never {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      const message =
        RIOT_ERROR_CODES[status as keyof typeof RIOT_ERROR_CODES] ||
        "Unknown error";
      throw new RiotAPIError(
        status,
        message,
        error.response.data?.status?.message
      );
    }

    if (error instanceof Error) {
      throw new RiotAPIError(500, error.message);
    }

    throw new RiotAPIError(500, "Unknown error occurred");
  }

  private static async makeRequest<T>(
    url: string,
    cacheDuration?: number
  ): Promise<T> {
    if (!this.RIOT_API_KEY) {
      throw new RiotAPIError(500, "RIOT_API_KEY is not configured");
    }

    const cacheKey = `riot:${url}`;
    const cachedData = this.cacheService.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get<T>(url, {
        headers: {
          "X-Riot-Token": this.RIOT_API_KEY,
        },
      });

      if (cacheDuration) {
        this.cacheService.set(cacheKey, response.data, cacheDuration);
      }

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getAccountByRiotId(
    gameName: string,
    tagLine: string
  ): Promise<RiotAccount> {
    if (!gameName || !tagLine) {
      throw new RiotAPIError(400, "Game name and tag line are required");
    }

    const url = `${
      this.REGION_BASE_URL
    }/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;
    return this.makeRequest<RiotAccount>(url, 3600); // Cache for 1 hour
  }

  static async getAccountByPuuid(puuid: string): Promise<RiotAccount> {
    if (!puuid) {
      throw new RiotAPIError(400, "PUUID is required");
    }

    const url = `${this.REGION_BASE_URL}/riot/account/v1/accounts/by-puuid/${puuid}`;
    return this.makeRequest<RiotAccount>(url, 3600);
  }

  static async getActiveShard(
    game: string,
    puuid: string
  ): Promise<ActiveShard> {
    if (!game || !puuid) {
      throw new RiotAPIError(400, "Game and PUUID are required");
    }

    const url = `${this.REGION_BASE_URL}/riot/account/v1/active-shards/by-game/${game}/by-puuid/${puuid}`;
    return this.makeRequest<ActiveShard>(url, 3600);
  }

  static async clearCache(key: string): Promise<void> {
    await this.cacheService.delete(`riot:${key}`);
  }

  private static readonly ROUTING_VALUES = {
    AMERICAS: ["NA", "BR", "LAN", "LAS"],
    ASIA: ["KR", "JP"],
    EUROPE: ["EUNE", "EUW", "ME1", "TR", "RU"],
    SEA: ["OCE", "PH2", "SG2", "TH2", "TW2", "VN2"],
  };

  // Determine correct routing value based on region
  private static getRoutingValue(region: string): string {
    for (const [routing, regions] of Object.entries(this.ROUTING_VALUES)) {
      if (regions.includes(region.toUpperCase())) {
        return routing.toLowerCase();
      }
    }
    return "europe"; // Default to europe if no match found
  }

  private static getMatchBaseUrl(region: string): string {
    const routing = this.getRoutingValue(region);
    return `https://${routing}.api.riotgames.com`;
  }

  // Get match IDs for a player
  static async getMatchIds(
    puuid: string,
    region: string,
    count: number = 10
  ): Promise<string[]> {
    if (!puuid) {
      throw new RiotAPIError(400, "PUUID is required");
    }

    const baseUrl = this.getMatchBaseUrl(region);
    const url = `${baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    return this.makeRequest<string[]>(url, 300); // Cache for 5 minutes
  }

  // Get match details
  static async getMatchDetails(matchId: string, region: string): Promise<any> {
    if (!matchId) {
      throw new RiotAPIError(400, "Match ID is required");
    }

    const baseUrl = this.getMatchBaseUrl(region);
    const url = `${baseUrl}/lol/match/v5/matches/${matchId}`;
    return this.makeRequest<any>(url, 3600); // Cache for 1 hour
  }

  // Get match timeline
  static async getMatchTimeline(matchId: string, region: string): Promise<any> {
    if (!matchId) {
      throw new RiotAPIError(400, "Match ID is required");
    }

    const baseUrl = this.getMatchBaseUrl(region);
    const url = `${baseUrl}/lol/match/v5/matches/${matchId}/timeline`;
    return this.makeRequest<any>(url, 3600); // Cache for 1 hour
  }

  // Get match summaries with proper regional routing
  static async getMatchSummaries(
    puuid: string,
    region: string,
    count: number = 10
  ): Promise<MatchSummary[]> {
    const matchIds = await this.getMatchIds(puuid, region, count);

    const matchPromises = matchIds.map(async (matchId) => {
      const match = await this.getMatchDetails(matchId, region);

      // Find the participant data for the requested player
      const participant = match.info.participants.find(
        (p: any) => p.puuid === puuid
      );

      if (!participant) {
        throw new RiotAPIError(404, "Player not found in match");
      }

      return {
        matchId: match.metadata.matchId,
        timestamp: match.info.gameStartTimestamp,
        gameType: match.info.gameMode,
        result: participant.win ? "win" : ("loss" as "win" | "loss"),
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        championName: participant.championName,
      };
    });

    return Promise.all(matchPromises);
  }
}

// Preview Service Implementation
class PreviewService {
  private static instance: PreviewService | null = null;
  private cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.instance;
  }

  public static getInstance(): PreviewService {
    if (!PreviewService.instance) {
      PreviewService.instance = new PreviewService();
    }
    return PreviewService.instance;
  }

  public async initialize(): Promise<void> {
    // Add initialization logic here if needed
  }

  public async cleanup(): Promise<void> {
    // Add cleanup logic here if needed
  }

  public async generatePreview(data: any): Promise<void> {
    try {
      await this.cacheService.set(`preview:${data.id}`, data);
    } catch (error) {
      console.error("Error generating preview:", error);
      throw error;
    }
  }

  public async getPreviewData(
    cacheKey: string,
    fetchDataFn: () => Promise<any>
  ): Promise<any> {
    try {
      const cachedData = this.cacheService.get<any>(cacheKey);
      if (cachedData) {
        console.log("Cache hit:", cacheKey);
        return cachedData;
      }

      console.log("Cache miss:", cacheKey);
      const data = await fetchDataFn();
      this.cacheService.set(cacheKey, data, 3600);
      return data;
    } catch (error) {
      console.error("Error in getPreviewData:", error);
      throw error;
    }
  }
}

// Express App Setup
const app = express();
const port = process.env.PORT || 3001;

// Service instances
let telegramService: TelegramService;
let twitterService: TwitterService;
let previewService: PreviewService;
const cacheService = CacheService.instance;

// Basic middleware setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${Date.now() - start}ms`,
    });
  });
  next();
});

// Initialize all services and start server
const startApp = async () => {
  try {
    previewService = PreviewService.getInstance();
    await previewService.initialize();
    telegramService = new TelegramService();
    twitterService = new TwitterService();
    telegramService.start();

    // Mount routes
    app.use("/api", riotRoutes);
    app.use("/api/preview", (req, res) => {
      res.json({ message: "Preview endpoint" });
    });
    app.use("/api/social", socialRoutes);
    app.use("/webhook", webhookRouter);

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          telegram: "running",
          twitter: "running",
          preview: "running",
          cache: "running",
        },
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Create and start server
    const server = http.createServer(app);
    new WebSocketService(server);

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Cleanup function
    const cleanup = async () => {
      try {
        if (telegramService) telegramService.stop();
        if (previewService) await previewService.cleanup();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };

    // Error handlers
    process.on("uncaughtException", async (error) => {
      console.error("Uncaught Exception:", error);
      await cleanup();
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason) => {
      console.error("Unhandled Rejection:", reason);
      await cleanup();
      process.exit(1);
    });

    process.on("SIGTERM", async () => {
      console.log("SIGTERM received");
      await cleanup();
      process.exit(0);
    });

    return server;
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

export { startApp, app, CacheService, PreviewService, RiotAPI };
