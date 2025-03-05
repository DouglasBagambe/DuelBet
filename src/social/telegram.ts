import { Telegraf, Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { Program, AnchorProvider, web3, Idl } from "@project-serum/anchor";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import { IDL } from "../../gaming_challenge/target/types/gaming_challenge";

dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

interface ChallengeDetails {
  creator: string;
  wagerAmount: number;
  challengeId: string;
  riotId?: string;
}

interface WinnerDetails {
  winner: string;
  amount: number;
  challengeId: string;
  stats?: {
    kills: number;
    deaths: number;
    assists: number;
  };
}

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface Match {
  id: string;
  timestamp: number;
  gameType: string;
  result: "win" | "loss";
  kills: number;
  deaths: number;
  assists: number;
}

class TelegramService {
  public bot: Telegraf;
  private channelId: string;
  private userStates: Map<number, { command: string; data: any }>;
  private connection: Connection;
  private program: Program;
  private provider: AnchorProvider;
  private wallets: Map<number, { publicKey: string | null }>;

  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN is not defined in environment variables"
      );
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || "";
    this.userStates = new Map();
    this.wallets = new Map();

    // Initialize Solana connection
    this.connection = new Connection(SOLANA_RPC_URL);

    // Set up the provider
    const wallet = new anchor.Wallet(Keypair.generate());
    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      AnchorProvider.defaultOptions()
    );

    // Initialize the program
    this.program = new Program(
      IDL as Idl,
      new PublicKey("GBUZP3faF5m8nctD6NwoC5ZCGNbq95d1g53LuR7U97FS"),
      this.provider
    );

    this.setupCommands();
  }

  private setupCommands() {
    // Set bot commands for the command menu
    this.bot.telegram.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "connect_wallet", description: "Connect your Solana wallet" },
      { command: "disconnect_wallet", description: "Disconnect your wallet" },
      {
        command: "wallet_status",
        description: "Check wallet connection status",
      },
      { command: "search_player", description: "Search for a LoL player" },
      { command: "get_matches", description: "View player's recent matches" },
      { command: "create_challenge", description: "Create a new challenge" },
      {
        command: "accept_challenge",
        description: "Accept an existing challenge",
      },
      { command: "view_challenge", description: "View challenge details" },
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
    const message = `Welcome to Catoff! 🎮

Main Commands:
/connect_wallet - Connect your Solana wallet
/wallet_status - Check your wallet connection
/search_player - Search for a player
/get_matches - Get player's match history
/create_challenge - Create a challenge
/accept_challenge - Accept a challenge
/view_challenge - View challenge details
/help - Show detailed help

Visit catoff.io for more information!`;

    await ctx.reply(message);
  }

  private async handleConnectWallet(ctx: Context) {
    if (!ctx.from) return;

    try {
      // Generate a new keypair for this user
      const userKeypair = Keypair.generate();

      // Store the public key in our wallets map
      this.wallets.set(ctx.from.id, {
        publicKey: userKeypair.publicKey.toString(),
      });

      await ctx.reply(
        `✅ Wallet connected successfully!\nAddress: ${userKeypair.publicKey.toString()}\n\nYou can now create and accept challenges.`
      );
    } catch (error) {
      await ctx.reply(
        `❌ Failed to connect wallet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
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
    if (!wallet) {
      await ctx.reply(
        "No wallet connected. Use /connect_wallet to connect one."
      );
      return;
    }

    await ctx.reply(`Connected Wallet:\nAddress: ${wallet.publicKey}`);
  }

  private async handleTextInput(ctx: Context) {
    if (!("text" in ctx.message!) || !ctx.from) return;

    const userId = ctx.from.id;
    const userState = this.userStates.get(userId);

    if (!userState) return;

    switch (userState.command) {
      case "search_player":
        await this.handleSearchPlayerInput(ctx, userId, userState);
        break;
      case "get_matches":
        await this.handleGetMatchesInput(ctx, userId, userState);
        break;
      case "create_challenge":
        await this.handleCreateChallengeInput(ctx, userId, userState);
        break;
      case "accept_challenge":
        await this.handleAcceptChallengeInput(ctx, userId);
        break;
      case "view_challenge":
        await this.handleViewChallengeInput(ctx, userId);
        break;
    }
  }

  private async handleSearchPlayer(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "search_player", data: {} });
    await ctx.reply("Please enter the game name:");
  }

  private async handleSearchPlayerInput(
    ctx: Context,
    userId: number,
    userState: { command: string; data: any }
  ) {
    if (!("text" in ctx.message!)) return;

    if (!userState.data.gameName) {
      userState.data.gameName = ctx.message.text;
      this.userStates.set(userId, userState);
      await ctx.reply("Now please enter the tagline:");
      return;
    }

    const tagLine = ctx.message.text;

    try {
      const response = await fetch(
        `${API_URL}/api/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          userState.data.gameName
        )}/${encodeURIComponent(tagLine)}`,
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404 ? "Player not found" : "Failed to find player"
        );
      }

      const player: RiotAccount = await response.json();
      await ctx.reply(
        `🎮 Player Found!\n\nName: ${player.gameName}\nTag: ${player.tagLine}\nPUUID: ${player.puuid}\n\nUse /get_matches to see recent matches`
      );
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to search player"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleGetMatches(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "get_matches", data: {} });
    await ctx.reply("Please enter the PUUID:");
  }

  private async handleGetMatchesInput(
    ctx: Context,
    userId: number,
    userState: { command: string; data: any }
  ) {
    if (!("text" in ctx.message!)) return;

    if (!userState.data.puuid) {
      userState.data.puuid = ctx.message.text;
      this.userStates.set(userId, userState);
      await ctx.reply("Now please enter the region (e.g., na1, euw1):");
      return;
    }

    const region = ctx.message.text;

    try {
      const matchIdsResponse = await fetch(
        `${API_URL}/api/lol/match/v5/matches/by-puuid/${encodeURIComponent(
          userState.data.puuid
        )}/ids?region=${encodeURIComponent(region)}`
      );

      if (!matchIdsResponse.ok) {
        throw new Error("Failed to fetch match IDs");
      }

      const matchIds = await matchIdsResponse.json();

      const recentMatches = await Promise.all(
        matchIds.slice(0, 5).map(async (matchId: string) => {
          const matchResponse = await fetch(
            `${API_URL}/api/lol/match/v5/matches/${matchId}?region=${encodeURIComponent(
              region
            )}`
          );

          if (!matchResponse.ok) {
            throw new Error(`Failed to fetch match ${matchId}`);
          }

          const matchData = await matchResponse.json();
          const participant = matchData.info.participants.find(
            (p: any) => p.puuid === userState.data.puuid
          );

          return {
            id: matchData.metadata.matchId,
            gameType: matchData.info.gameMode,
            result: participant.win ? "Victory" : "Defeat",
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            date: new Date(matchData.info.gameCreation).toLocaleDateString(),
          };
        })
      );

      const matchesMessage = recentMatches
        .map(
          (match, index) => `
Match ${index + 1}:
🎮 ${match.gameType}
📊 K/D/A: ${match.kills}/${match.deaths}/${match.assists}
🏆 Result: ${match.result}
📅 ${match.date}
          `
        )
        .join("\n");

      await ctx.reply(`Recent Matches:\n${matchesMessage}`);
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to fetch matches"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleCreateChallenge(ctx: Context) {
    if (!ctx.from) return;

    const wallet = this.wallets.get(ctx.from.id);
    if (!wallet) {
      await ctx.reply("Please connect your wallet first using /connect_wallet");
      return;
    }

    this.userStates.set(ctx.from.id, { command: "create_challenge", data: {} });
    await ctx.reply("Please enter the Riot ID (format: username#tagline):");
  }

  private async handleCreateChallengeInput(
    ctx: Context,
    userId: number,
    userState: { command: string; data: any }
  ) {
    if (!("text" in ctx.message!)) return;

    const wallet = this.wallets.get(userId);
    if (!wallet) {
      await ctx.reply("Please connect your wallet first using /connect_wallet");
      this.userStates.delete(userId);
      return;
    }

    if (!userState.data.riotId) {
      userState.data.riotId = ctx.message.text;
      this.userStates.set(userId, userState);
      await ctx.reply("Now please enter the wager amount in SOL:");
      return;
    }

    const wagerAmount = parseFloat(ctx.message.text);
    const [gameName, tagLine] = userState.data.riotId.split("#");

    try {
      const response = await fetch(
        `${API_URL}/api/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          gameName
        )}/${encodeURIComponent(tagLine)}`,
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error("Invalid LoL account");
      }

      const challenge = Keypair.generate();
      const lamports = wagerAmount * web3.LAMPORTS_PER_SOL;
      const statsHash = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256)
      );

      // Create the transaction
      const transaction = await this.program.methods
        .createChallenge(new anchor.BN(lamports), statsHash)
        .accounts({
          challenge: challenge.publicKey,
          creator: new PublicKey(wallet.publicKey!),
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const challengeId = challenge.publicKey.toString();

      await this.broadcastChallenge({
        creator: ctx.from?.username || "Anonymous",
        wagerAmount,
        challengeId,
        riotId: userState.data.riotId,
      });

      await ctx.reply(
        `🎮 Challenge Created!\n\nID: ${challengeId}\nCreator: ${ctx.from?.username}\nLoL Account: ${userState.data.riotId}\nWager: ${wagerAmount} SOL\n\nUse /accept_challenge to accept this challenge!`
      );
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to create challenge"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleAcceptChallenge(ctx: Context) {
    if (!ctx.from) return;

    const wallet = this.wallets.get(ctx.from.id);
    if (!wallet) {
      await ctx.reply("Please connect your wallet first using /connect_wallet");
      return;
    }

    this.userStates.set(ctx.from.id, { command: "accept_challenge", data: {} });
    await ctx.reply("Please enter the challenge ID:");
  }

  private async handleAcceptChallengeInput(ctx: Context, userId: number) {
    if (!("text" in ctx.message!)) return;

    const wallet = this.wallets.get(userId);
    if (!wallet) {
      await ctx.reply("Please connect your wallet first using /connect_wallet");
      this.userStates.delete(userId);
      return;
    }

    const challengeId = ctx.message.text;

    try {
      const challengePubkey = new PublicKey(challengeId);

      // Create the transaction
      const transaction = await this.program.methods
        .acceptChallenge()
        .accounts({
          challenge: challengePubkey,
          challenger: new PublicKey(wallet.publicKey!),
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      await this.announceAcceptance({
        challengeId,
        acceptor: ctx.from?.username || "Anonymous",
        riotId: "pending",
      });

      await ctx.reply(
        `🤝 Challenge Accepted!\n\nChallenge ID: ${challengeId}\nAcceptor: ${ctx.from?.username}\n\nThe match can now begin! Good luck!`
      );
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to accept challenge"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleViewChallenge(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "view_challenge", data: {} });
    await ctx.reply("Please enter the challenge ID:");
  }

  private async handleViewChallengeInput(ctx: Context, userId: number) {
    if (!("text" in ctx.message!)) return;
    const challengeId = ctx.message.text;

    try {
      const challengePubkey = new PublicKey(challengeId);
      const challengeAccount = await this.program.account.challenge.fetch(
        challengePubkey
      );

      const status = challengeAccount.isComplete
        ? "Completed"
        : challengeAccount.challenger.equals(PublicKey.default)
        ? "Open"
        : "In Progress";

      const wagerAmount =
        challengeAccount.wagerAmount.toNumber() / web3.LAMPORTS_PER_SOL;

      await ctx.reply(
        `🔍 Challenge Details (${challengeId}):\n\nCreator: ${challengeAccount.creator.toString()}\nWager Amount: ${wagerAmount} SOL\nStatus: ${status}\nCreated At: ${new Date(
          challengeAccount.createdAt.toNumber() * 1000
        ).toLocaleString()}`
      );
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to view challenge"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleHelp(ctx: Context) {
    const helpMessage = `
