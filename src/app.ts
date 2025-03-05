import express, { NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import axios, { AxiosError } from "axios";
import WebSocketService from "./services/websocket";
import lichessRoutes from "./routes/lichess";
import socialRoutes from "./routes/social";
import webhookRouter from "./services/webhook";
import TelegramService from "./social/telegram";
import { Request, Response } from "express";

dotenv.config();

interface LichessUser {
  id: string;
  username: string;
}

interface LichessGame {
  id: string;
  variant: string;
  createdAt: number;
  winner?: "white" | "black";
  players: { white: { user: { id: string } }; black: { user: { id: string } } };
}

class LichessAPI {
  private static readonly BASE_URL = "https://lichess.org/api";
  private static readonly API_TOKEN = process.env.LICHESS_API_TOKEN;

  private static handleError(error: unknown): never {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        `API Error ${error.response.status}: ${
          error.response.data?.error || "Unknown"
        }`
      );
    }
    throw new Error("Unknown error");
  }

  static async getUser(username: string): Promise<LichessUser> {
    const url = `${this.BASE_URL}/user/${encodeURIComponent(username)}`;
    try {
      const headers = this.API_TOKEN
        ? { Authorization: `Bearer ${this.API_TOKEN}` }
        : {};
      const response = await axios.get<LichessUser>(url, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getUserGames(
    username: string,
    max: number = 5
  ): Promise<LichessGame[]> {
    const url = `${this.BASE_URL}/games/user/${encodeURIComponent(
      username
    )}?max=${max}`;
    try {
      const headers = this.API_TOKEN
        ? { Authorization: `Bearer ${this.API_TOKEN}` }
        : {};
      const response = await axios.get<LichessGame[]>(url, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getGameDetails(gameId: string): Promise<LichessGame> {
    const url = `${this.BASE_URL}/game/export/${encodeURIComponent(gameId)}`;
    try {
      const headers = this.API_TOKEN
        ? { Authorization: `Bearer ${this.API_TOKEN}` }
        : {};
      const response = await axios.get<LichessGame>(url, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

const app = express();
const port = process.env.PORT || 3001;

export let telegramService: TelegramService;

const startApp = async () => {
  try {
    telegramService = new TelegramService();
    telegramService.start();

    app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/api", lichessRoutes);
    app.use("/api/social", socialRoutes);
    app.use("/webhook", webhookRouter);

    app.use(
      "/api/preview",
      (req, res) => res.json({ message: "Preview endpoint" }) as any
    );
    app.get(
      "/api/health",
      (req, res) =>
        res.json({ status: "ok", timestamp: new Date().toISOString() }) as any
    );

    const server = http.createServer(app);
    new WebSocketService(server);

    server.listen(port, () => console.log(`Server running on port ${port}`));

    process.on("SIGTERM", () => {
      telegramService.stop();
      process.exit(0);
    });

    return server;
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

app.use(
  (err: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

export { startApp, app, LichessAPI };
