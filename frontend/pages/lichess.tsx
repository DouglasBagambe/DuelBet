import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLichess } from "../hooks/useLichess";
import { useLichessChallenge } from "../hooks/useLichessChallenge";
import { useChallenges } from "../hooks/useChallenges";
import { useTokenAccounts } from "../hooks/useTokenAccounts";
import PlayerSearch from "../components/gaming/PlayerSearch";
import ChallengeList from "../components/gaming/ChallengeList";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/pkce";

const LICHESS_OAUTH_URL = "https://lichess.org/oauth";

export default function LichessPage() {
  const wallet = useWallet();
  const { isAuthenticated, isLoading: isLichessLoading, user } = useLichess();
  const { createChallenge: createLichessChallenge } = useLichess();
  const { createChallenge: createBlockchainChallenge } = useLichessChallenge();
  const {
    challenges,
    isLoading: isChallengesLoading,
    refresh: refreshChallenges,
  } = useChallenges();
  const { tokenAccount, balance } = useTokenAccounts();

  const [selectedPlayer, setSelectedPlayer] = useState<{
    username: string;
  } | null>(null);
  const [wagerAmount, setWagerAmount] = useState("");
  const [timeControl, setTimeControl] = useState({
    initialTime: 600, // 10 minutes
    increment: 5,
    variant: "standard",
  });

  const handleAuthenticate = async () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_LICHESS_CLIENT_ID;
      console.log("Client ID:", clientId); // Debug log
      if (!clientId) {
        throw new Error("Lichess client ID not configured");
      }

      const redirectUri = `${window.location.origin}/lichess/callback`;
      const state = crypto.randomUUID(); // More secure than Math.random()

      // Generate PKCE values
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store state and code verifier in sessionStorage (more secure than localStorage)
      sessionStorage.setItem("lichess_oauth_state", state);
      sessionStorage.setItem("lichess_code_verifier", codeVerifier);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope: "challenge:write", // Only request what we need
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      const authUrl = `${LICHESS_OAUTH_URL}?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to start authentication");
    }
  };

  const handleCreateChallenge = async () => {
    console.log("Wallet state:", {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString(),
      selectedPlayer,
      tokenAccount: tokenAccount?.toString(),
      balance,
    });

    if (!wallet.connected || !selectedPlayer) {
      toast.error("Please connect your wallet and select an opponent");
      return;
    }

    if (!tokenAccount) {
      try {
        const newTokenAccount = await createTokenAccount();
        if (!newTokenAccount) {
          toast.error("Failed to create token account");
          return;
        }
      } catch (error) {
        console.error("Error creating token account:", error);
        toast.error("Failed to create token account");
        return;
      }
    }

    if (
      !wagerAmount ||
      isNaN(Number(wagerAmount)) ||
      Number(wagerAmount) <= 0
    ) {
      toast.error("Please enter a valid wager amount");
      return;
    }

    if (balance < Number(wagerAmount)) {
      toast.error(
        "Insufficient token balance. You need to get some tokens first. Visit the faucet to get tokens."
      );
      return;
    }

    try {
      // Create challenge on Lichess
      const lichessChallenge = await createLichessChallenge(
        selectedPlayer.username,
        timeControl
      );

      if (!lichessChallenge) {
        throw new Error("Failed to create Lichess challenge");
      }

      // Create challenge on blockchain
      const tx = await createBlockchainChallenge(
        Number(wagerAmount),
        lichessChallenge.id,
        timeControl
      );

      toast.success("Challenge created successfully!");
      refreshChallenges();
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create challenge"
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Lichess Challenges</h1>
          {!isAuthenticated && (
            <Button onClick={handleAuthenticate} disabled={isLichessLoading}>
              {isLichessLoading ? "Loading..." : "Authenticate with Lichess"}
            </Button>
          )}
          {isAuthenticated && user && (
            <div className="text-sm text-gray-600">
              Logged in as {user.username}
            </div>
          )}
        </div>

        {isAuthenticated && (
          <>
            <div className="grid gap-4">
              <PlayerSearch
                onSelect={setSelectedPlayer}
                selectedPlayer={selectedPlayer}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Wager Amount
                  </label>
                  <Input
                    type="number"
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(e.target.value)}
                    placeholder="Enter wager amount"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Time Control
                  </label>
                  <Select
                    value={timeControl.variant}
                    onValueChange={(value) =>
                      setTimeControl((prev) => ({ ...prev, variant: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="chess960">Chess960</SelectItem>
                      <SelectItem value="crazyhouse">Crazyhouse</SelectItem>
                      <SelectItem value="antichess">Antichess</SelectItem>
                      <SelectItem value="atomic">Atomic</SelectItem>
                      <SelectItem value="horde">Horde</SelectItem>
                      <SelectItem value="kingOfTheHill">
                        King of the Hill
                      </SelectItem>
                      <SelectItem value="racingKings">Racing Kings</SelectItem>
                      <SelectItem value="threeCheck">Three Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCreateChallenge}
                  disabled={!selectedPlayer || !wagerAmount}
                >
                  Create Challenge
                </Button>
                {balance === 0 && (
                  <div className="text-sm text-yellow-600">
                    You need tokens to create challenges. Visit the faucet to
                    get some tokens.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Active Challenges</h2>
              <ChallengeList
                challenges={challenges}
                onChallengeUpdate={refreshChallenges}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