🎮 Catoff Bot Commands:

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

Need more help? Visit catoff.io/help`;

    await ctx.reply(helpMessage);
  }

  async broadcastChallenge(details: ChallengeDetails) {
    const message = `
🎮 New Challenge Created!

Creator: ${details.creator}
LoL Account: ${details.riotId}
Wager: ${details.wagerAmount} SOL
Challenge ID: ${details.challengeId}

Accept at: catoff.io/challenge/${details.challengeId}
Or use /accept_challenge to accept this challenge!`;

    try {
      await this.bot.telegram.sendMessage(this.channelId, message);
      return true;
    } catch (error) {
      console.error("Failed to broadcast challenge:", error);
      return false;
    }
  }

  async announceAcceptance(details: {
    challengeId: string;
    acceptor: string;
    riotId: string;
  }) {
    const message = `
🤝 Challenge Accepted!

Challenge ID: ${details.challengeId}
Acceptor: ${details.acceptor}
LoL Account: ${details.riotId}

The match can now begin! Good luck to both players!`;

    try {
      await this.bot.telegram.sendMessage(this.channelId, message);
      return true;
    } catch (error) {
      console.error("Failed to announce acceptance:", error);
      return false;
    }
  }

  async announceWinner(details: WinnerDetails) {
    const statsMessage = details.stats
      ? `\nMatch Stats:\nK/D/A: ${details.stats.kills}/${details.stats.deaths}/${details.stats.assists}`
      : "";

    const message = `
