import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@project-serum/anchor";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { IDL } from "../types/gaming_challenge";

const PROGRAM_ID = new PublicKey(
  "GBUZP3faF5m8nctD6NwoC5ZCGNbq95d1g53LuR7U97FS"
);

interface GameStats {
  kills: number;
  deaths: number;
  assists: number;
}

interface ChallengeDetails {
  creator: string;
  wagerAmount: number;
  isComplete: boolean;
  challenger: string | null;
  createdAt: Date;
}

export const useSolanaChallenge = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const getProvider = () => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }

    const provider = new AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction,
        signAllTransactions: async (txs) => {
          return Promise.all(txs.map((tx) => signTransaction(tx)));
        },
      },
      { commitment: "confirmed" }
    );

    return provider;
  };

  const getProgram = () => {
    const provider = getProvider();
    return new Program(IDL as Idl, PROGRAM_ID, provider);
  };

  const createChallenge = async (wagerAmount: number): Promise<string> => {
    try {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      if (wagerAmount <= 0) {
        throw new Error("Wager amount must be greater than 0");
      }

      const program = getProgram();
      const challenge = Keypair.generate();

      // Convert SOL to lamports
      const lamports = wagerAmount * anchor.web3.LAMPORTS_PER_SOL;

      // Generate random stats hash
      const statsHash = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256)
      );

      // First, create the challenge account and transfer the wager
      const tx = await program.methods
        .createChallenge(new anchor.BN(lamports), statsHash)
        .accounts({
          challenge: challenge.publicKey,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([challenge]) // Add the challenge keypair as a signer here
        .rpc({ commitment: "confirmed" }); // Use rpc instead of transaction

      // Return the challenge public key
      return challenge.publicKey.toString();
    } catch (error) {
      console.error("Failed to create challenge:", error);
      if (error instanceof Error) {
        // Check for specific error messages
        if (error.message.includes("0x1")) {
          throw new Error("Insufficient balance for wager amount");
        }
        throw error;
      }
      throw new Error("Failed to create challenge");
    }
  };

  const acceptChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const program = getProgram();
      const challengePubkey = new PublicKey(challengeId);

      await program.methods
        .acceptChallenge()
        .accounts({
          challenge: challengePubkey,
          challenger: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      return true;
    } catch (error) {
      console.error("Failed to accept challenge:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to accept challenge"
      );
    }
  };

  const completeChallenge = async (
    challengeId: string,
    winner: string,
    stats: GameStats
  ): Promise<boolean> => {
    try {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const program = getProgram();
      const challengePubkey = new PublicKey(challengeId);
      const winnerPubkey = new PublicKey(winner);

      const zkProof = new Uint8Array(32); // Replace with actual proof generation if needed

      await program.methods
        .completeChallenge(winnerPubkey, zkProof)
        .accounts({
          challenge: challengePubkey,
          creator: publicKey,
          challenger: winnerPubkey,
        })
        .rpc({ commitment: "confirmed" });

      return true;
    } catch (error) {
      console.error("Failed to complete challenge:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to complete challenge"
      );
    }
  };

  const getChallengeDetails = async (
    challengeId: string
  ): Promise<ChallengeDetails> => {
    try {
      if (!challengeId) {
        throw new Error("Challenge ID is required");
      }

      const program = getProgram();
      const challengePubkey = new PublicKey(challengeId);
      const account = await program.account.challenge.fetch(challengePubkey);

      return {
        creator: account.creator.toString(),
        wagerAmount:
          account.wagerAmount.toNumber() / anchor.web3.LAMPORTS_PER_SOL,
        isComplete: account.isComplete,
        challenger: account.challenger.equals(PublicKey.default)
          ? null
          : account.challenger.toString(),
        createdAt: new Date(account.createdAt.toNumber() * 1000),
      };
    } catch (error) {
      console.error("Failed to fetch challenge details:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch challenge details"
      );
    }
  };

  return {
    createChallenge,
    acceptChallenge,
    completeChallenge,
    getChallengeDetails,
  };
};
