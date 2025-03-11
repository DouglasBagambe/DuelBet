// frontend/components/gaming/ChallengeComponents.tsx

"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenge } from "@/hooks/useChallenge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Sword,
  Trophy,
  Calendar,
  Hash,
  Users,
  ExternalLink,
  User,
  Wallet as WalletIcon,
  Clock,
  CheckCircle,
  Wallet,
  Plus,
  Eye,
  Crown,
  AlertCircle,
  Link,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LichessPlayer, Challenge, LichessMatchStats } from "@/types";
import { PublicKey } from "@solana/web3.js";
import ChessCard from "./ChessCard";

// Create Challenge Dialog Component
const CreateChallengeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge: (
    challengeData: Omit<Challenge, "id" | "creator" | "isComplete">
  ) => void;
  player?: LichessPlayer;
}> = ({ isOpen, onClose, onCreateChallenge, player }) => {
  const [lichessChallengeLink, setLichessChallengeLink] = useState("");
  const [challengeDetails, setChallengeDetails] = useState<{
    id: string;
    speed: string;
    variant: string;
    timeControl: { limit: number; increment: number; show: string };
    color: string;
    rated: boolean;
  } | null>(null);

  const [lichessUsername, setLichessUsername] = useState(
    player?.username || ""
  );
  const [wagerAmount, setWagerAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createChallenge } = useChallenge();
  const { connected, connect, publicKey } = useWallet();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // if (!challengeDetails || !challengeDetails.id) {
  //   setError("No valid challenge details fetched");
  //   return;
  // }

  function handleError(message: string) {
    setError(message);
  }

  function exec(
    curlCommand: string,
    arg1: (error: any, stdout: any, stderr: any) => void
  ) {
    throw new Error("Function not implemented.");
  }

  const handleFetchChallengeDetails = async () => {
    if (!lichessChallengeLink) {
      setError("Please enter a Lichess challenge link");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const challengeId = lichessChallengeLink.split("/").pop() || "";
      const curlCommand = `curl -X GET "https://lichess.org/api/challenge/${challengeId}/show" -H "Authorization: Bearer lip_klyys0UD2koPyYMeYT9t"`;
      console.log(`Executing curl command: ${curlCommand}`);

      const response = await new Promise<string>((resolve, reject) => {
        exec(curlCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Curl error: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) {
            console.error(`Curl stderr: ${stderr}`);
            reject(new Error(stderr));
            return;
          }
          resolve(stdout);
        });
      });

      const rawData = response.trim();
      console.log(
        "Raw Lichess challenge response:",
        JSON.stringify(rawData, null, 2)
      );

      const data = JSON.parse(rawData);
      setChallengeDetails({
        id: data.id,
        speed: data.speed,
        variant: data.variant.key,
        timeControl: data.timeControl,
        color: data.color,
        rated: data.rated,
      });

      // Pre-fill lichessUsername if challenger is the current player or opponent
      const currentUsername = player?.username || "";
      setLichessUsername(
        data.challenger?.name || data.destUser?.name || currentUsername
      );

      // Show success notification
      toast.success("Challenge details retrieved successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch challenge details"
      );
      toast.error("Failed to fetch challenge details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      setShowWalletPrompt(true);
      return;
    }

    setIsLoading(true);
    try {
      onCreateChallenge({
        lichessUsername,
        wagerAmount: parseFloat(wagerAmount),
        metadata: lichessChallengeLink, // Pass the Lichess challenge link
        ...(challengeDetails && {
          speed: challengeDetails.speed,
          variant: {
            key: challengeDetails.variant,
            name: challengeDetails.variant,
            short: challengeDetails.variant,
          },
          timeControl: {
            ...challengeDetails.timeControl,
            type: "clock",
          },
          color: challengeDetails.color,
          rated: challengeDetails.rated,
        }),
        isActive: false,
        createdAt: 0,
      });
      toast.success("Challenge created successfully!");
      onClose();
      setLichessChallengeLink("");
      setLichessUsername("");
      setWagerAmount("");
      setChallengeDetails(null);
    } catch (error) {
      console.error("Error creating challenge:", error);
      let errorMessage = "Failed to create challenge";
      if (error instanceof Error) {
        if (error.message.includes("Insufficient balance")) {
          errorMessage = "Insufficient balance in wallet";
        } else if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected";
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-800 text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Sword className="w-6 h-6 text-purple-400" />
              Create Chess Challenge
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set up a new Lichess chess challenge with a wager
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Lichess Username
              </label>
              <input
                type="text"
                value={lichessUsername}
                onChange={(e) => setLichessUsername(e.target.value)}
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Lichess username"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Lichess Challenge Link
              </label>
              <input
                type="text"
                value={lichessChallengeLink}
                onChange={(e) => setLichessChallengeLink(e.target.value)}
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste Lichess challenge link (e.g., https://lichess.org/Wzfm6fjj)"
                required
              />
              <button
                type="button"
                onClick={handleFetchChallengeDetails}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? "Fetching..." : "Fetch Challenge Details"}
              </button>
            </div>

            {/* Challenge details preview */}
            {challengeDetails && (
              <div className="bg-gray-700/50 p-3 rounded-lg border border-blue-500/30">
                <h3 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Challenge Preview
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-300">Game Type:</div>
                  <div className="text-white">{challengeDetails.variant}</div>

                  <div className="text-gray-300">Speed:</div>
                  <div className="text-white">{challengeDetails.speed}</div>

                  <div className="text-gray-300">Time Control:</div>
                  <div className="text-white">
                    {challengeDetails.timeControl.show}
                  </div>

                  <div className="text-gray-300">Color:</div>
                  <div className="text-white">{challengeDetails.color}</div>

                  <div className="text-gray-300">Rated:</div>
                  <div className="text-white">
                    {challengeDetails.rated ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Wager Amount (SOL)
              </label>
              <input
                type="number"
                step="0.01"
                value={wagerAmount}
                onChange={(e) => setWagerAmount(e.target.value)}
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter wager amount"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-100 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                Cancel
              </button>
              {connected ? (
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Challenge"}
                </button>
              ) : (
                <WalletMultiButton />
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showWalletPrompt} onOpenChange={setShowWalletPrompt}>
        <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Connect Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Please connect your wallet to create a challenge.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <WalletMultiButton />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Improved Challenge List Component
const ChallengeList: React.FC<{
  challenges: Challenge[];
  onViewChallenge: (challenge: Challenge) => void;
  onAcceptChallenge: (challengeId: string) => void;
}> = ({ challenges, onViewChallenge, onAcceptChallenge }) => {
  return (
    <div className="space-y-3">
      {challenges.length === 0 ? (
        <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 text-center">
          <Crown className="w-10 h-10 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400">No challenges available</p>
        </div>
      ) : (
        challenges.map((challenge) => (
          // <ChessCard />

          <Card
            key={challenge.id}
            className="bg-gradient-to-r from-gray-800 to-gray-700 border border-purple-500/30 hover:border-purple-400 transition-all duration-300 cursor-pointer"
            onClick={() => onViewChallenge(challenge)}
          >
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                {/* Creator info */}
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold truncate max-w-[150px]">
                    {challenge.lichessUsername || "Anonymous"}
                  </span>
                </div>

                {/* Challenge status indicator */}
                {challenge.isComplete ? (
                  <span className="bg-green-500/20 text-green-300 text-xs py-1 px-2 rounded-full">
                    Completed
                  </span>
                ) : challenge.challenger ? (
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs py-1 px-2 rounded-full">
                    In Progress
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-300 text-xs py-1 px-2 rounded-full">
                    Open
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-3 pb-2 pt-0">
              <div className="flex items-center justify-between text-sm">
                {/* Creator */}
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-300">
                    {challenge.creator || "Unknown"}
                  </span>
                </div>

                {/* Time controls */}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">
                    {typeof challenge.timeControl === "string"
                      ? challenge.timeControl
                      : challenge.timeControl?.show || "10+0"}
                  </span>
                </div>

                {/* Wager amount */}
                <div className="flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">
                    {challenge.wagerAmount} SOL
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 pt-1 flex justify-end">
              {!challenge.challenger && !challenge.isComplete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptChallenge(challenge.id);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-full text-sm flex items-center gap-1 transition-all"
                >
                  <Sword className="w-4 h-4" /> Accept
                </button>
              )}
            </CardFooter>
          </Card>
          //////
        ))
      )}
    </div>
  );
};

// Enhanced Challenge Details Dialog Component
const ChallengeDetailsDialog: React.FC<{
  challenge?: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onAcceptChallenge: (challengeId: string) => void;
  onCompleteChallenge?: (winner: string) => void;
  canComplete: boolean;
}> = ({
  challenge,
  isOpen,
  onClose,
  onAcceptChallenge,
  onCompleteChallenge,
  canComplete,
}) => {
  const [showConfirmAccept, setShowConfirmAccept] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { acceptChallenge, completeChallenge: completeChallengeHook } =
    useChallenge();
  const { connected } = useWallet();

  const handleAccept = async (challengeId: string) => {
    if (!connected) {
      setShowWalletPrompt(true);
      return;
    }

    setIsLoading(true);
    try {
      await acceptChallenge({
        challengeId,
        wagerAmount: challenge?.wagerAmount || 0,
        lichessUsername: challenge?.lichessUsername || "",
      });
      onAcceptChallenge(challengeId);
      toast.success("Challenge accepted successfully!");
      setShowConfirmAccept(false);
      onClose();
    } catch (error) {
      toast.error("Failed to accept challenge");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (winner: string) => {
    if (!challenge || !challenge.id || !onCompleteChallenge) return;

    setIsLoading(true);
    try {
      await completeChallengeHook({
        challengeId: challenge.id,
        winner,
        stats: challenge.stats || {
          matchId: "",
          playerStats: {
            result: winner === challenge.creator ? "win" : "loss",
            variant:
              typeof challenge.variant === "string"
                ? challenge.variant
                : "Standard",
            speed: challenge.speed || "Unknown",
          },
        },
      });
      onCompleteChallenge(winner);
      toast.success("Challenge completed successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to complete challenge");
      console.error("Error completing challenge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!challenge) return null;

  // Helper function to get status badge color and text
  const getStatusInfo = () => {
    if (challenge.isComplete) {
      return { color: "bg-green-500/20 text-green-400", text: "Completed" };
    } else if (challenge.challenger !== PublicKey.default.toString()) {
      return { color: "bg-yellow-500/20 text-yellow-400", text: "In Progress" };
    } else if (challenge.isActive) {
      return { color: "bg-blue-500/20 text-blue-400", text: "Open" };
    } else {
      return { color: "bg-red-500/20 text-red-400", text: "Inactive" };
    }
  };

  const statusInfo = getStatusInfo();
  const showAcceptButton =
    challenge.isActive &&
    challenge.challenger === PublicKey.default.toString() &&
    !challenge.isComplete;

  const showCompleteButtons =
    canComplete &&
    challenge.challenger !== PublicKey.default.toString() &&
    !challenge.isComplete;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-2xl p-0 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700">
            <DialogHeader className="mb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <Trophy className="w-7 h-7 text-yellow-400" />
                  Chess Challenge
                </DialogTitle>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                >
                  {statusInfo.text}
                </span>
              </div>
              <DialogDescription className="text-gray-400 mt-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 opacity-70" />
                    <span>
                      {new Date(
                        challenge.createdAt * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="w-4 h-4 opacity-70" />
                    <span className="font-mono text-xs">
                      {challenge.id.substring(0, 12)}...
                    </span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Main content with scrollable area */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-5">
              {/* Players section */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                <h3 className="font-medium text-gray-300 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Players
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Creator card */}
                  <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Creator</div>
                      <div className="text-white font-medium truncate max-w-[180px]">
                        {challenge.creator}
                      </div>
                    </div>
                  </div>

                  {/* Challenger card (or empty slot) */}
                  <div
                    className={`rounded-lg p-4 border flex items-center gap-3 ${
                      challenge.challenger !== PublicKey.default.toString()
                        ? "bg-gray-800/70 border-gray-700/50"
                        : "bg-gray-800/30 border-gray-700/30"
                    }`}
                  >
                    <div
                      className={`${
                        challenge.challenger !== PublicKey.default.toString()
                          ? "bg-yellow-500/20"
                          : "bg-gray-700/30"
                      } p-2 rounded-full`}
                    >
                      <User
                        className={`w-5 h-5 ${
                          challenge.challenger !== PublicKey.default.toString()
                            ? "text-yellow-400"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Challenger</div>
                      <div
                        className={`font-medium truncate max-w-[180px] ${
                          challenge.challenger !== PublicKey.default.toString()
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      >
                        {challenge.challenger !== PublicKey.default.toString()
                          ? challenge.challenger
                          : "Waiting for challenger..."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game details section */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                <h3 className="font-medium text-gray-300 mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Game Details
                </h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <div className="text-gray-400 text-xs">Game Type</div>
                    <div className="text-white font-medium">
                      {typeof challenge.variant === "string"
                        ? challenge.variant
                        : challenge.variant?.name || "Standard"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-400 text-xs">Speed</div>
                    <div className="text-white font-medium">
                      {challenge.speed || "Unknown"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-400 text-xs">Time Control</div>
                    <div className="text-white font-medium">
                      {challenge.timeControl?.show ||
                        `${challenge.timeControl?.limit || 0}+${
                          challenge.timeControl?.increment || 0
                        }`}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-400 text-xs">Color</div>
                    <div className="text-white font-medium">
                      {challenge.color || "Random"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-400 text-xs">Rated</div>
                    <div className="text-white font-medium">
                      {challenge.rated ? "Yes" : "No"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-400 text-xs">Wager</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <WalletIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-bold">
                        {challenge.wagerAmount}{" "}
                        <span className="text-purple-400">SOL</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lichess Info */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                <h3 className="font-medium text-gray-300 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-400" />
                  Lichess Details
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">
                        Lichess Username
                      </div>
                      <div className="text-white font-medium">
                        {challenge.lichessUsername}
                      </div>
                    </div>
                  </div>

                  {challenge.metadata && (
                    <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50">
                      <div className="text-gray-400 text-xs mb-1">
                        Challenge Link
                      </div>
                      <a
                        href={challenge.metadata}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2 truncate font-medium"
                      >
                        <Link className="w-4 h-4" />
                        <span className="truncate">{challenge.metadata}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action footer with gradient */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-t border-gray-700">
            {/* Accept Challenge Button - only show when there's no challenger and challenge is active */}
            {showAcceptButton && (
              <div>
                {connected ? (
                  <button
                    onClick={() => setShowConfirmAccept(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
                    disabled={isLoading}
                  >
                    <Sword className="w-5 h-5" />
                    {isLoading ? "Processing..." : "Accept Challenge"}
                  </button>
                ) : (
                  <WalletMultiButton className="w-full" />
                )}
              </div>
            )}

            {/* Challenge completion buttons - only show when there is a challenger and the challenge is not complete */}
            {showCompleteButtons && (
              <div className="space-y-3">
                <h3 className="font-medium text-yellow-400 mb-2">
                  Complete Challenge
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleComplete(challenge.creator)}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all font-medium"
                    disabled={isLoading}
                  >
                    <Trophy className="w-5 h-5" />
                    {isLoading ? "Completing..." : "Creator Wins"}
                  </button>
                  <button
                    onClick={() => handleComplete(challenge.challenger || "")}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all font-medium"
                    disabled={isLoading}
                  >
                    <Trophy className="w-5 h-5" />
                    {isLoading ? "Completing..." : "Challenger Wins"}
                  </button>
                </div>
              </div>
            )}

            {/* No buttons if the challenge is completed */}
            {challenge.isComplete && (
              <div className="text-center text-gray-400 py-2">
                This challenge has been completed
              </div>
            )}

            {/* No buttons if the challenge is inactive */}
            {!challenge.isActive && !challenge.isComplete && (
              <div className="text-center text-gray-400 py-2">
                This challenge is currently inactive
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Prompt Dialog */}
      <AlertDialog open={showWalletPrompt} onOpenChange={setShowWalletPrompt}>
        <AlertDialogContent className="bg-gray-900 text-white border border-gray-700 p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Connect Wallet
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Please connect your wallet to accept this challenge.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
              Cancel
            </AlertDialogCancel>
            <WalletMultiButton />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Accept Dialog */}
      <AlertDialog open={showConfirmAccept} onOpenChange={setShowConfirmAccept}>
        <AlertDialogContent className="bg-gray-900 text-white border border-gray-700 p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sword className="w-5 h-5 text-green-400" />
              Accept Challenge
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to accept this challenge? This will require
              a wager of{" "}
              <span className="text-purple-400 font-bold">
                {challenge.wagerAmount} SOL
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium"
              onClick={() => handleAccept(challenge.id)}
              disabled={isLoading}
            >
              {isLoading ? "Accepting..." : "Accept"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { CreateChallengeDialog, ChallengeList, ChallengeDetailsDialog };
