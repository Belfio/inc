import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import {
  createProvider,
  getCompanyManagementProgram,
  getCompanyRegistryProgram,
  getIncTokenProgram,
  getInccoinProgram,
} from "~/lib/anchor/programs";

/**
 * Hook to get the Anchor provider
 */
export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    return createProvider(connection, wallet);
  }, [connection, wallet]);
}

/**
 * Hook to get the Company Management program
 */
export function useCompanyManagementProgram() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) return null;
    return getCompanyManagementProgram(provider);
  }, [provider]);
}

/**
 * Hook to get the Company Registry program
 */
export function useCompanyRegistryProgram() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) return null;
    return getCompanyRegistryProgram(provider);
  }, [provider]);
}

/**
 * Hook to get the INC Token program
 */
export function useIncTokenProgram() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) return null;
    return getIncTokenProgram(provider);
  }, [provider]);
}

/**
 * Hook to get the Inccoin program
 */
export function useInccoinProgram() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) return null;
    return getInccoinProgram(provider);
  }, [provider]);
}
