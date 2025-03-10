// frontend/pages/index.tsx
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <h1 className="text-4xl font-bold text-white mb-8">Welcome to DuelBet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <Link href="/lichess">
          <div className="bg-gradient-to-br from-blue-800/40 to-blue-600/20 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm hover:from-blue-700/50 hover:to-blue-500/30 transition-all cursor-pointer group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Lichess Duel</h2>
            </div>
            <p className="text-gray-300">
              Challenge other players to chess duels on Lichess with crypto
              wagers on the line.
            </p>
          </div>
        </Link>

        <Link href="/h2h">
          <div className="bg-gradient-to-br from-purple-800/40 to-purple-600/20 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm hover:from-purple-700/50 hover:to-purple-500/30 transition-all cursor-pointer group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">H2H Duel</h2>
            </div>
            <p className="text-gray-300">
              Create direct wagers with friends or opponents for any type of
              competition or challenge.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12 text-center max-w-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          The Future of Peer-to-Peer Betting
        </h3>
        <p className="text-gray-300">
          DuelBet enables secure, transparent, and trustless wagers between
          users with the power of blockchain technology. No middlemen, no hidden
          fees - just direct competition with automatic payouts.
        </p>
      </div>
    </div>
  );
}
