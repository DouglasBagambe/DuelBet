import { useEffect, useState, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Challenge } from "../types";
import { PROGRAM_ID } from "../config/constants";

export const useChallenges = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchChallenges = async () => {
    if (!program) return;

    try {
      setIsLoading(true);
      const challengeAccounts = await program.account.challenge.all([
        {
          memcmp: {
            offset: 8, // Skip the account discriminator
            bytes: wallet.publicKey?.toBase58() || "",
          },
        },
      ]);

      const formattedChallenges = challengeAccounts.map((account) => ({
        creator: account.account.creator.toString(),
        challenger: account.account.challenger?.toString() || null,
        wagerAmount: account.account.wagerAmount.toNumber(),
        lichessGameId: account.account.lichessGameId,
        timeControl: {
          initialTime: account.account.timeControl.initialTime,
          increment: account.account.timeControl.increment,
          variant: account.account.timeControl.variant,
        },
        status: account.account.status,
        winner: account.account.winner?.toString() || null,
        lichessResult: account.account.lichessResult
          ? {
              gameId: account.account.lichessResult.gameId,
              winner: account.account.lichessResult.winner,
              termination: account.account.lichessResult.termination,
              moves: account.account.lichessResult.moves,
              signature: account.account.lichessResult.signature,
            }
          : null,
      }));

      setChallenges(formattedChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.publicKey) {
      fetchChallenges();
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (!program) return;

    const subscriptionId = program.addEventListener("ChallengeCreated", () => {
      fetchChallenges();
    });

    return () => {
      program.removeEventListener(subscriptionId);
    };
  }, [program]);

  return {
    challenges,
    isLoading,
    refresh: fetchChallenges,
  };
};
