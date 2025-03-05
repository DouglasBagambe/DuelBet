// frontend/pages/index.tsx

import PlayerSearch from "@/components/gaming/PlayerSearch";
import { useState } from "react";
import { PlayerData, MatchData } from "@/types";

export default function Home() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);

  return (
    <div>
      <PlayerSearch onPlayerFound={setPlayerData} />
    </div>
  );
}
