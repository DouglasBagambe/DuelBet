import { PublicKey } from "@solana/web3.js";

// Player related types
export interface LichessPlayer {
  id: string;
  username: string;
  rating?: number;
  title?: string;
  online?: boolean;
  playing?: boolean;
  provisional?: boolean;
  patron?: boolean;
  createdAt?: number;
  seenAt?: number;
  playTime?: {
    total: number;
    tv: number;
  };
  url?: string;
  count?: {
    all: number;
    rated: number;
    ai: number;
    draw: number;
    drawH: number;
    loss: number;
    lossH: number;
    win: number;
    winH: number;
    bookmark: number;
    playing: number;
    import: number;
    me: number;
  };
  followable?: boolean;
  following?: boolean;
  blocking?: boolean;
  followsYou?: boolean;
}

// Match related types
export interface Match {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: {
      user: {
        name: string;
        title?: string;
        patron?: boolean;
        id: string;
      };
      rating: number;
      provisional?: boolean;
    };
    black: {
      user: {
        name: string;
        title?: string;
        patron?: boolean;
        id: string;
      };
      rating: number;
      provisional?: boolean;
    };
  };
  winner?: "white" | "black";
  moves: string;
  clock: {
    initial: number;
    increment: number;
    totalTime: number;
  };
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
  metadata?: string; // Optional metadata (e.g., Lichess link)
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

export type Challenge = {
  creator: string;
  challenger: string | null;
  wagerAmount: number;
  lichessGameId: string;
  timeControl: {
    initialTime: number;
    increment: number;
    variant: number;
  };
  status: number;
  winner: string | null;
  lichessResult: {
    gameId: string;
    winner: string;
    termination: string;
    moves: string;
    signature: string;
  } | null;
};

export interface LichessResult {
  gameId: string;
  winner: string;
  termination: string;
  moves: string;
  signature: string;
}

export interface TimeControl {
  initialTime: number;
  increment: number;
  variant: GameVariant;
}

export enum GameVariant {
  Standard = 0,
  Chess960 = 1,
  Crazyhouse = 2,
  Antichess = 3,
  Atomic = 4,
  Horde = 5,
  KingOfTheHill = 6,
  RacingKings = 7,
  ThreeCheck = 8,
}
