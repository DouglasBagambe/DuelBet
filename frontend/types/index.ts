import { PublicKey } from "@solana/web3.js";

// Player related types
export interface LichessPlayer {
  id: string; // Lichess user ID
  username: string; // Lichess username
}

// Match related types
export interface Match {
  id: string; // Lichess game ID
  timestamp: number; // Game creation or last move timestamp (e.g., createdAt or lastMoveAt)
  gameType: string; // e.g., "Bullet", "Blitz", "Rapid" (from speed)
  result: "win" | "loss" | "draw"; // Based on winner or status
  variant: string; // e.g., "Standard", "Chess960" (from variant field)
}

// Challenge related types
export interface ChallengeData {
  id: string;
  creator: string; // Solana public key
  challenger?: string; // Solana public key
  wagerAmount: number; // In SOL
  isActive: boolean;
  isComplete: boolean;
  createdAt: number;
  stats?: LichessMatchStats; // Generic stats for Lichess games
}

export interface LichessMatchStats {
  matchId: string; // Lichess game ID
  playerStats: {
    // Lichess-specific stats (e.g., moves, rating changes, or result)
    result: "win" | "loss" | "draw";
    variant: string;
    speed: string;
  };
}

export interface CreateChallengeParams {
  stats: LichessMatchStats; // Lichess-specific stats
  wagerAmount: number; // In SOL
  lichessUsername: string; // Replaced riotId with lichessUsername
}

export interface AcceptChallengeParams {
  challengeId: string;
  wagerAmount: number; // In SOL
  lichessUsername: string; // Replaced riotId with lichessUsername
}

export interface CompleteChallengeParams {
  challengeId: string;
  winner: string; // Solana public key or Lichess username, depending on your program
  stats: LichessMatchStats; // Lichess-specific stats
}

// Program related types
export interface ProgramChallenge {
  creator: PublicKey;
  wagerAmount: number; // In lamports
  statsHash: number[]; // Placeholder for Lichess stats hash (e.g., game IDs or moves)
  isActive: boolean;
  challenger: PublicKey;
  isComplete: boolean;
  createdAt: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Status types
export type ChallengeStatus =
  | "idle"
  | "creating"
  | "active"
  | "accepted"
  | "completed";
export type LoadingStatus = "idle" | "loading" | "success" | "error";

// Form related types
export interface ChallengeFormData {
  wagerAmount: number;
  matchId: string; // Lichess game ID
  opponentLichessUsername: string; // Replaced opponentRiotId with opponentLichessUsername
}

// Event types
export interface ChallengeCreatedEvent {
  challengeId: string;
  creator: string; // Solana public key
  wagerAmount: number;
  timestamp: number;
  lichessUsername: string; // Replaced riotId with lichessUsername
}

export interface ChallengeAcceptedEvent {
  challengeId: string;
  challenger: string; // Solana public key
  timestamp: number;
  lichessUsername: string; // Replaced riotId with lichessUsername
}

export interface ChallengeCompletedEvent {
  challengeId: string;
  winner: string; // Solana public key or Lichess username
  wagerAmount: number;
  timestamp: number;
  lichessUsername: string; // Added for consistency with Lichess
}

export interface Challenge {
  id: string;
  creator: string; // Solana public key
  lichessUsername: string;
  wagerAmount: number;
  challenger?: string; // Solana public key
  isComplete?: boolean;
  stats?: LichessMatchStats; // Use the existing LichessMatchStats
}
