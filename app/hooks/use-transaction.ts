import { useConnection } from "@solana/wallet-adapter-react";
import { useState, useCallback } from "react";

export type TransactionStatus =
  | "idle"
  | "signing"
  | "confirming"
  | "confirmed"
  | "error";

interface TransactionState {
  status: TransactionStatus;
  signature: string | null;
  error: string | null;
}

/**
 * Hook to track transaction status with user feedback
 */
export function useTransactionStatus() {
  const { connection } = useConnection();
  const [state, setState] = useState<TransactionState>({
    status: "idle",
    signature: null,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      status: "idle",
      signature: null,
      error: null,
    });
  }, []);

  const startSigning = useCallback(() => {
    setState({
      status: "signing",
      signature: null,
      error: null,
    });
  }, []);

  const startConfirming = useCallback((signature: string) => {
    setState({
      status: "confirming",
      signature,
      error: null,
    });
  }, []);

  const setConfirmed = useCallback((signature: string) => {
    setState({
      status: "confirmed",
      signature,
      error: null,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      status: "error",
      error,
    }));
  }, []);

  const waitForConfirmation = useCallback(
    async (signature: string) => {
      startConfirming(signature);
      try {
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );
        setConfirmed(signature);
        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Transaction failed");
        return false;
      }
    },
    [connection, startConfirming, setConfirmed, setError]
  );

  return {
    ...state,
    reset,
    startSigning,
    startConfirming,
    setConfirmed,
    setError,
    waitForConfirmation,
  };
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(
  signature: string,
  network: "devnet" | "mainnet-beta" | "testnet" = "devnet"
): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${network}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressExplorerUrl(
  address: string,
  network: "devnet" | "mainnet-beta" | "testnet" = "devnet"
): string {
  return `https://explorer.solana.com/address/${address}?cluster=${network}`;
}
