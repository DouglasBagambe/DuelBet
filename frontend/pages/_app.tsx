// frontend/pages/_app.tsx
import { AppProps } from "next/app";
import { useMemo } from "react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/common/Layout";
import "@/styles/global.css";
require("@solana/wallet-adapter-react-ui/styles.css");

// Default to 'devnet' for development, you can change this based on environment
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize wallets that you want to use
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  // Initialize connection endpoint
  const endpoint = useMemo(
    () => clusterApiUrl(network as "devnet" | "testnet" | "mainnet-beta"),
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Layout>
            <Component {...pageProps} />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#333",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                },
                error: {
                  duration: 4000,
                },
              }}
            />
          </Layout>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
