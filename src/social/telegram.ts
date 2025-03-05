import { Telegraf, Context } from "telegraf";
import {
  Program,
  AnchorProvider,
  web3,
  Idl,
  Wallet as AnchorWallet,
  BN,
} from "@project-serum/anchor";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { exec } from "child_process"; // Added for curl execution
import dotenv from "dotenv";
import { IDL } from "../types/gaming_challenge";

dotenv.config();

const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const LICHESS_API_URL = "https://lichess.org/api";
const LICHESS_API_TOKEN = process.env.LICHESS_API_TOKEN;
// const TELEGRAM_API_TIMEOUT = 10000; // 10 seconds for Telegram
const LICHESS_REQUEST_TIMEOUT = 15000; // 15 seconds for Lichess

interface ChallengeDetails {
  creator: string;
  wagerAmount: number;
  challengeId: string;
  lichessUsername?: string;
}

interface WinnerDetails {
  winner: string;
  amount: number;
  challengeId: string;
  result?: string;
}

interface LichessGame {
  status: string;
  id: string;
  variant: string | { name: string };
  winner?: "white" | "black";
  players: {
    white: {
      winner: any;
      user: { id: string };
    };
    black: {
      winner: any;
      user: { id: string };
    };
  };
}

interface LichessUser {
  id: string;
  username: string;
}

// Utility to check network connectivity
async function checkNetwork(url: string): Promise<boolean> {
  try {
    await axios.head(url, { timeout: 5000 }); // Quick 5-second check
    return true;
  } catch (error) {
    console.error("Network check failed:", error);
    return false;
  }
}

// const MAX_RETRIES = 5;
// const RETRY_DELAY = 5000; // 5 seconds

// async function startBot(this: any, retryCount = 0) {
//   try {
//     await this.bot.launch({
//       dropPendingUpdates: true,
//     });
//     console.log("Bot started successfully");
//   } catch (err) {
//     console.error(`Bot failed to start (attempt ${retryCount + 1}):`, err);

//     if (
//       retryCount < MAX_RETRIES &&
//       err instanceof Error &&
//       (err as any).code === "ETIMEDOUT"
//     ) {
//       console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
//       setTimeout(() => startBot(retryCount + 1), RETRY_DELAY);
//     } else {
//       console.error("Max retries reached or non-timeout error. Exiting.");
//       process.exit(1);
//     }
//   }
// }

// startBot();

