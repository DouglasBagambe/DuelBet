//src/hooks/useChallenge.ts

import { useState } from "react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./useProgram";
import {
  CreateChallengeParams,
  AcceptChallengeParams,
  CompleteChallengeParams,
  ChallengeStatus,
} from "@/types";

export const useChallenge = () => {
  const wallet = useWallet();
  const { program } = useProgram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeStatus, setChallengeStatus] =
    useState<ChallengeStatus>("idle");
  const [challengeAccount, setChallengeAccount] = useState<string>("");

  const createChallenge = async ({
    stats,
    wagerAmount,
    riotId,
  }: CreateChallengeParams) => {
    if (!wallet.connected || !program) {
      setError("Wallet not connected");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setChallengeStatus("creating");

      const statsHash = new Uint8Array(32).fill(1); // TODO: Implement proper stats hashing
      const challengeKeypair = new PublicKey(challengeAccount);

      const createChallengeIx = await program.methods
        .createChallenge(new PublicKey(wagerAmount), statsHash)
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

      await program.provider.connection.confirmTransaction(signature);
      setChallengeStatus("active");
      setChallengeAccount(challengeKeypair.toString());

      return challengeKeypair.toString();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create challenge"
      );
      setChallengeStatus("idle");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const acceptChallenge = async ({
    challengeId,
    wagerAmount,
    riotId,
  }: AcceptChallengeParams) => {
    if (!wallet.connected || !program) {
      setError("Wallet not connected");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

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
      setChallengeStatus("accepted");
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
      setError(null);

      const zkProof = new Uint8Array(32).fill(0); // TODO: Implement proper ZK proof generation

      const completeChallengeIx = await program.methods
        .completeChallenge(new PublicKey(winner), zkProof)
        .accounts({
          challenge: new PublicKey(challengeId),
          creator: wallet.publicKey!,
          challenger: wallet.publicKey!,
        })
        .instruction();

      const transaction = new Transaction().add(completeChallengeIx);
      const signature = await wallet.sendTransaction(
        transaction,
        program.provider.connection
      );

      await program.provider.connection.confirmTransaction(signature);
      setChallengeStatus("completed");
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

  return {
    createChallenge,
    acceptChallenge,
    completeChallenge,
    loading,
    error,
    challengeStatus,
    challengeAccount,
  };
};
