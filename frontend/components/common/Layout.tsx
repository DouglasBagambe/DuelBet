// frontend/components/common/Layout.tsx

import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <nav className="border-b border-blue-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1
                onClick={() => router.push("/")}
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent cursor-pointer"
              >
                Catoff
              </h1>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-blue-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Catoff. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
