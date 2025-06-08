import { useState } from "react";
import { Challenge } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ChallengeListProps {
  challenges: Challenge[];
  onChallengeUpdate: () => void;
}

const ChallengeList = ({
  challenges,
  onChallengeUpdate,
}: ChallengeListProps) => {
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const handleAcceptChallenge = async (challenge: Challenge) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        [challenge.lichessGameId]: true,
      }));

      const response = await fetch(
        `/api/lichess/challenge/${challenge.lichessGameId}/accept`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept challenge");
      }

      toast.success("Challenge accepted!");
      onChallengeUpdate();
    } catch (error) {
      console.error("Error accepting challenge:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to accept challenge"
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [challenge.lichessGameId]: false,
      }));
    }
  };

  const handleCompleteChallenge = async (challenge: Challenge) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        [challenge.lichessGameId]: true,
      }));

      const response = await fetch(
        `/api/lichess/challenge/${challenge.lichessGameId}/complete`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete challenge");
      }

      toast.success("Challenge completed!");
      onChallengeUpdate();
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to complete challenge"
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [challenge.lichessGameId]: false,
      }));
    }
  };

  if (challenges.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">No active challenges</div>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <div
          key={challenge.lichessGameId}
          className="bg-white rounded-lg shadow p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">
                {challenge.creator} vs{" "}
                {challenge.challenger || "Waiting for opponent"}
              </h3>
              <p className="text-sm text-gray-500">
                Wager: {challenge.wagerAmount} tokens
              </p>
              <p className="text-sm text-gray-500">
                Created{" "}
                {formatDistanceToNow(new Date(challenge.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div className="flex space-x-2">
              {!challenge.challenger && (
                <Button
                  onClick={() => handleAcceptChallenge(challenge)}
                  disabled={loadingStates[challenge.lichessGameId]}
                >
                  Accept
                </Button>
              )}
              {challenge.challenger && !challenge.completed && (
                <Button
                  onClick={() => handleCompleteChallenge(challenge)}
                  disabled={loadingStates[challenge.lichessGameId]}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
          {challenge.completed && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm">Winner: {challenge.winner}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChallengeList;