🏆 Challenge Complete!

Winner: ${details.winner}
Prize: ${details.amount} SOL
Challenge ID: ${details.challengeId}${statsMessage}

Create your own challenge at catoff.io!`;

    try {
      await this.bot.telegram.sendMessage(this.channelId, message);
      return true;
    } catch (error) {
      console.error("Failed to announce winner:", error);
      return false;
    }
  }

  async completeChallenge(
    challengeId: string,
    winner: string,
    stats: { kills: number; deaths: number; assists: number }
  ) {
    try {
      const challengePubkey = new PublicKey(challengeId);
      const winnerPubkey = new PublicKey(winner);

      // Create a dummy ZK proof (replace with actual implementation)
      const zkProof = new Uint8Array(32);

      const transaction = await this.program.methods
        .completeChallenge(winnerPubkey, zkProof)
        .accounts({
          challenge: challengePubkey,
          creator: this.provider.wallet.publicKey,
          challenger: winnerPubkey,
        })
        .transaction();

      const signature = await this.connection.sendRawTransaction(
        transaction.serialize()
      );
      await this.connection.confirmTransaction(signature);

      const challengeAccount = await this.program.account.challenge.fetch(
        challengePubkey
      );

      const wagerAmount =
        challengeAccount.wagerAmount.toNumber() / web3.LAMPORTS_PER_SOL;

      await this.announceWinner({
        winner,
        amount: wagerAmount * 2,
        challengeId,
        stats,
      });

      return true;
    } catch (error) {
      console.error("Failed to complete challenge:", error);
      return false;
    }
  }

  start() {
    this.bot.launch();
    console.log("Telegram bot started");

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  stop() {
    this.bot.stop();
  }
}

export default TelegramService;
