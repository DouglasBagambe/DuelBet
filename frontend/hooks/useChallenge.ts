// frontend/hooks/useChallenge.ts
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { useProgram } from "./useProgram";
import {
  CreateChallengeParams,
  AcceptChallengeParams,
  CompleteChallengeParams,
  ChallengeStatus,
  Challenge,
  LichessMatchStats,
} from "@/types";

// export interface CreateChallengeParams {
//   wagerAmount: number;
//   lichessUsername: string;
//   metadata?: string; // Optional metadata (e.g., Lichess link)
//   stats?: LichessMatchStats;
// }

export const useChallenge = () => {
  const wallet = useWallet();
  const { program } = useProgram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeStatus, setChallengeStatus] =
    useState<ChallengeStatus>("idle");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const createChallenge = async ({
    wagerAmount,
    lichessUsername,
    metadata = "", // Default empty string if not provided
    stats,
  }: CreateChallengeParams) => {
    if (!wallet.connected || !program) {
      setError("Wallet not connected");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setChallengeStatus("creating");

      const challengeKeypair = PublicKey.unique();
      const statsHash = new Uint8Array(32);
      if (stats?.matchId) {
        const hash = require("@solana/web3.js").hash(stats.matchId);
        statsHash.set(hash.slice(0, 32));
      }

      const createChallengeIx = await program.methods
        .createChallenge(wagerAmount, statsHash, metadata) // Pass metadata
        .accounts({
          challenge: challengeKeypair,
          creator: wallet.publicKey!,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const transaction = new Transaction().add(createChallengeIx);
      const signature = await wallet.sendTransaction(
        transaction,
        program.provider.connection
      );
      await program.provider.connection.confirmTransaction(
        signature,
        "confirmed"
      );
      console.log("Challenge created, signature:", signature);

      const newChallenge: Challenge = {
        id: challengeKeypair.toString(),
        creator: wallet.publicKey!.toString(),
        lichessUsername,
        wagerAmount,
        isComplete: false,
        isActive: true,
        challenger: PublicKey.default.toString(),
        createdAt: Date.now() / 1000,
        metadata, // Store metadata locally
        stats: stats || {
          matchId: "",
          playerStats: {
            result: "draw",
            variant: "Standard",
            speed: "Unknown",
          },
        },
      };
      setChallenges((prev) => [...prev, newChallenge]);
      await getChallenges(); // Fetch updated on-chain list
      return challengeKeypair.toString();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create challenge"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getChallenges = async () => {
    if (!wallet.connected || !program) {
      setError("Wallet not connected");
      return [];
    }

    const now = Date.now();
    if (now - lastFetch < 10000) {
      console.log("Rate limit hit, skipping fetch");
      return challenges;
    }

    try {
      setLoading(true);
      const allChallenges = await program.account.challenge.all();
      console.log("Raw on-chain challenges:", allChallenges);

      const challengeList = allChallenges.map((account) => ({
        id: account.publicKey.toString(),
        creator: account.account.creator.toString(),
        lichessUsername: "", // Still managed in frontend for now
        wagerAmount: account.account.wagerAmount.toNumber() / 1e9,
        isComplete: account.account.isComplete,
        isActive: account.account.isActive,
        challenger: account.account.challenger.toString(),
        createdAt: account.account.createdAt.toNumber(),
        metadata: account.account.metadata, // Fetch metadata
        stats: {
          matchId: "",
          playerStats: {
            result: "draw" as "draw" | "win" | "loss",
            variant: "Standard",
            speed: "Unknown",
          },
        },
      }));
      setChallenges(challengeList);
      setLastFetch(now);
      console.log("Fetched challenges:", challengeList);
      return challengeList;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch challenges"
      );
      return challenges;
    } finally {
      setLoading(false);
    }
  };

  const acceptChallenge = async ({ challengeId }: AcceptChallengeParams) => {
    if (!wallet.connected || !program) {
      setError("Wallet not connected");
      return false;
    }

    try {
      setLoading(true);
      const acceptChallengeIx = await program.methods
        .acceptChallenge()
        .accounts({
          challenge: new PublicKey(challengeId),
          challenger: wallet.publicKey!,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const transaction = new Transaction().add(acceptChallengeIx);
      const signature = await wallet.sendTransaction(
        transaction,
        program.provider.connection
      );
      await program.provider.connection.confirmTransaction(signature);
      console.log("Challenge accepted, signature:", signature);
      await getChallenges();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept challenge"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async ({
    challengeId,
    winner,
    stats,
  }: CompleteChallengeParams) => {
    if (!wallet.connected || !program) {
      setError("Wallet not connected");
      return false;
    }

    try {
      setLoading(true);
      const zkProof = Buffer.from("1-0"); // Placeholder, adjust based on actual game result
      const completeChallengeIx = await program.methods
        .completeChallenge(new PublicKey(winner), zkProof)
        .accounts({
          challenge: new PublicKey(challengeId),
          creator: wallet.publicKey!, // Adjust if challenger completes
          challenger: wallet.publicKey!,
        })
        .instruction();

      const transaction = new Transaction().add(completeChallengeIx);
      const signature = await wallet.sendTransaction(
        transaction,
        program.provider.connection
      );
      await program.provider.connection.confirmTransaction(signature);
      console.log("Challenge completed, signature:", signature);
      await getChallenges();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete challenge"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) getChallenges();
  }, [wallet.connected]);

  return {
    createChallenge,
    acceptChallenge,
    completeChallenge,
    getChallenges,
    loading,
    error,
    challengeStatus,
    challenges,
  };
};
