// frontend/hooks/useProgram.ts

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@project-serum/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import gamingChallengeIdl from "../types/idl/gaming_challenge.json"; // Import your IDL

const PROGRAM_ID = "G2oEwdxGH5ygDFoQNfShxTn3EifGqsDynazPnLUqkQQT";

export const useProgram = () => {
  const wallet = useWallet();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProgram = async () => {
      if (!wallet.connected) {
        setProgram(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const connection = new Connection(
          process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
            "https://api.devnet.solana.com"
        );

        const provider = new AnchorProvider(
          connection,
          wallet as any,
          AnchorProvider.defaultOptions()
        );

        const program = new Program(
          gamingChallengeIdl as Idl,
          new PublicKey(PROGRAM_ID),
          provider
        );

        setProgram(program);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize program"
        );
        setProgram(null);
      } finally {
        setLoading(false);
      }
    };

    initializeProgram();
  }, [wallet.connected]);

  return {
    program,
    loading,
    error,
  };
};