class TelegramService {
  public bot: Telegraf;
  private channelId: string;
  private userStates: Map<number, { command: string; data: any }>;
  private connection: Connection;
  private program: Program;
  private provider: AnchorProvider;
  private wallets: Map<number, { publicKey: string | null }>;

  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN)
      throw new Error("Missing TELEGRAM_BOT_TOKEN");

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
      telegram: { apiRoot: "https://api.telegram.org" },
    });
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || "";
    this.userStates = new Map();
    this.wallets = new Map();

    this.connection = new Connection(SOLANA_RPC_URL);
    const wallet = new AnchorWallet(Keypair.generate());
    this.provider = new AnchorProvider(this.connection, wallet, {});
    this.program = new Program(
      IDL as Idl,
      new PublicKey("GBUZP3faF5m8nctD6NwoC5ZCGNbq95d1g55LuR7U97FS"),
      this.provider
    );

    this.setupCommands();
  }

  // Modify the start method in your TelegramService class
  start() {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 5000; // 5 seconds

    const startBotWithRetry = async (retryCount = 0) => {
      try {
        await this.bot.launch({
          dropPendingUpdates: true,
        });
        console.log("Bot started successfully");
      } catch (err) {
        console.error(`Bot failed to start (attempt ${retryCount + 1}):`, err);

        if (retryCount < MAX_RETRIES && (err as any).code === "ETIMEDOUT") {
          console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
          setTimeout(() => startBotWithRetry(retryCount + 1), RETRY_DELAY);
        } else {
          console.error("Max retries reached or non-timeout error. Exiting.");
          process.exit(1);
        }
      }
    };

    startBotWithRetry();
  }

  private setupCommands() {
    this.bot.telegram.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "connect_wallet", description: "Connect your Solana wallet" },
      { command: "disconnect_wallet", description: "Disconnect your wallet" },
      {
        command: "wallet_status",
        description: "Check wallet connection status",
      },
      { command: "search_player", description: "Search for a Lichess player" },
      { command: "get_matches", description: "View player's recent matches" },
      { command: "create_challenge", description: "Create a new challenge" },
      {
        command: "accept_challenge",
        description: "Accept an existing challenge",
      },
      { command: "view_challenge", description: "View challenge details" },
      { command: "complete_challenge", description: "Complete a challenge" },
      { command: "help", description: "Show help message" },
    ]);

    // Command handlers
    this.bot.command("start", this.handleStart.bind(this));
    this.bot.command("connect_wallet", this.handleConnectWallet.bind(this));
    this.bot.command(
      "disconnect_wallet",
      this.handleDisconnectWallet.bind(this)
    );
    this.bot.command("wallet_status", this.handleWalletStatus.bind(this));
    this.bot.command("search_player", this.handleSearchPlayer.bind(this));
    this.bot.command("get_matches", this.handleGetMatches.bind(this));
    this.bot.command("create_challenge", this.handleCreateChallenge.bind(this));
    this.bot.command("accept_challenge", this.handleAcceptChallenge.bind(this));
    this.bot.command("view_challenge", this.handleViewChallenge.bind(this));
    this.bot.command("help", this.handleHelp.bind(this));

    this.bot.on("text", this.handleTextInput.bind(this));

    this.bot.catch((err: unknown) => {
      console.error("Telegram Bot Error:", err as Error);
    });
  }

  private async handleStart(ctx: Context) {
    const message = `Welcome to DuelBet! 🎮

Main Commands:
/connect_wallet - Connect your Solana wallet
/wallet_status - Check your wallet connection
/search_player - Search for a player
/get_matches - Get player's match history
/create_challenge - Create a challenge
/accept_challenge - Accept a challenge
/view_challenge - View challenge details
/help - Show detailed help

Visit duelbet.io for more information!`;

    await ctx.reply(message);
  }

  private async handleHelp(ctx: Context) {
    const helpMessage = `
🎮 DuelBet Bot Commands:

Wallet Commands:
/connect_wallet - Connect your Solana wallet
/disconnect_wallet - Disconnect your wallet
/wallet_status - Check wallet connection status

Game Commands:
/search_player - Search for a League of Legends player
/get_matches - View player's recent matches
/create_challenge - Create a new challenge
/accept_challenge - Accept an existing challenge
/view_challenge - View details of a specific challenge

Other Commands:
/start - Start the bot
/help - Show this help message

Need more help? Visit duelbet.io/help`;

    await ctx.reply(helpMessage);
  }

  private async handleConnectWallet(ctx: Context) {
    if (!ctx.from) return;
    const keypair = Keypair.generate();
    this.wallets.set(ctx.from.id, { publicKey: keypair.publicKey.toString() });
    await ctx.reply(`Wallet connected: ${keypair.publicKey.toString()}`);
  }

  private async handleDisconnectWallet(ctx: Context) {
    if (!ctx.from) return;

    const wallet = this.wallets.get(ctx.from.id);
    if (!wallet) {
      await ctx.reply("No wallet is currently connected.");
      return;
    }

    this.wallets.delete(ctx.from.id);
    await ctx.reply("Wallet disconnected successfully.");
  }

  private async handleWalletStatus(ctx: Context) {
    if (!ctx.from) return;
    const wallet = this.wallets.get(ctx.from.id);
    await ctx.reply(
      wallet
        ? `Wallet: ${wallet.publicKey}`
        : "No wallet connected. Use /connect_wallet."
    );
  }

  private async handleSearchPlayer(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "search_player", data: {} });
    await ctx.reply("Enter Lichess username:");
  }

  private async handleGetMatches(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "get_matches", data: {} });
    await ctx.reply("Enter Lichess username:");
  }

  private async handleCreateChallenge(ctx: Context) {
    if (!ctx.from || !this.wallets.get(ctx.from.id)) {
      await ctx.reply("Connect your wallet first with /connect_wallet");
      return;
    }
    this.userStates.set(ctx.from.id, { command: "create_challenge", data: {} });
    await ctx.reply("Enter your Lichess username:");
  }

  private async handleAcceptChallenge(ctx: Context) {
    if (!ctx.from || !this.wallets.get(ctx.from.id)) {
      await ctx.reply("Connect your wallet first with /connect_wallet");
      return;
    }
    this.userStates.set(ctx.from.id, { command: "accept_challenge", data: {} });
    await ctx.reply("Enter the challenge ID:");
  }

  private async handleCompleteChallenge(ctx: Context) {
    if (!ctx.from || !this.wallets.get(ctx.from.id)) {
      await ctx.reply("Connect your wallet first with /connect_wallet");
      return;
    }
    this.userStates.set(ctx.from.id, {
      command: "complete_challenge",
      data: {},
    });
    await ctx.reply("Enter the challenge ID:");
  }

  private async handleViewChallenge(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "view_challenge", data: {} });
    await ctx.reply("Enter the challenge ID:");
  }

  private async handleTextInput(ctx: Context) {
    if (!ctx.from || !("text" in ctx.message!)) return;
    const userId = ctx.from.id;
    const userState = this.userStates.get(userId);
    if (!userState) return;

    switch (userState.command) {
      case "search_player":
        await this.processSearchPlayer(ctx, userId, ctx.message.text);
        break;
      case "get_matches":
        await this.processGetMatches(ctx, userId, ctx.message.text);
        break;
      case "create_challenge":
        await this.processCreateChallenge(ctx, userId, ctx.message.text);
        break;
      case "accept_challenge":
        await this.processAcceptChallenge(ctx, userId, ctx.message.text);
        break;
      case "complete_challenge":
        await this.processCompleteChallenge(ctx, userId, ctx.message.text);
        break;
      case "view_challenge":
        await this.processViewChallenge(ctx, userId, ctx.message.text);
        break;
    }
  }

  private async processSearchPlayer(
    ctx: Context,
    userId: number,
    username: string
  ) {
    try {
      const isNetworkUp = await checkNetwork(LICHESS_API_URL);
      if (!isNetworkUp) {
        throw new Error(
          "Network unreachable. Check your server’s internet connection."
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
      console.log(`Fetching Lichess user: ${username}`);
      const response = await axios.get<LichessUser>(
        `${LICHESS_API_URL}/user/${encodeURIComponent(username)}`,
        {
          headers: {
            Accept: "application/json",
            ...(LICHESS_API_TOKEN && {
              Authorization: `Bearer ${LICHESS_API_TOKEN}`,
            }),
          },
          timeout: 10000, // 10-second timeout
        }
      );
      await ctx.reply(
        `Player: ${response.data.username}\nID: ${response.data.id}`
      );
    } catch (error) {
      console.error(`Search player error for ${username}:`, error);
      const axiosError = error as AxiosError;
      const message = axiosError.response?.status
        ? `HTTP ${axiosError.response.status}: ${
            axiosError.response.data || "Failed to fetch user"
          }`
        : axiosError.message;
      await ctx.reply(`Error: ${message}`);
    }
    this.userStates.delete(userId);
  }

  private async processGetMatches(
    ctx: Context,
    userId: number,
    username: string
  ) {
    try {
      const isNetworkUp = await checkNetwork(LICHESS_API_URL);
      if (!isNetworkUp) {
        throw new Error(
          "Network unreachable. Check your server’s internet connection."
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3-second delay
      console.log(`Fetching Lichess games for: ${username}`);

      // Execute the real curl command: curl -H "Accept: application/json" https://lichess.org/api/games/user/Dyson_DB?max=5
      const curlCommand = `curl -H "Accept: application/json" https://lichess.org/api/games/user/${encodeURIComponent(
        username
      )}?max=5`;
      console.log(`Executing curl command: ${curlCommand}`);

      const response = await new Promise<string>((resolve, reject) => {
        exec(curlCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Curl error: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) {
            console.error(`Curl stderr: ${stderr}`);
            reject(new Error(stderr));
            return;
          }
          resolve(stdout);
        });
      });

      const rawData = response;
      console.log("Raw Lichess response:", JSON.stringify(rawData, null, 2)); // Log for debugging

      let games: LichessGame[] = [];

      // Handle NDJSON response (newline-delimited JSON) from curl output
      if (typeof rawData === "string") {
        const lines = rawData
          .trim()
          .split("\n")
          .filter((line) => line.trim());
        games = lines
          .map((line) => {
            try {
              return JSON.parse(line) as LichessGame;
            } catch (e) {
              console.error("Error parsing game line:", e, "Line:", line);
              return null;
            }
          })
          .filter((game) => game !== null) as LichessGame[];
      } else {
        throw new Error("Invalid response format from Lichess API");
      }

      if (games.length === 0) {
        await ctx.reply("No recent games found for this user.");
        return;
      }

      // New output formatting to match your exact request
      const message = `Recent Games:\n${games
        .map(
          (g, i) =>
            `Game ${i + 1}: Standard - ${
              g.winner ? (g.winner === "white" ? "1-0" : "0-1") : "1/2-1/2"
            } (ID: ${g.id})`
        )
        .join("\n")}`;
      await ctx.reply(message);
    } catch (error) {
      console.error(`Get matches error for ${username}:`, error);
      const axiosError = error as AxiosError;
      const message = axiosError.response?.status
        ? `HTTP ${axiosError.response.status}: ${
            axiosError.response.data || "Failed to fetch games"
          }`
        : axiosError.code === "ETIMEDOUT"
        ? "Request timed out. Check your network or try again later."
        : axiosError.message;

      await ctx.reply(`Error: ${message}`);

      // Retry with exponential backoff if timeout
      if (axiosError.code === "ETIMEDOUT") {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second initial retry
        try {
          console.log(`Retrying fetch for ${username}...`);
          // Execute the real curl command again for retry
          const curlCommand = `curl -H "Accept: application/json" https://lichess.org/api/games/user/${encodeURIComponent(
            username
          )}?max=5`;
          console.log(`Executing retry curl command: ${curlCommand}`);

          const retryResponse = await new Promise<string>((resolve, reject) => {
            exec(curlCommand, (error, stdout, stderr) => {
              if (error) {
                console.error(`Curl retry error: ${error.message}`);
                reject(error);
                return;
              }
              if (stderr) {
                console.error(`Curl retry stderr: ${stderr}`);
                reject(new Error(stderr));
                return;
              }
              resolve(stdout);
            });
          });

          const retryData = retryResponse;
          console.log(
            "Raw Lichess retry response:",
            JSON.stringify(retryData, null, 2)
          ); // Log for debugging

          let retryGames: LichessGame[] = [];

          // Handle NDJSON response from retry curl output
          if (typeof retryData === "string") {
            const retryLines = retryData
              .trim()
              .split("\n")
              .filter((line) => line.trim());
            retryGames = retryLines
              .map((line) => {
                try {
                  return JSON.parse(line) as LichessGame;
                } catch (e) {
                  console.error(
                    "Error parsing retry game line:",
                    e,
                    "Line:",
                    line
                  );
                  return null;
                }
              })
              .filter((game) => game !== null) as LichessGame[];
          } else {
            throw new Error("Invalid retry response format from Lichess API");
          }

          if (retryGames.length === 0) {
            await ctx.reply("No recent games found after retry.");
            return;
          }

          // New output formatting for retry to match your exact request
          const retryMessage = `Recent Games:\n${retryGames
            .map(
              (g, i) =>
                `Game ${i + 1}: Standard - ${
                  g.winner ? (g.winner === "white" ? "1-0" : "0-1") : "1/2-1/2"
                } (ID: ${g.id})`
            )
            .join("\n")}`;
          await ctx.reply(retryMessage);
        } catch (retryError) {
          console.error(`Retry error for ${username}:`, retryError);
          const errorMessage = (retryError as Error).message;
          await ctx.reply(`Retry failed: ${errorMessage}`);
        }
      }
    }
    this.userStates.delete(userId);
  }

  private async processCreateChallenge(
    ctx: Context,
    userId: number,
    text: string
  ) {
    const wallet = this.wallets.get(userId)!;
    const userState = this.userStates.get(userId)!;

    if (!userState.data.lichessUsername) {
      userState.data.lichessUsername = text;
      this.userStates.set(userId, userState);
      await ctx.reply("Enter wager amount in SOL:");
      return;
    }

    const wagerAmount = parseFloat(text);
    try {
      const challenge = Keypair.generate();
      const lamports = wagerAmount * web3.LAMPORTS_PER_SOL;
      const statsHash = Array(32).fill(0); // Placeholder

      const tx = await this.program.methods
        .createChallenge(new BN(lamports), statsHash)
        .accounts({
          challenge: challenge.publicKey,
          creator: new PublicKey(wallet.publicKey!),
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const challengeId = challenge.publicKey.toString();
      await this.broadcastChallenge({
        creator: ctx.from!.username || "Anonymous",
        wagerAmount,
        challengeId,
        lichessUsername: userState.data.lichessUsername,
      });

      await ctx.reply(
        `Challenge Created!\nID: ${challengeId}\nWager: ${wagerAmount} SOL`
      );
    } catch (error) {
      await ctx.reply(
        `Error: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
    this.userStates.delete(userId);
  }

  private async processAcceptChallenge(
    ctx: Context,
    userId: number,
    challengeId: string
  ) {
    const wallet = this.wallets.get(userId)!;
    try {
      const tx = await this.program.methods
        .acceptChallenge()
        .accounts({
          challenge: new PublicKey(challengeId),
          challenger: new PublicKey(wallet.publicKey!),
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      await this.announceAcceptance({
        challengeId,
        acceptor: ctx.from!.username || "Anonymous",
        lichessUsername: "pending",
      });

      await ctx.reply(`Challenge Accepted!\nID: ${challengeId}`);
    } catch (error) {
      await ctx.reply(
        `Error: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
    this.userStates.delete(userId);
  }

  private async processCompleteChallenge(
    ctx: Context,
    userId: number,
    text: string
  ) {
    const wallet = this.wallets.get(userId)!;
    const userState = this.userStates.get(userId)!;

    if (!userState.data.challengeId) {
      userState.data.challengeId = text;
      this.userStates.set(userId, userState);
      await ctx.reply("Enter Lichess game ID:");
      return;
    }

    const challengeId = userState.data.challengeId;
    const gameId = text;

    try {
      const response = await axios.get<LichessGame>(
        `${LICHESS_API_URL}/game/export/${gameId}`,
        {
          headers: {
            Accept: "application/json",
            ...(LICHESS_API_TOKEN && {
              Authorization: `Bearer ${LICHESS_API_TOKEN}`,
            }),
          },
          timeout: LICHESS_REQUEST_TIMEOUT,
        }
      );
      const game = response.data;
      const result = game.winner
        ? game.winner === "white"
          ? "1-0"
          : "0-1"
        : "1/2-1/2";

      const challenge = await this.program.account.challenge.fetch(
        new PublicKey(challengeId)
      );
      const winner =
        result === "1-0"
          ? challenge.creator.toString()
          : challenge.challenger.toString();

      await this.completeChallenge(challengeId, winner, result);
      await ctx.reply(`Challenge ${challengeId} completed! Winner: ${winner}`);
    } catch (error) {
      console.error(`Complete challenge error for ${gameId}:`, error);
      const axiosError = error as AxiosError;
      const message = axiosError.response?.status
        ? `HTTP ${axiosError.response.status}: ${
            axiosError.response.data || "Failed to fetch game"
          }`
        : axiosError.message;
      await ctx.reply(`Error: ${message}`);
    }
    this.userStates.delete(userId);
  }

  private async processViewChallenge(
    ctx: Context,
    userId: number,
    challengeId: string
  ) {
    try {
      const challenge = await this.program.account.challenge.fetch(
        new PublicKey(challengeId)
      );
      const status = challenge.isComplete
        ? "Completed"
        : challenge.challenger.equals(PublicKey.default)
        ? "Open"
        : "In Progress";
      const wager = challenge.wagerAmount.toNumber() / web3.LAMPORTS_PER_SOL;
      await ctx.reply(
        `Challenge ${challengeId}:\nCreator: ${challenge.creator}\nWager: ${wager} SOL\nStatus: ${status}`
      );
    } catch (error) {
      await ctx.reply(
        `Error: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
    this.userStates.delete(userId);
  }

  async broadcastChallenge(details: ChallengeDetails) {
    const message = `New Challenge!\nCreator: ${details.creator}\nUsername: ${details.lichessUsername}\nWager: ${details.wagerAmount} SOL\nID: ${details.challengeId}`;
    await this.bot.telegram.sendMessage(this.channelId, message);
  }

  async announceAcceptance(details: {
    challengeId: string;
    acceptor: string;
    lichessUsername: string;
  }) {
    const message = `Challenge Accepted!\nID: ${details.challengeId}\nAcceptor: ${details.acceptor}`;
    await this.bot.telegram.sendMessage(this.channelId, message);
  }

  async completeChallenge(challengeId: string, winner: string, result: string) {
    const tx = await this.program.methods
      .completeChallenge(new PublicKey(winner), Buffer.from(result))
      .accounts({
        challenge: new PublicKey(challengeId),
        creator: this.provider.wallet.publicKey,
        challenger: new PublicKey(winner),
      })
      .transaction();

    const signature = await this.connection.sendRawTransaction(tx.serialize());
    await this.connection.confirmTransaction(signature);

    const challenge = await this.program.account.challenge.fetch(
      new PublicKey(challengeId)
    );
    await this.announceWinner({
      winner,
      amount: (challenge.wagerAmount.toNumber() / web3.LAMPORTS_PER_SOL) * 2,
      challengeId,
      result,
    });
  }

  async announceWinner(details: WinnerDetails) {
    const message = `Challenge Complete!\nWinner: ${details.winner}\nPrize: ${details.amount} SOL\nID: ${details.challengeId}\nResult: ${details.result}`;
    await this.bot.telegram.sendMessage(this.channelId, message);
  }

  stop() {
    this.bot.stop();
  }
}

export default TelegramService;
