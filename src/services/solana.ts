// src/services/solana.ts

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, Idl } from "@project-serum/anchor";
import { ZKService } from "./zk";
import { IDL } from "@project-serum/anchor/dist/cjs/native/system";

export class SolanaService {
  private static instance: SolanaService;
  private connection: Connection;
  private program: Program;
  private zkService: ZKService;

  private constructor() {
    // Initialize Solana connection
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    // Load the IDL and program
    this.program = new Program(
      IDL as Idl,
      new PublicKey(process.env.PROGRAM_ID!)
    );
    this.zkService = ZKService.getInstance();
  }

  static getInstance(): SolanaService {
    if (!SolanaService.instance) {
      SolanaService.instance = new SolanaService();
    }
    return SolanaService.instance;
  }

  async createChallenge(stats: any, wagerAmount: number, wallet: any) {
    try {
      const { proof, publicSignals } = await this.zkService.generateProof(
        stats
      );

      // Generate challenge account
      const challenge = Keypair.generate();

      const tx = await this.program.methods
        .createChallenge(
          wagerAmount,
          publicSignals[0] // statsHash
        )
        .accounts({
          challenge: challenge.publicKey,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([challenge])
        .rpc();

      return {
        challengeId: challenge.publicKey.toString(),
        transactionHash: tx,
      };
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
  }

  async acceptChallenge(challengeId: string, wallet: any) {
    try {
      const challengePubkey = new PublicKey(challengeId);

      const tx = await this.program.methods
        .acceptChallenge(challengePubkey)
        .accounts({
          challenge: challengePubkey,
          challenger: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        success: true,
        transactionHash: tx,
      };
    } catch (error) {
      console.error("Error accepting challenge:", error);
      throw error;
    }
  }

  async completeChallenge(
    challengeId: string,
    winner: string,
    stats: any,
    wallet: any
  ) {
    try {
      const { proof } = await this.zkService.generateProof(stats);
      const challengePubkey = new PublicKey(challengeId);
      const winnerPubkey = new PublicKey(winner);

      const tx = await this.program.methods
        .completeChallenge(winnerPubkey, proof)
        .accounts({
          challenge: challengePubkey,
          winner: winnerPubkey,
        })
        .rpc();

      return {
        success: true,
        transactionHash: tx,
      };
    } catch (error) {
      console.error("Error completing challenge:", error);
      throw error;
    }
  }

  async getChallengeDetails(challengeId: string) {
    try {
      const challengePubkey = new PublicKey(challengeId);
      const challenge = (await this.program.account.challenge.fetch(
        challengePubkey
      )) as any;

      return {
        creator: challenge.creator.toString(),
        wagerAmount: challenge.wagerAmount.toString(),
        isActive: challenge.isActive,
        challenger: challenge.challenger.toString(),
        isComplete: challenge.isComplete,
        createdAt: new Date(challenge.createdAt * 1000),
      };
    } catch (error) {
      console.error("Error getting challenge details:", error);
      throw error;
    }
  }
}
