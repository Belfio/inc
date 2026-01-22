import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { getTreasuryPda } from "~/lib/anchor/pda";
import { useCompanyManagementProgram } from "./use-anchor-program";

/**
 * Hook to fetch treasury balance for a company
 */
export function useTreasuryBalance(companyAddress: string | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["treasury-balance", companyAddress],
    queryFn: async (): Promise<number> => {
      if (!companyAddress) return 0;

      try {
        const companyPubkey = new PublicKey(companyAddress);
        const [treasuryPda] = getTreasuryPda(companyPubkey);

        const balance = await connection.getBalance(treasuryPda);
        return balance / LAMPORTS_PER_SOL;
      } catch (error) {
        console.error("Failed to fetch treasury balance:", error);
        return 0;
      }
    },
    enabled: !!companyAddress,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to deposit funds to treasury
 */
export function useDepositFunds(companyAddress: string | null) {
  const { publicKey } = useWallet();
  const program = useCompanyManagementProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountSol: number) => {
      if (!program || !publicKey || !companyAddress) {
        throw new Error("Wallet not connected or program not loaded");
      }

      const companyPubkey = new PublicKey(companyAddress);
      const [treasuryPda] = getTreasuryPda(companyPubkey);
      const amountLamports = new BN(amountSol * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .depositFunds(amountLamports)
        .accounts({
          company: companyPubkey,
          treasury: treasuryPda,
          depositor: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    onSuccess: () => {
      // Invalidate treasury balance query
      queryClient.invalidateQueries({ queryKey: ["treasury-balance", companyAddress] });
    },
  });
}

/**
 * Hook to withdraw funds from treasury
 */
export function useWithdrawFunds(companyAddress: string | null) {
  const { publicKey } = useWallet();
  const program = useCompanyManagementProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amountSol, recipient }: { amountSol: number; recipient: string }) => {
      if (!program || !publicKey || !companyAddress) {
        throw new Error("Wallet not connected or program not loaded");
      }

      const companyPubkey = new PublicKey(companyAddress);
      const [treasuryPda] = getTreasuryPda(companyPubkey);
      const recipientPubkey = new PublicKey(recipient);
      const amountLamports = new BN(amountSol * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .withdrawFunds(amountLamports)
        .accounts({
          company: companyPubkey,
          treasury: treasuryPda,
          recipient: recipientPubkey,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasury-balance", companyAddress] });
    },
  });
}
