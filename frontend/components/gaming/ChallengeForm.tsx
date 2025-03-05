import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenge } from "../../hooks/useChallenge";
import { Button } from "../common/Button";
import { Match, LichessMatchStats } from "@/types"; // Updated to Lichess types

interface ChallengeFormProps {
  onChallengeCreated?: (challengeId: string) => void;
  match?: Match; // Updated to Lichess Match
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  onChallengeCreated,
  match, // Optional Lichess match to pre-fill stats
}) => {
  const wallet = useWallet();
  const { createChallenge } = useChallenge();
  const [wagerAmount, setWagerAmount] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!wallet.connected) {
      setError("Please connect your wallet first");
      setIsLoading(false);
      return;
    }

    if (!wagerAmount || isNaN(parseFloat(wagerAmount))) {
      setError("Please enter a valid wager amount");
      setIsLoading(false);
      return;
    }

    try {
      const challengeId = await createChallenge({
        wagerAmount: parseFloat(wagerAmount),
        lichessUsername: "", // Default empty, update as needed (e.g., from match or user input)
        stats: match
          ? {
              matchId: match.id,
              playerStats: {
                result: match.result,
                variant: match.variant,
                speed: match.gameType,
              },
            }
          : {
              matchId: "", // Default empty match ID
              playerStats: {
                result: "draw", // Default to draw, update with actual match data
                variant: "Standard",
                speed: "Unknown",
              },
            },
      });
      if (challengeId) {
        onChallengeCreated?.(challengeId);
      }
    } catch (err) {
      setError("An error occurred while creating the challenge");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
      <h2 className="text-2xl font-bold mb-6 text-white">Create Challenge</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Wager Amount (SOL)
          </label>
          <input
            type="number"
            value={wagerAmount}
            onChange={(e) => setWagerAmount(e.target.value)}
            className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3 text-white"
            placeholder="0.1"
            step="0.1"
            min="0"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={!wallet.connected || isLoading}
          className="w-full"
        >
          Create Challenge
        </Button>
      </form>
    </div>
  );
};

export default ChallengeForm;
