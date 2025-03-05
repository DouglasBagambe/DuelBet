// frontend/components/gaming/PlayerSearch.tsx

import React, { useState } from "react";
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
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenge } from "@/hooks/useChallenge";
import { ChallengeData } from "@/types";
import {
  CreateChallengeDialog,
  ChallengeList,
  ChallengeDetailsDialog,
} from "./ChallengeComponents";

const NEXT_PUBLIC_API_URL = "http://localhost:3001";

interface Match {
  id: string;
  timestamp: number;
  gameType: string;
  result: "win" | "loss";
  kills: number;
  deaths: number;
  assists: number;
}

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface PlayerSearchProps {
  onPlayerFound?: (playerData: RiotAccount) => void;
  onMatchesFound?: (matches: Match[]) => void;
  challenge?: ChallengeData;
  onChallengeComplete?: (winner: string) => void;
}

interface Challenge {
  id: string;
  creator: string;
  riotId: string;
  wagerAmount: number;
  challenger?: string;
  isComplete?: boolean;
  stats?: {
    kills: number;
    deaths: number;
    assists: number;
  };
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  onPlayerFound,
  onMatchesFound,
  challenge,
  onChallengeComplete,
}) => {
  const wallet = useWallet();
  const {
    completeChallenge,
    loading: challengeLoading,
    error: challengeError,
  } = useChallenge();
  const [playerName, setPlayerName] = useState("");
  const [tagline, setTagline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundPlayer, setFoundPlayer] = useState<RiotAccount | null>(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>();

  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isChallengeDetailsOpen, setIsChallengeDetailsOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>();
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const handleCreateChallenge = (challengeData: Omit<Challenge, "id">) => {
    const newChallenge = {
      ...challengeData,
      id: `CH_${Math.random().toString(36).substring(2, 9)}`,
    };
    setChallenges((prev) => [...prev, newChallenge]);
  };

  const handleViewChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsChallengeDetailsOpen(true);
  };

  const handleAcceptChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, challenger: wallet.publicKey?.toString() }
          : challenge
      )
    );
  };

  const handleSearch = async () => {
    if (!playerName || !tagline) {
      setError("Please enter both player name and tagline");
      return;
    }

    setIsLoading(true);
    setError("");
    setFoundPlayer(null);

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_URL}/api/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          playerName
        )}/${encodeURIComponent(tagline)}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Player not found. Please check the name and tagline."
          );
        }
        throw new Error(`Failed to find player (Status: ${response.status})`);
      }

      const data: RiotAccount = await response.json();
      setFoundPlayer(data);
      onPlayerFound?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find player");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchMatches = async () => {
    if (!foundPlayer?.puuid) {
      setMatchError("Player information is required");
      return;
    }

    setIsLoadingMatches(true);
    setMatchError("");

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_URL}/api/lol/match/v5/matches/by-puuid/${encodeURIComponent(
          foundPlayer.puuid
        )}/ids?region=${encodeURIComponent(tagline)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch matches (Status: ${response.status})`);
      }

      const matchIds = await response.json();
      const matchDetailsPromises = matchIds.map(async (matchId: string) => {
        const matchResponse = await fetch(
          `${NEXT_PUBLIC_API_URL}/api/lol/match/v5/matches/${matchId}?region=${encodeURIComponent(
            tagline
          )}`
        );
        if (!matchResponse.ok) {
          throw new Error(
            `Failed to fetch match details (Status: ${matchResponse.status})`
          );
        }
        const matchData = await matchResponse.json();
        const participant = matchData.info.participants.find(
          (p: any) => p.puuid === foundPlayer.puuid
        );

        return {
          id: matchData.metadata.matchId,
          timestamp: matchData.info.gameCreation,
          gameType: matchData.info.gameMode,
          result: participant.win ? "win" : "loss",
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
        };
      });

      const matchDetails = await Promise.all(matchDetailsPromises);
      setMatches(matchDetails);
      onMatchesFound?.(matchDetails);
    } catch (err) {
      setMatchError(
        err instanceof Error ? err.message : "Failed to fetch matches"
      );
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleCompleteChallenge = async (winner: string) => {
    if (!challenge) return;

    try {
      await completeChallenge({
        challengeId: challenge.id,
        winner,
        stats: challenge.stats!,
      });

      onChallengeComplete?.(winner);
    } catch (error) {
      console.error("Failed to complete challenge:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isLoading && playerName && tagline) {
        handleSearch();
      }
    }
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatchId(match.id);
  };

  const isCreator = wallet.publicKey?.toString() === challenge?.creator;
  const isChallenger = wallet.publicKey?.toString() === challenge?.challenger;
  const canComplete =
    (isCreator || isChallenger) && challenge && !challenge.isComplete;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GamepadIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              Gaming Dashboard
            </span>
          </div>
          {foundPlayer && (
            <div className="flex items-center gap-4 bg-gray-700 px-4 py-2 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">
                {foundPlayer.gameName}#{foundPlayer.tagLine}
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Left Column - Player Search */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Search Panel */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                  <Search className="w-6 h-6 text-blue-400" />
                  Find Player
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Player Name
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter player name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => {
                        setTagline(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter tagline"
                    />
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={!playerName || !tagline || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Search
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Challenge Status with Create Button */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Sword className="w-6 h-6 text-purple-400" />
                    Challenge Status
                  </h2>
                  <button
                    onClick={() => setIsCreateChallengeOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Challenge
                  </button>
                </div>

                {challenges.length > 0 ? (
                  <ChallengeList
                    challenges={challenges}
                    onViewChallenge={handleViewChallenge}
                  />
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No active challenges
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Match History */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-400" />
                  Match History
                </h2>

                {foundPlayer && (
                  <button
                    onClick={handleFetchMatches}
                    disabled={isLoadingMatches}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                  >
                    {isLoadingMatches ? (
                      "Loading..."
                    ) : (
                      <>
                        <GamepadIcon className="w-5 h-5" />
                        Fetch Matches
                      </>
                    )}
                  </button>
                )}
              </div>

              {matchError && (
                <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100 text-sm mb-4">
                  {matchError}
                </div>
              )}

              {matches.length > 0 ? (
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="text-left p-3 text-gray-300">
                          Game Type
                        </th>
                        <th className="text-left p-3 text-gray-300">Result</th>
                        <th className="text-center p-3 text-gray-300">K/D/A</th>
                        <th className="text-right p-3 text-gray-300">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {matches.map((match) => (
                        <tr
                          key={match.id}
                          className={`hover:bg-gray-700/30 cursor-pointer ${
                            selectedMatchId === match.id ? "bg-gray-700/50" : ""
                          }`}
                          onClick={() => handleMatchSelect(match)}
                        >
                          <td className="p-3 text-gray-300">
                            {match.gameType}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                match.result === "win"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {match.result.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-center text-gray-300">
                            {match.kills}/{match.deaths}/{match.assists}
                          </td>
                          <td className="p-3 text-right text-gray-300">
                            {new Date(match.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {foundPlayer
                    ? "No matches found"
                    : "Search for a player to view matches"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateChallengeDialog
        isOpen={isCreateChallengeOpen}
        onClose={() => setIsCreateChallengeOpen(false)}
        onCreateChallenge={handleCreateChallenge}
      />

      <ChallengeDetailsDialog
        challenge={selectedChallenge}
        isOpen={isChallengeDetailsOpen}
        onClose={() => setIsChallengeDetailsOpen(false)}
        onAcceptChallenge={handleAcceptChallenge}
      />
    </div>
  );
};

export default PlayerSearch;
