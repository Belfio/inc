import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-md !h-10 !px-4 !text-sm !font-medium" />;
}

export function useWalletConnected() {
  const { connected, publicKey } = useWallet();
  return { connected, publicKey };
}
