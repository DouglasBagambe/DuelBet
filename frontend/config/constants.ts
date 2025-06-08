import { PublicKey } from "@solana/web3.js";

// Program IDs
export const PROGRAM_ID = new PublicKey(
  "6tji6PU7Mw2jQ9p7okEi88M8Boannre5nND5mAmjB3i6"
);

// Token Configuration
// This is a test token on devnet. Replace with your actual token mint address in production
export const WAGER_TOKEN_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
); // Using SOL as a test token

// API Configuration
export const LICHESS_API_URL = "https://lichess.org/api";
export const LICHESS_WS_URL = "wss://socket.lichess.org";

// Game Configuration
export const DEFAULT_TIME_CONTROL = {
  initialTime: 600, // 10 minutes in seconds
  increment: 0,
  variant: "standard",
};

export const GAME_VARIANTS = [
  "standard",
  "chess960",
  "crazyhouse",
  "antichess",
  "atomic",
  "horde",
  "kingOfTheHill",
  "racingKings",
  "threeCheck",
] as const;
