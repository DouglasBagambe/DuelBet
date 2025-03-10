import PlayerSearch from "@/components/gaming/PlayerSearch";
import { useState } from "react";
import { LichessPlayer, Match } from "@/types"; // Updated to Lichess types

export default function Home() {
  const [playerData, setPlayerData] = useState<LichessPlayer | null>(null); // Updated to LichessPlayer
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null); // Updated to Match

  return (
    <div>
      <PlayerSearch
        onPlayerFound={setPlayerData} // Passes LichessPlayer
        onMatchesFound={(matches) => {
          // Optional: Set the first match as selected or handle matches as needed
          if (matches && matches.length > 0) {
            setSelectedMatch(matches[0]);
          }
        }}
      />
    </div>
  );
}
