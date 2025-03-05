// frontend/hooks/useProgram.ts

import { useEffect, useState } from "react";
import dotenv from "dotenv";

dotenv.config();
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@project-serum/anchor";
import { PublicKey, Connection } from "@solana/web3.js";

const PROGRAM_ID = "EqRQ5Ab5XnoE5x5nJWiRX4UzDrEt1VDiKiHmev4FsGS9";

if (!PROGRAM_ID) {
  throw new Error("NEXT_PUBLIC_PROGRAM_ID environment variable is not set");
}

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

        // TODO: Import actual IDL
        const idl = await Program.fetchIdl(new PublicKey(PROGRAM_ID), provider);

        if (!idl) {
          throw new Error("Failed to fetch program IDL");
        }

        const program = new Program(
          idl as Idl,
          new PublicKey(PROGRAM_ID),
          provider
        );

        // const program = new Program(idl, new PublicKey(PROGRAM_ID), provider);
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
