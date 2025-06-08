// frontend/components/gaming/PlayerSearch.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  User,
  GamepadIcon,
  Wallet,
  Sword,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Trophy,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenge } from "@/hooks/useChallenge";
import { LichessMatchStats, Challenge } from "@/types";
import {
  CreateChallengeDialog,
  ChallengeList,
  ChallengeDetailsDialog,
} from "./ChallengeComponents";
import { useProgram } from "@/hooks/useProgram";
import { useLichess } from "../../hooks/useLichess";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

const NEXT_PUBLIC_API_URL = "http://localhost:3001"; // Kept for potential backend integration

interface Match {
  id: string;
  timestamp: number;
  gameType: string; // e.g., "Bullet", "Blitz", "Rapid"
  result: "win" | "loss" | "draw";
  variant: string; // e.g., "Standard", "Chess960"
}

interface LichessPlayer {
  id: string;
  username: string;
}

interface PlayerSearchProps {
  onPlayerFound?: (playerData: LichessPlayer) => void;
  onMatchesFound?: (matches: Match[]) => void;
  challenge?: Challenge;
  onChallengeComplete?: (winner: string) => void;
  onSelect: (player: { username: string }) => void;
  selectedPlayer: { username: string } | null;
}

const PlayerSearch = ({ onSelect, selectedPlayer }: PlayerSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/lichess/user/${encodeURIComponent(searchTerm.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to find player");
      }

      onSelect({ username: data.username });
      toast.success(`Found player: ${data.username}`);
    } catch (error) {
      console.error("Error searching player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to find player"
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, onSelect]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter Lichess username"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
      {selectedPlayer && (
        <div className="text-sm text-gray-600">
          Selected player: {selectedPlayer.username}
        </div>
      )}
    </div>
  );
};

export default PlayerSearch;
