import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, type ReactNode } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: ReactNode;
  network?: "devnet" | "mainnet-beta" | "testnet";
  rpcUrl?: string;
}

export function SolanaWalletProvider({
  children,
  network = "devnet",
  rpcUrl,
}: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => {
    if (rpcUrl) return rpcUrl;
    return clusterApiUrl(network);
  }, [network, rpcUrl]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
