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
  Keypair,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import idl from "../../types/idl/wager.json";
import {
  RefreshCw,
  GamepadIcon,
  Plus,
  Trophy,
  Clock,
  Filter,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const programId = new PublicKey("AQTwMgisNTeBfYyEHSXJ5m7v3xHApRNuZ3bmni6iojWj");
const DEVNET_URL = "https://api.devnet.solana.com";

export default function Wager() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [creatorPick, setCreatorPick] = useState(true); // true = optionA, false = optionB
  const [eventId, setEventId] = useState(""); // e.g., match ID from TheSportsDB
  const [wagers, setWagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWager, setSelectedWager] = useState<any>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const getProvider = () => {
    const connection = new Connection(DEVNET_URL, "confirmed");
    const provider = {
      connection,
      publicKey: publicKey || undefined,
      sendTransaction,
    };
    return new AnchorProvider(connection, provider as any, {
      preflightCommitment: "confirmed",
    });
  };

  const getProgram = () => {
    const provider = getProvider();
    return new Program(idl as any, programId, provider);
  };

  const fetchWagers = async () => {
    if (!connected) return;
    try {
      console.log("Fetching wagers...");
      const program = getProgram();
      const wagers = await program.account.wager.all();
      console.log("Wagers fetched:", wagers);
      setWagers(wagers);
    } catch (err) {
      console.error("Error fetching wagers:", err);
    }
  };

  useEffect(() => {
    if (connected) fetchWagers();
  }, [connected]);

  const resetCreateForm = () => {
    setDescription("");
    setAmount("");
    setOptionA("");
    setOptionB("");
    setEventId("");
  };

  const createWager = async () => {
    if (
      !publicKey ||
      !description ||
      !amount ||
      !optionA ||
      !optionB ||
      !eventId
    ) {
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
      console.log("Creating wager...");
      const program = getProgram();
      const provider = getProvider();
      const wagerAccount = Keypair.generate();
      const lamports = new BN(amountValue * LAMPORTS_PER_SOL);

      console.log("Wager account:", wagerAccount.publicKey.toString());
      console.log("Amount in lamports:", lamports.toString());

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: wagerAccount.publicKey,
        lamports: amountValue * LAMPORTS_PER_SOL,
      });

      const initializeInstruction = await program.methods
        .initializeWager(
          lamports,
          description,
          optionA,
          optionB,
          creatorPick,
          eventId
        )
        .accounts({
          wager: wagerAccount.publicKey,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [transferInstruction, initializeInstruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([wagerAccount]);

      const signature = await sendTransaction(
        transaction,
        provider.connection,
        { skipPreflight: false, maxRetries: 3 }
      );
      console.log("Transaction sent:", signature);

      await provider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      console.log("Transaction confirmed");

      alert("Wager created successfully!");
      resetCreateForm();
      fetchWagers();
    } catch (err) {
      console.error("Error creating wager:", err);
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
      alert("Please connect your wallet.");
      return;
    }
    setLoading(true);
    try {
      console.log("Accepting wager:", wagerPubkey);
      const program = getProgram();
      const provider = getProvider();
      const wagerPublicKey = new PublicKey(wagerPubkey);
      const wagerAccount = await program.account.wager.fetch(wagerPublicKey);
      const wagerAmount = (wagerAccount as any).amount.toNumber();

      console.log("Wager amount:", wagerAmount / LAMPORTS_PER_SOL, "SOL");

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: wagerPublicKey,
        lamports: wagerAmount,
      });

      const acceptInstruction = await program.methods
        .acceptWager()
        .accounts({
          wager: wagerPublicKey,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [transferInstruction, acceptInstruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const signature = await sendTransaction(
        transaction,
        provider.connection,
        { skipPreflight: false, maxRetries: 3 }
      );
      console.log("Accept transaction sent:", signature);

      await provider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      console.log("Accept transaction confirmed");

      alert("Wager accepted successfully!");
      fetchWagers();
      setSelectedWager(null);
    } catch (err) {
      console.error("Error accepting wager:", err);
      alert(
        "Failed to accept wager: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const completeWager = async (wagerPubkey: string, result: number) => {
    if (!publicKey) {
      alert("Please connect your wallet.");
      return;
    }
    setLoading(true);
    try {
      console.log("Completing wager:", wagerPubkey, "with result:", result);
      const program = getProgram();
      const provider = getProvider();
      const wagerPublicKey = new PublicKey(wagerPubkey);

      const instruction = await program.methods
        .completeWager(result) // 0 = draw, 1 = optionA, 2 = optionB
        .accounts({
          wager: wagerPublicKey,
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
      console.log("Sending complete transaction...");
      const signature = await sendTransaction(
        transaction,
        provider.connection,
        { skipPreflight: false, maxRetries: 3 }
      );

      console.log("Complete transaction sent:", signature);

      await provider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      console.log("Complete transaction confirmed");

      alert("Wager completed! Signature: " + signature);
      fetchWagers();
      setIsCompleteDialogOpen(false);
      setSelectedWager(null);
    } catch (err) {
      console.error("Error completing wager:", err);
      alert(
        "Failed to complete wager: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const withdrawWinnings = async (wagerPubkey: string) => {
    if (!publicKey) {
      alert("Please connect your wallet.");
      return;
    }
    setLoading(true);
    try {
      console.log("Withdrawing from wager:", wagerPubkey);
      const program = getProgram();
      const provider = getProvider();
      const wagerPublicKey = new PublicKey(wagerPubkey);

      const instruction = await program.methods
        .withdraw()
        .accounts({
          wager: wagerPublicKey,
          user: publicKey,
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
      const signature = await sendTransaction(
        transaction,
        provider.connection,
        { skipPreflight: false, maxRetries: 3 }
      );

      console.log("Withdraw transaction sent:", signature);

      await provider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      console.log("Withdraw transaction confirmed");

      alert("Winnings withdrawn! Signature: " + signature);
      fetchWagers();
      setSelectedWager(null);
    } catch (err) {
      console.error("Error withdrawing winnings:", err);
      alert(
        "Failed to withdraw: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const getWagerStatusIcon = (wager: any) => {
    if (wager.account.is_complete) {
      return <Trophy className="w-5 h-5 text-green-400" />;
    } else if (
      wager.account.challenger.toString() !== PublicKey.default.toString()
    ) {
      return <Clock className="w-5 h-5 text-yellow-400" />;
    } else {
      return <GamepadIcon className="w-5 h-5 text-purple-400" />;
    }
  };

  const getWagerStatusText = (wager: any) => {
    if (wager.account.is_complete) {
      // Get result text
      switch (wager.account.result) {
        case 0:
          return "Draw";
        case 1:
          return `${wager.account.option_a} won`;
        case 2:
          return `${wager.account.option_b} won`;
        default:
          return "Unknown result";
      }
    } else if (
      wager.account.challenger.toString() !== PublicKey.default.toString()
    ) {
      return "In Progress";
    } else {
      return "Open";
    }
  };

  // Helper function to determine what category a wager falls into
  const getWagerCategory = (wager: any) => {
    if (wager.account.is_complete) {
      return "closed";
    } else if (
      wager.account.challenger.toString() !== PublicKey.default.toString()
    ) {
      return "in-progress";
    } else {
      return "open";
    }
  };

  // Filter wagers based on the active tab
  const getFilteredWagers = () => {
    if (activeTab === "all") {
      return wagers;
    }
    return wagers.filter((wager) => getWagerCategory(wager) === activeTab);
  };

  // Function to determine if user can withdraw from a wager
  const userCanWithdraw = (wager: any) => {
    if (!publicKey || !wager.account.is_complete) return false;

    const creatorWithdrawn = wager.account.creator_withdrawn;
    const challengerWithdrawn = wager.account.challenger_withdrawn;
    const creatorPaid = wager.account.creator_paid;
    const challengerPaid = wager.account.challenger_paid;

    return (
      (publicKey.toString() === wager.account.creator.toString() &&
        creatorPaid &&
        !creatorWithdrawn) ||
      (publicKey.toString() === wager.account.challenger.toString() &&
        challengerPaid &&
        !challengerWithdrawn)
    );
  };

  // Function to render action buttons in the wager details dialog
  const renderWagerActions = (wager: any) => {
    if (wager.account.is_complete) {
      if (userCanWithdraw(wager)) {
        return (
          <button
            onClick={() => withdrawWinnings(wager.publicKey.toString())}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
            disabled={loading}
          >
            {loading ? "Processing..." : "Withdraw Winnings"}
          </button>
        );
      } else {
        return <p className="text-gray-400">No actions available</p>;
      }
    } else if (
      wager.account.challenger.toString() !== PublicKey.default.toString()
    ) {
      return (
        <AlertDialog
          open={isCompleteDialogOpen}
          onOpenChange={setIsCompleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium">
              Complete Duel
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border border-gray-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Select Winner</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Select the outcome of this duel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => completeWager(wager.publicKey.toString(), 1)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                disabled={loading}
              >
                {wager.account.option_a} Wins
              </button>
              <button
                onClick={() => completeWager(wager.publicKey.toString(), 2)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium"
                disabled={loading}
              >
                {wager.account.option_b} Wins
              </button>
            </div>
            <button
              onClick={() => completeWager(wager.publicKey.toString(), 0)}
              className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
              disabled={loading}
            >
              Draw
            </button>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    } else {
      return (
        <button
          onClick={() => acceptWager(wager.publicKey.toString())}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
          disabled={loading || !connected}
        >
          {loading ? "Processing..." : "Accept Wager"}
        </button>
      );
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Quick Duels Component
  // Add this to your Wager.tsx file

  const QuickDuels = () => {
    const { publicKey, sendTransaction, connected } = useWallet();
    const [selectedSport, setSelectedSport] = useState("all");
    const [selectedQuickDuel, setSelectedQuickDuel] =
      useState<QuickDuel | null>(null);
    const [userPick, setUserPick] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [amount, setAmount] = useState("");
    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    interface QuickDuel {
      id: number;
      sport: string;
      description: string;
      option_a: string;
      option_b: string;
      eventId: string;
    }

    // Sports categories for filtering
    const sports = [
      { id: "all", name: "All" },
      { id: "soccer", name: "Soccer" },
      { id: "ufc", name: "UFC" },
      { id: "boxing", name: "Boxing" },
      { id: "nba", name: "NBA" },
    ];

    // Quick duel events data
    const quickDuels = [
      {
        id: 1,
        sport: "soccer",
        description: "Liverpool vs Man United",
        option_a: "Liverpool",
        option_b: "Man United",
        eventId: "soccer_123",
      },
      {
        id: 2,
        sport: "soccer",
        description: "Real Madrid vs Barcelona",
        option_a: "Real Madrid",
        option_b: "Barcelona",
        eventId: "soccer_124",
      },
      {
        id: 3,
        sport: "ufc",
        description: "Jon Jones vs Stipe Miocic",
        option_a: "Jon Jones",
        option_b: "Stipe Miocic",
        eventId: "ufc_301",
      },
      {
        id: 4,
        sport: "ufc",
        description: "Israel Adesanya vs Dricus Du Plessis",
        option_a: "Adesanya",
        option_b: "Du Plessis",
        eventId: "ufc_302",
      },
      {
        id: 5,
        sport: "boxing",
        description: "Tyson Fury vs Oleksandr Usyk",
        option_a: "Tyson Fury",
        option_b: "Oleksandr Usyk",
        eventId: "boxing_201",
      },
      {
        id: 6,
        sport: "boxing",
        description: "Canelo Alvarez vs David Benavidez",
        option_a: "Canelo",
        option_b: "Benavidez",
        eventId: "boxing_202",
      },
      {
        id: 7,
        sport: "nba",
        description: "Lakers vs Celtics",
        option_a: "Lakers",
        option_b: "Celtics",
        eventId: "nba_401",
      },
      {
        id: 8,
        sport: "nba",
        description: "Warriors vs Nuggets",
        option_a: "Warriors",
        option_b: "Nuggets",
        eventId: "nba_402",
      },
      {
        id: 9,
        sport: "soccer",
        description: "Arsenal vs Chelsea",
        option_a: "Arsenal",
        option_b: "Chelsea",
        eventId: "soccer_125",
      },
      {
        id: 10,
        sport: "soccer",
        description: "Bayern vs Dortmund",
        option_a: "Bayern",
        option_b: "Dortmund",
        eventId: "soccer_126",
      },
      {
        id: 11,
        sport: "ufc",
        description: "Conor McGregor vs Michael Chandler",
        option_a: "McGregor",
        option_b: "Chandler",
        eventId: "ufc_303",
      },
      {
        id: 12,
        sport: "ufc",
        description: "Alex Pereira vs Jamahal Hill",
        option_a: "Pereira",
        option_b: "Hill",
        eventId: "ufc_304",
      },
      {
        id: 13,
        sport: "boxing",
        description: "Anthony Joshua vs Francis Ngannou",
        option_a: "Joshua",
        option_b: "Ngannou",
        eventId: "boxing_203",
      },
      {
        id: 14,
        sport: "boxing",
        description: "Terence Crawford vs Errol Spence",
        option_a: "Crawford",
        option_b: "Spence",
        eventId: "boxing_204",
      },
      {
        id: 15,
        sport: "nba",
        description: "Bucks vs 76ers",
        option_a: "Bucks",
        option_b: "76ers",
        eventId: "nba_403",
      },
      {
        id: 16,
        sport: "nba",
        description: "Suns vs Mavericks",
        option_a: "Suns",
        option_b: "Mavericks",
        eventId: "nba_404",
      },
    ];

    // Filter duels based on selected sport and search query
    const filteredDuels = quickDuels
      .filter((duel) => selectedSport === "all" || duel.sport === selectedSport)
      .filter((duel) =>
        searchQuery === ""
          ? true
          : duel.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            duel.option_a.toLowerCase().includes(searchQuery.toLowerCase()) ||
            duel.option_b.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const getProvider = () => {
      const connection = new Connection(DEVNET_URL, "confirmed");
      const provider = {
        connection,
        publicKey: publicKey || undefined,
        sendTransaction,
      };
      return new AnchorProvider(connection, provider as any, {
        preflightCommitment: "confirmed",
      });
    };

    const getProgram = () => {
      const provider = getProvider();
      return new Program(idl as any, programId, provider);
    };

    const handleQuickDuelCreate = async () => {
      if (
        !publicKey ||
        !selectedQuickDuel ||
        !userPick ||
        !amount ||
        parseFloat(amount) <= 0
      ) {
        alert(
          "Please select a side and enter a valid amount greater than 0 SOL."
        );
        return;
      }

      setIsCreating(true);
      try {
        const program = getProgram();
        const provider = getProvider();
        const wagerAccount = Keypair.generate();
        const lamports = new BN(parseFloat(amount) * LAMPORTS_PER_SOL);

        const transferInstruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: wagerAccount.publicKey,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        });

        const initializeInstruction = await program.methods
          .initializeWager(
            lamports,
            selectedQuickDuel.description,
            selectedQuickDuel.option_a,
            selectedQuickDuel.option_b,
            userPick === "A",
            selectedQuickDuel.eventId
          )
          .accounts({
            wager: wagerAccount.publicKey,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        const { blockhash, lastValidBlockHeight } =
          await provider.connection.getLatestBlockhash();
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions: [transferInstruction, initializeInstruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([wagerAccount]);

        const signature = await sendTransaction(
          transaction,
          provider.connection,
          {
            skipPreflight: false,
            maxRetries: 3,
          }
        );
        await provider.connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        alert("Quick duel created successfully!");
        setIsDialogOpen(false);
        setSelectedQuickDuel(null);
        setUserPick(null);
        setAmount("");
        setIsCreating(false);
        fetchWagers(); // Refresh the wager list
      } catch (err) {
        console.error("Error creating quick duel:", err);
        alert(
          "Failed to create quick duel: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
        setIsCreating(false);
      }
    };

    const handleSearch = (
      e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent
    ) => {
      if (
        e.type === "click" ||
        (e as React.KeyboardEvent<HTMLInputElement>).key === "Enter"
      ) {
        setSearchActive(false); // Hide input after search
      }
    };

    return (
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-2">Quick Duels</h3>

        {/* Search Section */}
        <div className="mb-2 flex items-center">
          {searchActive ? (
            <div className="flex items-center w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-1 text-sm text-white pr-8"
                placeholder="Search games..."
                autoFocus
              />
              <button
                onClick={handleSearch}
                className="ml-1 p-1 bg-gray-700 rounded-lg hover:bg-gray-650 text-gray-300"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-1 text-sm text-white pr-8"
                placeholder="Search games..."
                autoFocus
              />
              <button
                onClick={() => setSearchActive(true)}
                className="ml-1 p-1 bg-gray-700 rounded-lg hover:bg-gray-650 text-gray-300"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            // <button
            //   onClick={() => setSearchActive(true)}
            //   className="flex p-1 bg-gray-700 rounded-lg hover:bg-gray-650 text-gray-300 text-sm"
            // >
            //   {/* <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"></button> */}
            //   <Search className="w-4 h-4" /> Search Game
            // </button>
          )}
        </div>

        {/* Sport filters */}
        <div className="flex gap-1 mb-2">
          {sports.map((sport) => (
            <button
              key={sport.id}
              className={`px-2 py-0.5 rounded-md text-xs ${
                selectedSport === sport.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-650"
              }`}
              onClick={() => setSelectedSport(sport.id)}
            >
              {sport.name}
            </button>
          ))}
        </div>

        {/* Quick duel list */}
        <div
          className="flex-1 overflow-y-auto pr-1"
          style={{ maxHeight: "39vh" }}
        >
          {filteredDuels.length > 0 ? (
            <div className="space-y-1">
              {filteredDuels.map((duel) => (
                <div
                  key={duel.id}
                  className="p-2 bg-gray-700 hover:bg-gray-650 rounded-md cursor-pointer transition-colors flex items-center"
                  onClick={() => {
                    setSelectedQuickDuel(duel);
                    setIsDialogOpen(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <GamepadIcon className="w-4 h-4 text-blue-400" />
                    <div className="overflow-hidden">
                      <p className="text-white font-medium text-sm truncate">
                        {duel.description}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {duel.sport.charAt(0).toUpperCase() +
                          duel.sport.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400 text-sm">
                No events available for this category.
              </p>
            </div>
          )}
        </div>

        {/* Quick Duel Dialog */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent className="bg-gray-800 border border-gray-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Quick Duel: {selectedQuickDuel?.description}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Select which side you think will win and set your wager amount.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-4 my-4">
              <div className="p-3 bg-gray-750 rounded-lg">
                <div className="mb-2 text-gray-300">Wager amount:</div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in SOL"
                  className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 text-white text-sm"
                  min="0.1"
                  step="0.1"
                />
                <div className="text-gray-300 mt-2">Choose your side:</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserPick("A")}
                  className={`flex-1 p-2 rounded-lg font-medium text-sm ${
                    userPick === "A"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-650 text-white"
                  }`}
                >
                  {selectedQuickDuel?.option_a}
                </button>
                <button
                  onClick={() => setUserPick("B")}
                  className={`flex-1 p-2 rounded-lg font-medium text-sm ${
                    userPick === "B"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-650 text-white"
                  }`}
                >
                  {selectedQuickDuel?.option_b}
                </button>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleQuickDuelCreate}
                disabled={
                  !userPick ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  isCreating ||
                  !connected
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium"
              >
                {isCreating ? "Creating..." : "Create Duel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <div className="min-h-[80vh] bg-gray-900">
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* All Wagers Card with Tabs for filtering */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 min-h-[65vh] lg:flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Duels</h3>
              <button
                onClick={fetchWagers}
                disabled={loading}
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-4"
            >
              <TabsList className="bg-gray-700 p-1 rounded-lg">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gray-600 data-[state=active]:text-white rounded-md px-3 py-1 text-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="open"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md px-3 py-1 text-sm"
                >
                  Open
                </TabsTrigger>
                <TabsTrigger
                  value="in-progress"
                  className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-md px-3 py-1 text-sm"
                >
                  In Progress
                </TabsTrigger>
                <TabsTrigger
                  value="closed"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md px-3 py-1 text-sm"
                >
                  Closed
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-[50vh] overflow-y-auto pr-2 max-h-full">
              {getFilteredWagers().length > 0 ? (
                <div className="space-y-2">
                  {getFilteredWagers().map((wager) => (
                    <Dialog
                      key={wager.publicKey.toString()}
                      onOpenChange={(open) => {
                        if (open) setSelectedWager(wager);
                        else setSelectedWager(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <div className="p-3 bg-gray-700 hover:bg-gray-650 rounded-lg cursor-pointer transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getWagerStatusIcon(wager)}
                            <div className="overflow-hidden">
                              <p className="text-white font-medium truncate">
                                {wager.account.description}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {getWagerStatusText(wager)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {(
                                wager.account.amount / LAMPORTS_PER_SOL
                              ).toString()}{" "}
                              SOL
                            </p>
                          </div>
                        </div>
                      </DialogTrigger>
                      {selectedWager && (
                        <DialogContent className="bg-gray-800 border border-gray-700 text-white">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedWager.account.description}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Duel details and actions
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 my-4">
                            <div className="bg-gray-750 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Amount:</span>
                                <span className="text-white font-medium">
                                  {(
                                    selectedWager.account.amount /
                                    LAMPORTS_PER_SOL
                                  ).toString()}{" "}
                                  SOL
                                </span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Match:</span>
                                <span className="text-white">
                                  {selectedWager.account.option_a} vs{" "}
                                  {selectedWager.account.option_b}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">
                                  Creator bet:
                                </span>
                                <span className="text-white">
                                  {selectedWager.account.creator_pick
                                    ? selectedWager.account.option_a
                                    : selectedWager.account.option_b}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Creator:</span>
                                <span className="text-white">
                                  {shortenAddress(
                                    selectedWager.account.creator.toString()
                                  )}
                                </span>
                              </div>
                              {selectedWager.account.challenger.toString() !==
                                PublicKey.default.toString() && (
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-gray-400">
                                    Challenger:
                                  </span>
                                  <span className="text-white">
                                    {shortenAddress(
                                      selectedWager.account.challenger.toString()
                                    )}
                                  </span>
                                </div>
                              )}
                              {selectedWager.account.is_complete && (
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-gray-400">Result:</span>
                                  <span
                                    className={`font-medium ${
                                      selectedWager.account.result === 0
                                        ? "text-yellow-400"
                                        : "text-green-400"
                                    }`}
                                  >
                                    {selectedWager.account.result === 0
                                      ? "Draw"
                                      : selectedWager.account.result === 1
                                      ? `${selectedWager.account.option_a} won`
                                      : `${selectedWager.account.option_b} won`}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Status:</span>
                                <span
                                  className={`font-medium ${
                                    selectedWager.account.is_complete
                                      ? "text-green-400"
                                      : selectedWager.account.challenger.toString() !==
                                        PublicKey.default.toString()
                                      ? "text-yellow-400"
                                      : "text-purple-400"
                                  }`}
                                >
                                  {getWagerStatusText(selectedWager)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            {renderWagerActions(selectedWager)}
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-400">No duels available yet.</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Create one to get started!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Container for Create Wager and Quick Duels */}
          <div className="flex flex-col gap-6 lg:w-80">
            {/* Create Wager Card */}
            <div
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col justify-center items-center self-start"
              style={{ maxHeight: "10vh", width: "100%" }}
            >
              {/* <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between w-full mb-4">
                Create a New Duel
              </h3> */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
                    <Plus className="w-5 h-5" /> Create a New Duel
                  </button>
                </DialogTrigger>

                {/* <div className="flex items-center justify-between w-full mb-4">
                <h3 className="text-xl font-bold text-white">
                  Create a New Duel
                </h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Plus className="w-5 h-5" />
                  </button>
                </DialogTrigger> */}

                <DialogContent className="bg-gray-800 border border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Create a New Duel</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Fill in the details below to create your duel.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 my-4">
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Arsenal vs Chelsea"
                      className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        placeholder="Team/Player A"
                        className="bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
                      />
                      <input
                        type="text"
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Team/Player B"
                        className="bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
                      />
                    </div>
                    <select
                      value={creatorPick ? "A" : "B"}
                      onChange={(e) => setCreatorPick(e.target.value === "A")}
                      className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
                    >
                      <option value="A">Option A wins</option>
                      <option value="B">Option B wins</option>
                    </select>
                    <input
                      type="text"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      placeholder="Event ID (e.g., from TheSportsDB)"
                      className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
                    />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount in SOL"
                      className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white"
                    />
                  </div>
                  <DialogFooter>
                    <button
                      onClick={createWager}
                      disabled={loading || !connected}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium py-3 rounded-lg"
                    >
                      {loading ? "Creating..." : "Create Wager"}
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Quick Duels Card */}
            <QuickDuels />
          </div>
        </div>
      </div>
    </div>
  );
}
