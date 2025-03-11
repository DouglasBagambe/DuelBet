import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Clock, Wallet, Sword, Trophy } from "lucide-react";

interface Challenge {
  id: string;
  lichessUsername?: string;
  creator?: string;
  timeControl?: string;
  wagerAmount: number;
  isComplete: boolean;
  challenger?: string;
}

interface ChessCardProps {
  challenge: Challenge;
  onViewChallenge: (challenge: Challenge) => void;
  onAcceptChallenge: (id: string) => void;
}

const ChessCard: React.FC<ChessCardProps> = ({
  challenge,
  onViewChallenge,
  onAcceptChallenge,
}) => {
  const statusColors = {
    open: { bg: "bg-blue-500/20", text: "text-blue-300" },
    inProgress: { bg: "bg-yellow-500/20", text: "text-yellow-300" },
    completed: { bg: "bg-green-500/20", text: "text-green-300" },
  };

  const getStatus = () => {
    if (challenge.isComplete)
      return { label: "Completed", style: statusColors.completed };
    if (challenge.challenger)
      return { label: "In Progress", style: statusColors.inProgress };
    return { label: "Open", style: statusColors.open };
  };

  const status = getStatus();

  return (
    <Card
      className="bg-gradient-to-br from-gray-800 to-gray-700 border border-purple-500/30 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
      onClick={() => onViewChallenge(challenge)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Top section: Username and Status */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">
                {challenge.lichessUsername || "Anonymous"}
              </span>
            </div>
            <div
              className={`${status.style.bg} ${status.style.text} text-xs py-1 px-3 rounded-full font-medium`}
            >
              {status.label}
            </div>
          </div>

          {/* Middle section: Challenge details */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300 text-sm">Creator</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">Time Control</span>
            </div>
            <div className="flex items-center gap-1">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 text-sm">Wager</span>
            </div>
            <div className="text-white text-sm font-medium truncate">
              {challenge.creator || "Unknown"}
            </div>
            <div className="text-white text-sm font-medium">
              {challenge.timeControl || "10+0"}
            </div>
            <div className="text-white text-sm font-medium">
              {challenge.wagerAmount} SOL
            </div>
          </div>

          {/* Bottom section: Action button (if applicable) */}
          {!challenge.challenger && !challenge.isComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAcceptChallenge(challenge.id);
              }}
              className="bg-green-600 hover:bg-green-500 text-white py-1.5 px-4 rounded-md text-sm flex items-center justify-center gap-1.5 transition-all w-full mt-1 font-medium"
            >
              <Sword className="w-4 h-4" /> Accept Challenge
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChessCard;
