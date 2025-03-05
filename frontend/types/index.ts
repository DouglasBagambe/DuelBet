import { PublicKey } from "@solana/web3.js";

// Player related types
export interface PlayerData {
  puuid: string;
  gameName: string;
  tagLine: string;
  accountId: string;
  profileIconId: number;
  summonerLevel: number;
  revisionDate?: number;
}

// Match related types
export interface MatchParticipant {
  puuid: string;
  participantId: number;
  championId: number;
  summonerName: string;
  teamId: number;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
}

export interface MatchData {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  participants: MatchParticipant[];
  queueId: number;
  platformId: string;
}

export interface MatchListResponse {
  matches: string[];
  totalGames: number;
  startIndex: number;
  endIndex: number;
}

// Challenge related types
export interface ChallengeData {
  id: string;
  creator: string;
  challenger?: string;
  wagerAmount: number;
  isActive: boolean;
  isComplete: boolean;
  createdAt: number;
  stats?: MatchStats;
}

export interface MatchStats {
  matchId: string;
  playerStats: {
    kills: number;
    deaths: number;
    assists: number;
    championId: number;
    win: boolean;
  };
}

export interface CreateChallengeParams {
  stats: MatchStats;
  wagerAmount: number;
  riotId: string;
}

export interface AcceptChallengeParams {
  challengeId: string;
  wagerAmount: number;
  riotId: string;
}

export interface CompleteChallengeParams {
  challengeId: string;
  winner: string;
  stats: MatchStats;
}

// Program related types
export interface ProgramChallenge {
  creator: PublicKey;
  wagerAmount: number;
  statsHash: number[];
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
  matchId: string;
  opponentRiotId: string;
}

// Event types
export interface ChallengeCreatedEvent {
  challengeId: string;
  creator: string;
  wagerAmount: number;
  timestamp: number;
}

export interface ChallengeAcceptedEvent {
  challengeId: string;
  challenger: string;
  timestamp: number;
}

export interface ChallengeCompletedEvent {
  challengeId: string;
  winner: string;
  wagerAmount: number;
  timestamp: number;
}
