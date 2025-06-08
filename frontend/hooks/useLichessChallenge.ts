import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useTokenAccounts } from "./useTokenAccounts";
import { PROGRAM_ID } from "../config/constants";

export const useLichessChallenge = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { tokenAccount, tokenMint } = useTokenAccounts();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(
      require("../idl/gaming_challenge.json"),
      PROGRAM_ID,
      provider
    );
  }, [provider]);

  const createChallenge = async (
    wagerAmount: number,
    lichessGameId: string,
    timeControl: {
      initialTime: number;
      increment: number;
      variant: string;
    }
  ) => {
    if (!program || !wallet.publicKey || !tokenAccount) {
      throw new Error("Wallet not connected or no token account");
    }

    const [challengePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), challengePda.toBuffer()],
      program.programId
    );

    const variant = timeControl.variant.toLowerCase();
    const gameVariant =
      {
        standard: 0,
        chess960: 1,
        crazyhouse: 2,
        antichess: 3,
        atomic: 4,
        horde: 5,
        kingOfTheHill: 6,
        racingKings: 7,
        threeCheck: 8,
      }[variant] || 0;

    const tx = await program.methods
      .createChallenge(new web3.BN(wagerAmount), lichessGameId, {
        initialTime: timeControl.initialTime,
        increment: timeControl.increment,
        variant: gameVariant,
      })
      .accounts({
        challenge: challengePda,
        creator: wallet.publicKey,
        escrow: escrowPda,
        creatorTokenAccount: tokenAccount,
        tokenMint,
        tokenProgram: new PublicKey(
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        ),
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  };

  const acceptChallenge = async (challengeCreator: PublicKey) => {
    if (!program || !wallet.publicKey || !tokenAccount) {
      throw new Error("Wallet not connected or no token account");
    }

    const [challengePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), challengeCreator.toBuffer()],
      program.programId
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), challengePda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .acceptChallenge()
      .accounts({
        challenge: challengePda,
        challenger: wallet.publicKey,
        escrow: escrowPda,
        challengerTokenAccount: tokenAccount,
        tokenProgram: new PublicKey(
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        ),
      })
      .rpc();

    return tx;
  };

  const completeChallenge = async (
    challengeCreator: PublicKey,
    winner: PublicKey,
    lichessResult: {
      gameId: string;
      winner: string;
      termination: string;
      moves: string;
      signature: string;
    }
  ) => {
    if (!program || !wallet.publicKey || !tokenAccount) {
      throw new Error("Wallet not connected or no token account");
    }

    const [challengePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), challengeCreator.toBuffer()],
      program.programId
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), challengePda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .completeChallenge(winner, lichessResult)
      .accounts({
        challenge: challengePda,
        escrow: escrowPda,
        creatorTokenAccount: challengeCreator,
        challengerTokenAccount: tokenAccount,
        tokenProgram: new PublicKey(
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        ),
      })
      .rpc();

    return tx;
  };

  const cancelChallenge = async (challengeCreator: PublicKey) => {
    if (!program || !wallet.publicKey || !tokenAccount) {
      throw new Error("Wallet not connected or no token account");
    }

    const [challengePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), challengeCreator.toBuffer()],
      program.programId
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), challengePda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .cancelChallenge()
      .accounts({
        challenge: challengePda,
        creator: wallet.publicKey,
        escrow: escrowPda,
        creatorTokenAccount: tokenAccount,
        tokenProgram: new PublicKey(
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        ),
      })
      .rpc();

    return tx;
  };

  return {
    createChallenge,
    acceptChallenge,
    completeChallenge,
    cancelChallenge,
  };
};
