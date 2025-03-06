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
    <div className="space-y-4">
      {challenges.length === 0 ? (
        <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6 text-center">
          <Crown className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No active challenges available</p>
          <p className="text-gray-500 text-sm mt-2">
            Create a challenge to get started
          </p>
        </div>
      ) : (
        challenges.map((challenge) => (
          <Card
            key={challenge.id}
            className="bg-gray-700/50 border border-gray-600 hover:border-blue-500/50 transition-colors"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-blue-400" />
                  Chess Challenge
                </CardTitle>
                <CardDescription className="text-gray-400">
                  ID: {challenge.id.substring(0, 8)}...
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {challenge.isComplete ? (
                  <span className="bg-green-500/20 text-green-300 text-xs py-1 px-2 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                ) : challenge.challenger ? (
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs py-1 px-2 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    In Progress
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-300 text-xs py-1 px-2 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Open
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Creator:</span>
                  <span className="text-white font-medium truncate">
                    {challenge.creator}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Wager:</span>
                  <span className="text-white font-medium">
                    {challenge.wagerAmount} SOL
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Lichess Username:</span>
                  <span className="text-white font-medium">
                    {challenge.lichessUsername}
                  </span>
                </div>
                {challenge.speed && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Speed:</span>
                    <span className="text-white font-medium">
                      {challenge.speed}
                    </span>
                  </div>
                )}
                {challenge.timeControl?.show && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Time:</span>
                    <span className="text-white font-medium">
                      {challenge.timeControl.show}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-0">
              <button
                onClick={() => onViewChallenge(challenge)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              {!challenge.challenger && !challenge.isComplete && (
                <button
                  onClick={() => onAcceptChallenge(challenge.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Sword className="w-4 h-4" />
                  Accept
                </button>
              )}
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

// Enhanced Challenge Details Dialog Component
const ChallengeDetailsDialog: React.FC<{
  challenge?: Challenge; // Updated Challenge type includes isActive and createdAt
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-800 text-white border border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Chess Challenge Details
            </DialogTitle>
            <DialogDescription className="text-gray-400 flex items-center gap-2">
              <span>ID: {challenge.id}</span>
              <span className="text-gray-500">•</span>
              <span>
                Status:
                {challenge.isComplete ? (
                  <span className="text-green-400 ml-1">Completed</span>
                ) : challenge.challenger !== PublicKey.default.toString() ? (
                  <span className="text-yellow-400 ml-1">In Progress</span>
                ) : challenge.isActive ? (
                  <span className="text-blue-400 ml-1">Open</span>
                ) : (
                  <span className="text-red-400 ml-1">Inactive</span>
                )}
              </span>
              <span className="text-gray-500">•</span>
              <span>
                Created:{" "}
                {new Date(challenge.createdAt * 1000).toLocaleDateString()}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Main challenge info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Creator</div>
                <div className="text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  {challenge.creator}
                </div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Wager</div>
                <div className="text-white flex items-center gap-2">
                  <WalletIcon className="w-4 h-4 text-purple-400" />
                  {challenge.wagerAmount} SOL
                </div>
              </div>
            </div>

            {/* Lichess username */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Lichess Username</div>
              <div className="text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                {challenge.lichessUsername}
              </div>
            </div>
            {challenge.metadata && (
              <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
                <div className="text-gray-400 text-sm mb-1">Challenge Link</div>
                <div className="text-white flex items-center gap-2">
                  <Link className="w-4 h-4 text-blue-400" />{" "}
                  {/* Assuming you have a Link icon */}
                  <a
                    href={challenge.metadata}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {challenge.metadata}
                  </a>
                </div>
              </div>
            )}

            {/* Game details section */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Game Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Game Type</div>
                  <div className="text-white">
                    {typeof challenge.variant === "string"
                      ? challenge.variant
                      : challenge.variant?.name || "Standard"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Speed</div>
                  <div className="text-white">
                    {challenge.speed || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Time Control</div>
                  <div className="text-white">
                    {challenge.timeControl?.show ||
                      `${challenge.timeControl?.limit || 0}+${
                        challenge.timeControl?.increment || 0
                      }`}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Color</div>
                  <div className="text-white">
                    {challenge.color || "Random"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Rated</div>
                  <div className="text-white">
                    {challenge.rated ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>

            {/* Challenger info if exists */}
            {challenge.challenger && (
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Challenger</div>
                <div className="text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-yellow-400" />
                  {challenge.challenger}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {challenge.isActive &&
              challenge.challenger === PublicKey.default.toString() &&
              !challenge.isComplete && (
                <div className="mt-4">
                  {connected ? (
                    <button
                      onClick={() => setShowConfirmAccept(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
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
            {/* Challenge completion buttons */}
            {canComplete && challenge.isComplete !== true && (
              <div className="mt-4 space-y-3">
                <h3 className="font-medium text-yellow-400">
                  Complete Challenge
                </h3>
                <button
                  onClick={() => handleComplete(challenge.creator)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <Trophy className="w-5 h-5" />
                  {isLoading ? "Completing..." : "Creator Wins"}
                </button>
                <button
                  onClick={() => handleComplete(challenge.challenger || "")}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <Trophy className="w-5 h-5" />
                  {isLoading ? "Completing..." : "Challenger Wins"}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showWalletPrompt} onOpenChange={setShowWalletPrompt}>
        <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Connect Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Please connect your wallet to accept this challenge.
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

      <AlertDialog open={showConfirmAccept} onOpenChange={setShowConfirmAccept}>
        <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Challenge</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to accept this challenge? This will require
              a wager of {challenge.wagerAmount} SOL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
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
