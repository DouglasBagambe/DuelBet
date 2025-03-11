// frontend/components/gaming/PlayerSearch.tsx

import React, { useEffect, useState } from "react";
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
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  onPlayerFound,
  onMatchesFound,
  challenge,
  onChallengeComplete,
}) => {
  const wallet = useWallet();
  const {
    createChallenge,
    acceptChallenge,
    completeChallenge,
    getChallenges,
    loading: challengeLoading,
    error: challengeError,
    challenges, // Use challenges from the hook directly
  } = useChallenge(); // Destructure challenges from useChallenge
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundPlayer, setFoundPlayer] = useState<LichessPlayer | undefined>(
    undefined
  );
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>();

  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isChallengeDetailsOpen, setIsChallengeDetailsOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<
    Challenge | undefined
  >(undefined);

  const [activeTab, setActiveTab] = useState("Bullet");
  const [activeControl, setActiveControl] = useState("1+0");

  // Helper function to get time controls based on game type
  const getTimeControls = (tab: string) => {
    const controls = {
      Bullet: ["1+0", "2+1"],
      Blitz: ["3+0", "3+2", "5+0", "5+3"],
      Rapid: ["10+0", "10+5", "15+10"],
      Classical: ["30+0", "30+20"],
    };
    return controls[tab as keyof typeof controls] || [];
  };

  // Helper function to filter challenges
  const filterChallenges = (
    challenge: Challenge,
    tab: string,
    control: string
  ) => {
    const speedMap = {
      Bullet: ["1+0", "2+1"].includes(control),
      Blitz: ["3+0", "3+2", "5+0", "5+3"].includes(control),
      Rapid: ["10+0", "10+5", "15+10"].includes(control),
      Classical: ["30+0", "30+20"].includes(control),
    };
    return (
      speedMap[tab as keyof typeof speedMap] && challenge.speed === control
    );
  };

  const { program } = useProgram();

  useEffect(() => {
    if (wallet.connected && program) {
      console.log("Wallet connected and program ready, fetching challenges");
      getChallenges();
    }
  }, [wallet.connected, program, getChallenges]);

  // useEffect(() => {
  //   if (wallet.connected) {
  //     getChallenges(); // Fetch challenges when wallet connects
  //   }
  // }, [wallet.connected, getChallenges]);

  // Add a manual refresh button handler if not already present
  const handleRefreshChallenges = async () => {
    console.log("Manually refreshing challenges");
    await getChallenges();
  };

  console.log("PlayerSearch rendering with challenges:", challenges);

  // const [setChallenges] = useState<Challenge[]>([]);

  // useEffect(() => {
  //   const savedChallenges = localStorage.getItem("challenges");
  //   if (savedChallenges) setChallenges(JSON.parse(savedChallenges));
  // }, []);

  // const { createChallenge, acceptChallenge, completeChallenge, getChallenges, loading, error, challenges } = useChallenge();

  useEffect(() => {
    // Add logic to fetch challenges if needed
  }, []);

  useEffect(() => {
    let mounted = true; // Prevent memory leaks
    if (wallet.connected && mounted) {
      getChallenges();
    }
    return () => {
      mounted = false; // Cleanup
    };
  }, [wallet.connected]); // Only re-run on wallet connection change

  const handleCreateChallenge = async (
    challengeData: Omit<Challenge, "id" | "creator" | "isComplete">
  ) => {
    if (!wallet.connected || !foundPlayer) {
      setError("Wallet or player not connected/found");
      return;
    }

    try {
      const challengeId = await createChallenge({
        wagerAmount: challengeData.wagerAmount,
        lichessUsername: challengeData.lichessUsername,
        stats: challengeData.stats || {
          matchId: "",
          playerStats: {
            result: "draw",
            variant: "Standard",
            speed: "Unknown",
          },
        },
      });

      if (challengeId) {
        getChallenges(); // Refresh the list
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create challenge"
      );
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    if (!wallet.connected) {
      setError("Wallet not connected");
      return;
    }

    try {
      const challengeToAccept = challenges.find(
        (c: Challenge) => c.id === challengeId
      );
      if (!challengeToAccept) {
        setError("Challenge not found");
        return;
      }

      const success = await acceptChallenge({
        challengeId,
        wagerAmount: challengeToAccept.wagerAmount,
        lichessUsername: challengeToAccept.lichessUsername,
      });

      if (success) {
        getChallenges(); // Refresh the list
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept challenge"
      );
    }
  };

  const handleViewChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsChallengeDetailsOpen(true);
  };

  const handleSearch = async () => {
    if (!playerName) {
      setError("Please enter a Lichess username");
      return;
    }

    setIsLoading(true);
    setError("");
    setFoundPlayer(undefined);

    try {
      // Use the Fetch API instead of child_process exec
      const response = await fetch(
        `https://lichess.org/api/user/${encodeURIComponent(playerName)}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to find player: ${response.status} ${response.statusText}`
        );
      }

      const playerData = (await response.json()) as LichessPlayer;
      setFoundPlayer(playerData);
      onPlayerFound?.(playerData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to find player. Please check the username."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchMatches = async () => {
    if (!foundPlayer?.id) {
      setMatchError("Player information is required");
      return;
    }

    setIsLoadingMatches(true);
    setMatchError("");

    try {
      // Use the Fetch API instead of child_process exec
      const response = await fetch(
        `https://lichess.org/api/games/user/${encodeURIComponent(
          foundPlayer.id
        )}?max=5`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch matches: ${response.status} ${response.statusText}`
        );
      }

      const text = await response.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        throw new Error("No recent games found for this player.");
      }

      // Parse NDJSON (newline-delimited JSON) from Lichess
      const games = lines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.error("Error parsing match line:", e, "Line:", line);
            return null;
          }
        })
        .filter((game) => game !== null);

      // Transform Lichess games into Match format
      const matchDetails: Match[] = games.map((game: any) => ({
        id: game.id,
        timestamp: game.createdAt || game.lastMoveAt || Date.now(),
        gameType: game.speed || "Unknown",
        result: determineResult(game, foundPlayer.id),
        variant: game.variant || "Standard",
      }));

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

  // Helper function to determine match result from player's perspective
  const determineResult = (
    game: any,
    playerId: string
  ): "win" | "loss" | "draw" => {
    if (!game.winner) return "draw";

    // Check if the player was white or black
    const isPlayerWhite = game.players?.white?.user?.id === playerId;
    const isPlayerBlack = game.players?.black?.user?.id === playerId;

    if (isPlayerWhite && game.winner === "white") return "win";
    if (isPlayerBlack && game.winner === "black") return "win";
    return "loss";
  };

  const handleCompleteChallenge = async (winner: string) => {
    if (!challenge || !challenge.id) return;

    try {
      await completeChallenge({
        challengeId: challenge.id,
        winner,
        stats: challenge.stats || {
          matchId: "",
          playerStats: {
            result: "draw",
            variant: "Standard",
            speed: "Unknown",
          },
        },
      });

      onChallengeComplete?.(winner);
    } catch (error) {
      console.error("Failed to complete challenge:", error);
      setError(
        error instanceof Error ? error.message : "Failed to complete challenge"
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isLoading && playerName) {
        handleSearch();
      }
    }
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatchId(match.id);
  };

  const isCreator = wallet.publicKey?.toString() === challenge?.creator;
  const isChallenger = wallet.publicKey?.toString() === challenge?.challenger;
  const canComplete = !!(
    (isCreator || isChallenger) &&
    challenge &&
    !challenge.isComplete
  );

  return (
    <div className="min-h-[80vh] bg-gray-900">
      {/* Top Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GamepadIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              Duel Dashboard
            </span>
          </div>
          {foundPlayer && (
            <div className="flex items-center gap-4 bg-gray-700 px-4 py-2 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">
                {foundPlayer.username}
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
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                <Search className="w-6 h-6 text-blue-400" />
                Find Player
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Lichess Username
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => {
                      setPlayerName(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Lichess username"
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={!playerName || isLoading}
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

            {/* Matches */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
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
                            {match.gameType} ({match.variant})
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                match.result === "win"
                                  ? "bg-green-100 text-green-800"
                                  : match.result === "loss"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {match.result.toUpperCase()}
                            </span>
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

          {/* Right Column - Challenge Status */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              {/* Header with Create Button and Refresh */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Sword className="w-6 h-6 text-purple-400" />
                  Challenge Status
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsCreateChallengeOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    New Challenge
                  </button>
                  <button
                    onClick={handleRefreshChallenges}
                    disabled={challengeLoading}
                    className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh Challenges"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${
                        challengeLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="mb-4">
                <div className="flex space-x-2 mb-2">
                  {["All", "Bullet", "Blitz", "Rapid", "Classical"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setActiveTab(type);
                          setActiveControl(type === "All" ? "" : activeControl);
                        }}
                        className={`px-4 py-2 rounded-t-lg transition-all duration-300 ${
                          activeTab === type
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
                <div className="flex space-x-2">
                  {activeTab !== "All" &&
                    getTimeControls(activeTab).map((control) => (
                      <button
                        key={control}
                        onClick={() => setActiveControl(control)}
                        className={`px-3 py-1 rounded transition-all duration-300 text-sm ${
                          activeControl === control
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        {control}
                      </button>
                    ))}
                </div>
              </div>

              {/* Scrollable Challenge List */}
              <div className="h-[60vh] overflow-y-auto">
                <ChallengeList
                  challenges={
                    activeTab === "All"
                      ? challenges
                      : challenges.filter((c) =>
                          filterChallenges(c, activeTab, activeControl)
                        )
                  }
                  onViewChallenge={handleViewChallenge}
                  onAcceptChallenge={handleAcceptChallenge}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateChallengeDialog
        isOpen={isCreateChallengeOpen}
        onClose={() => setIsCreateChallengeOpen(false)}
        onCreateChallenge={handleCreateChallenge}
        player={foundPlayer} // Pass foundPlayer to dialog for Lichess username
      />

      <ChallengeDetailsDialog
        challenge={selectedChallenge}
        isOpen={isChallengeDetailsOpen}
        onClose={() => setIsChallengeDetailsOpen(false)}
        onAcceptChallenge={handleAcceptChallenge}
        onCompleteChallenge={handleCompleteChallenge} // Added to pass complete functionality
        canComplete={canComplete}
      />
    </div>
  );
};

export default PlayerSearch;
