// frontend/components/gaming/ChallengeComponents.tsx

import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenge } from "@/hooks/useChallenge"; // Updated from useSolanaChallenge to useChallenge
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
} from "@/components/ui/card";
import {
  Sword,
  Trophy,
  User,
  Wallet as WalletIcon,
  Clock,
  CheckCircle,
  Wallet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LichessPlayer, Challenge, LichessMatchStats } from "@/types"; // Updated imports

// Create Challenge Dialog Component
const CreateChallengeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge: (
    challengeData: Omit<Challenge, "id" | "creator" | "isComplete">
  ) => void;
  player?: LichessPlayer; // Added to pass Lichess player data
}> = ({ isOpen, onClose, onCreateChallenge, player }) => {
  const [lichessUsername, setLichessUsername] = useState(
    player?.username || ""
  ); // Replaced riotId with lichessUsername, default to player's username
  const [wagerAmount, setWagerAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createChallenge } = useChallenge(); // Updated to useChallenge
  const { connected, connect, publicKey } = useWallet();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      setShowWalletPrompt(true);
      return;
    }

    setIsLoading(true);
    try {
      const challengeId = await createChallenge({
        wagerAmount: parseFloat(wagerAmount),
        lichessUsername, // Use lichessUsername instead of riotId
        stats: {
          matchId: "", // Default empty match ID, update as needed
          playerStats: {
            result: "draw", // Default to draw, update with actual match data
            variant: "Standard",
            speed: "Unknown",
          },
        },
      });
      console.log("Challenge created with ID:", challengeId);
      onCreateChallenge({
        lichessUsername, // Replaced riotId
        wagerAmount: parseFloat(wagerAmount),
      });
      toast.success("Challenge created successfully!");
      onClose();
      setLichessUsername("");
      setWagerAmount("");
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
              Create Challenge
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set up a new gaming challenge
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

// Challenge List Component
const ChallengeList: React.FC<{
  challenges: Challenge[];
  onViewChallenge: (challenge: Challenge) => void;
  onAcceptChallenge: (challengeId: string) => void; // Added to handle acceptance
}> = ({ challenges, onViewChallenge, onAcceptChallenge }) => {
  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <Card
          key={challenge.id}
          className="bg-gray-700/50 border border-gray-600"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-white text-lg font-semibold">
              Challenge #{challenge.id}
            </CardTitle>
            <div className="flex items-center gap-2">
              {challenge.isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  Creator: {challenge.creator}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">
                  {challenge.wagerAmount} SOL
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  Lichess Username: {challenge.lichessUsername}
                </span>
              </div>
            </div>
            {!challenge.challenger && !challenge.isComplete && (
              <button
                onClick={() => onAcceptChallenge(challenge.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                Accept Challenge
              </button>
            )}
            <button
              onClick={() => onViewChallenge(challenge)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 mt-2"
            >
              View Challenge
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Challenge Details Dialog Component
const ChallengeDetailsDialog: React.FC<{
  challenge?: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onAcceptChallenge: (challengeId: string) => void;
  onCompleteChallenge?: (winner: string) => void; // Added for completion
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
    useChallenge(); // Updated to useChallenge
  const { connected, connect } = useWallet();

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
          matchId: "", // Default empty match ID, update as needed
          playerStats: {
            result: "draw", // Default to draw, update with actual match data
            variant: "Standard",
            speed: "Unknown",
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
        <DialogContent className="bg-gray-800 text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Challenge Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Creator</div>
                <div className="text-white">{challenge.creator}</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Wager</div>
                <div className="text-white">{challenge.wagerAmount} SOL</div>
              </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Lichess Username</div>
              <div className="text-white">{challenge.lichessUsername}</div>{" "}
              {/* Replaced riotId */}
            </div>
            {challenge.challenger && (
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Challenger</div>
                <div className="text-white">{challenge.challenger}</div>
              </div>
            )}
            {!challenge.challenger && !challenge.isComplete && (
              <div className="mt-4">
                {connected ? (
                  <button
                    onClick={() => setShowConfirmAccept(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Accept Challenge"}
                  </button>
                ) : (
                  <WalletMultiButton className="w-full" />
                )}
              </div>
            )}
            {canComplete && challenge.isComplete !== true && (
              <div className="mt-4">
                <button
                  onClick={() => handleComplete(challenge.creator)} // Default to creator, adjust logic as needed
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Completing..."
                    : "Complete Challenge (Creator Wins)"}
                </button>
                <button
                  onClick={() => handleComplete(challenge.challenger || "")} // Handle challenger, default empty if undefined
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 mt-2"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Completing..."
                    : "Complete Challenge (Challenger Wins)"}
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
