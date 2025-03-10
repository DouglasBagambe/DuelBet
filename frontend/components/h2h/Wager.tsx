// frontend/pages/wager.tsx
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Connection,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Keypair, // Importing Keypair here at the top
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import idl from "../../types/idl/wager.json";
import { RefreshCw, GamepadIcon } from "lucide-react";

const programId = new PublicKey("AQTwMgisNTeBfYyEHSXJ5m7v3xHApRNuZ3bmni6iojWj");
const DEVNET_URL = "https://api.devnet.solana.com";

export default function Wager() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [wagers, setWagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Create a proper provider that uses the wallet adapter
  const getProvider = () => {
    const connection = new Connection(DEVNET_URL, "confirmed");

    // Create a proper provider using the wallet adapter
    const provider = {
      connection,
      publicKey: publicKey || undefined,
      sendTransaction: async (
        transaction: any,
        connection: Connection,
        options: any = {}
      ) => {
        return sendTransaction(transaction, connection, options);
      },
    };

    return new AnchorProvider(connection, provider as any, {
      preflightCommitment: "confirmed",
    });
  };

  // Setup the program using the provider
  const getProgram = () => {
    const provider = getProvider();
    return new Program(idl as any, programId, provider);
  };

  const fetchWagers = async () => {
    if (!connected) return;

    try {
      const program = getProgram();
      const wagers = await program.account.wager.all();
      console.log("Fetched wagers successfully:", wagers);
      setWagers(wagers);
    } catch (err) {
      console.error("Error fetching wagers:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      });
      alert(
        "Failed to fetch wagers: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  useEffect(() => {
    if (connected) fetchWagers();
  }, [connected]);

  const createWager = async () => {
    if (!publicKey || !description || !amount) {
      console.log("Validation failed: Missing fields or wallet not connected");
      alert("Please fill in all fields and connect your wallet.");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    setLoading(true);

    try {
      const program = getProgram();
      const provider = getProvider();
      const wagerAccount = Keypair.generate();

      console.log("Creating wager with details:", {
        description,
        amount: amountValue,
        creator: publicKey.toString(),
      });

      // Convert SOL amount to lamports
      const lamports = new BN(amountValue * LAMPORTS_PER_SOL);

      // First create an instruction to transfer SOL from the user to the wager account
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: wagerAccount.publicKey,
        lamports: amountValue * LAMPORTS_PER_SOL,
      });

      // Then create the initialize wager instruction
      const initializeInstruction = await program.methods
        .initializeWager(lamports, description)
        .accounts({
          wager: wagerAccount.publicKey,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Get the latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();

      // Create a versioned transaction with both instructions
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [transferInstruction, initializeInstruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      // Sign the transaction with the wager account
      transaction.sign([wagerAccount]);

      // Send the transaction
      const signature = await sendTransaction(
        transaction,
        provider.connection,
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      console.log("Transaction sent, signature:", signature);

      // Confirm the transaction
      const confirmation = await provider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log("Transaction confirmed:", confirmation);

      alert("Wager created successfully!");
      setDescription("");
      setAmount("");
      fetchWagers();
    } catch (err) {
      console.error("Create wager error:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        details: err,
      });
      alert(
        "Failed to create wager: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptWager = async (wagerPubkey: string) => {
    if (!publicKey) {
      console.log("Validation failed: Wallet not connected");
      alert("Please connect your wallet.");
      return;
    }

    setLoading(true);

    try {
      const program = getProgram();
      const provider = getProvider();
      const wagerPublicKey = new PublicKey(wagerPubkey);

      // Get the wager account data to determine the amount
      const wagerAccount = await program.account.wager.fetch(wagerPublicKey);
      // Fix the TypeScript error by accessing with a type assertion
      const wagerAmount = (wagerAccount as any).amount.toNumber();

      console.log("Accepting wager:", {
        wagerPubkey,
        amount: wagerAmount / LAMPORTS_PER_SOL,
        challenger: publicKey.toString(),
      });

      // First create a transfer instruction to send SOL to the wager account
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: wagerPublicKey,
        lamports: wagerAmount,
      });

      // Then create the accept wager instruction
      const acceptInstruction = await program.methods
        .acceptWager()
        .accounts({
          wager: wagerPublicKey,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Get the latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();

      // Create a versioned transaction with both instructions
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [transferInstruction, acceptInstruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      // Send the transaction
      const signature = await sendTransaction(
        transaction,
        provider.connection,
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      console.log("Transaction sent, signature:", signature);

      // Confirm the transaction
      const confirmation = await provider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log("Transaction confirmed:", confirmation);

      alert("Wager accepted successfully!");
      fetchWagers();
    } catch (err) {
      console.error("Accept wager error:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        details: err,
      });
      alert(
        "Failed to accept wager: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const completeWager = async (wagerPubkey: string, winnerPubkey: string) => {
    if (!publicKey) {
      alert("Please connect your wallet.");
      return;
    }
    setLoading(true);

    try {
      const program = getProgram();
      const provider = getProvider();

      const instruction = await program.methods
        .completeWager(new PublicKey(winnerPubkey))
        .accounts({
          wager: new PublicKey(wagerPubkey),
          winner: new PublicKey(winnerPubkey),
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [instruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      const signature = await sendTransaction(transaction, provider.connection);
      await provider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      alert("Wager completed! Signature: " + signature);
      fetchWagers();
    } catch (err) {
      console.error("Complete wager error:", err);
      alert(
        "Failed to complete wager: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWagers();
  };

  // Function to display wager status
  const renderWagerStatus = (wager: any) => {
    if (wager.account.is_complete) {
      return <p className="text-gray-500">Completed</p>;
    } else if (
      wager.account.challenger.toString() !== PublicKey.default.toString()
    ) {
      return <p className="text-yellow-500 font-medium">Duel in progress!</p>;
    } else {
      return (
        <button
          onClick={() => acceptWager(wager.publicKey.toString())}
          disabled={loading || !connected}
          className="mt-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-medium py-2 px-4 rounded-lg"
        >
          {loading ? "Accepting..." : "Accept Wager"}
        </button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GamepadIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              Duel Dashboard
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Wager */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Create a Wager
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Arsenal beats Chelsea"
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in SOL"
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
              />
              <button
                onClick={createWager}
                disabled={loading || !connected}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium py-3 rounded-lg"
              >
                {loading ? "Creating..." : "Create Wager"}
              </button>
            </div>
          </div>

          {/* Available Wagers */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Open Wagers</h3>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-gray-400 hover:text-white transition-colors disabled:text-gray-600"
                title="Refresh Wagers"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            {wagers.length > 0 ? (
              wagers.map((wager) => (
                <div
                  key={wager.publicKey.toString()}
                  className="p-4 bg-gray-700 rounded-lg mb-4"
                >
                  <p className="text-gray-300">{wager.account.description}</p>
                  <p className="text-gray-400">
                    Amount:{" "}
                    {(wager.account.amount / LAMPORTS_PER_SOL).toString()} SOL
                  </p>
                  {renderWagerStatus(wager)}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No open wagers yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
