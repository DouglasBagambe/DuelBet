import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { WAGER_TOKEN_MINT } from "../config/constants";
import { toast } from "sonner";

export const useTokenAccounts = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tokenAccount, setTokenAccount] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const createTokenAccount = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      toast.error("Wallet not connected");
      return null;
    }

    try {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        WAGER_TOKEN_MINT,
        wallet.publicKey
      );

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAddress,
          wallet.publicKey,
          WAGER_TOKEN_MINT
        )
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.success("Token account created successfully!");
      return associatedTokenAddress;
    } catch (error) {
      console.error("Error creating token account:", error);
      toast.error("Failed to create token account");
      return null;
    }
  };

  const fetchTokenAccount = async () => {
    if (!wallet.publicKey) {
      setTokenAccount(null);
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const associatedTokenAddress = await getAssociatedTokenAddress(
        WAGER_TOKEN_MINT,
        wallet.publicKey
      );

      try {
        const accountInfo = await connection.getTokenAccountBalance(
          associatedTokenAddress
        );
        setTokenAccount(associatedTokenAddress);
        setBalance(Number(accountInfo.value.amount));
      } catch (error) {
        // Account doesn't exist yet, try to create it
        const newTokenAccount = await createTokenAccount();
        if (newTokenAccount) {
          setTokenAccount(newTokenAccount);
          setBalance(0);
        } else {
          setTokenAccount(null);
          setBalance(0);
        }
      }
    } catch (error) {
      console.error("Error fetching token account:", error);
      setTokenAccount(null);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.publicKey) {
      fetchTokenAccount();
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (!tokenAccount) return;

    const subscriptionId = connection.onAccountChange(
      tokenAccount,
      async () => {
        try {
          const accountInfo = await connection.getTokenAccountBalance(
            tokenAccount
          );
          setBalance(Number(accountInfo.value.amount));
        } catch (error) {
          console.error("Error updating token balance:", error);
        }
      },
      "confirmed"
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, tokenAccount]);

  return {
    tokenAccount,
    balance,
    isLoading,
    tokenMint: WAGER_TOKEN_MINT,
    createTokenAccount,
  };
};
