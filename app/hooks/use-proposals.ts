import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { getProposalPda, getTreasuryPda } from "~/lib/anchor/pda";
import { useCompanyManagementProgram } from "./use-anchor-program";

// Proposal status enum
export enum ProposalStatus {
  Active = "Active",
  Passed = "Passed",
  Rejected = "Rejected",
  Executed = "Executed",
  Cancelled = "Cancelled",
}

// Proposal type enum
export type ProposalType =
  | { treasuryWithdrawal: { recipient: PublicKey; amount: BN } }
  | { addShareholder: { shareholder: PublicKey; shares: BN } }
  | { removeShareholder: { shareholder: PublicKey } }
  | { addVoter: { voter: PublicKey; votingPower: BN } }
  | { removeVoter: { voter: PublicKey } }
  | { updateCompanyName: { newName: string } }
  | { updateJurisdiction: { newJurisdiction: string } }
  | { transferAuthority: { newAuthority: PublicKey } }
  | { generic: Record<string, never> };

export interface VoteRecord {
  voter: PublicKey;
  voteFor: boolean;
  votingPower: BN;
}

export interface Proposal {
  id: BN;
  company: PublicKey;
  proposer: PublicKey;
  proposalType: ProposalType;
  description: string;
  votesFor: BN;
  votesAgainst: BN;
  votersVoted: VoteRecord[];
  status: ProposalStatus;
  createdAt: BN;
  expiresAt: BN;
  bump: number;
}

/**
 * Hook to fetch proposals for a company
 */
export function useProposals(companyAddress: string | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["proposals", companyAddress],
    queryFn: async (): Promise<Proposal[]> => {
      if (!companyAddress) return [];

      // For now, we'll return an empty array
      // In a real implementation, we'd scan for proposal PDAs
      // This would require iterating over possible proposal IDs
      // or using getProgramAccounts with appropriate filters
      return [];
    },
    enabled: !!companyAddress,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch a single proposal
 */
export function useProposal(companyAddress: string | null, proposalId: number | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["proposal", companyAddress, proposalId],
    queryFn: async (): Promise<Proposal | null> => {
      if (!companyAddress || proposalId === null) return null;

      try {
        const companyPubkey = new PublicKey(companyAddress);
        const [proposalPda] = getProposalPda(companyPubkey, proposalId);

        const accountInfo = await connection.getAccountInfo(proposalPda);
        if (!accountInfo) return null;

        // Decode proposal account
        // This would need proper decoding based on IDL
        return null;
      } catch (error) {
        console.error("Failed to fetch proposal:", error);
        return null;
      }
    },
    enabled: !!companyAddress && proposalId !== null,
    staleTime: 30000,
  });
}

/**
 * Hook to create a proposal
 */
export function useCreateProposal(companyAddress: string | null) {
  const { publicKey } = useWallet();
  const program = useCompanyManagementProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      proposalType,
      description,
    }: {
      proposalId: number;
      proposalType: ProposalType;
      description: string;
    }) => {
      if (!program || !publicKey || !companyAddress) {
        throw new Error("Wallet not connected or program not loaded");
      }

      const companyPubkey = new PublicKey(companyAddress);
      const [proposalPda] = getProposalPda(companyPubkey, proposalId);

      const tx = await program.methods
        .createProposal(new BN(proposalId), proposalType, description)
        .accounts({
          company: companyPubkey,
          proposal: proposalPda,
          proposer: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals", companyAddress] });
    },
  });
}

/**
 * Hook to cast a vote
 */
export function useCastVote(companyAddress: string | null) {
  const { publicKey } = useWallet();
  const program = useCompanyManagementProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      voteFor,
    }: {
      proposalId: number;
      voteFor: boolean;
    }) => {
      if (!program || !publicKey || !companyAddress) {
        throw new Error("Wallet not connected or program not loaded");
      }

      const companyPubkey = new PublicKey(companyAddress);
      const [proposalPda] = getProposalPda(companyPubkey, proposalId);

      const tx = await program.methods
        .castVote(voteFor)
        .accounts({
          company: companyPubkey,
          proposal: proposalPda,
          voter: publicKey,
        })
        .rpc();

      return tx;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", companyAddress, variables.proposalId] });
      queryClient.invalidateQueries({ queryKey: ["proposals", companyAddress] });
    },
  });
}

/**
 * Hook to execute a proposal
 */
export function useExecuteProposal(companyAddress: string | null) {
  const program = useCompanyManagementProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId }: { proposalId: number }) => {
      if (!program || !companyAddress) {
        throw new Error("Program not loaded");
      }

      const companyPubkey = new PublicKey(companyAddress);
      const [proposalPda] = getProposalPda(companyPubkey, proposalId);

      const tx = await program.methods
        .executeProposal()
        .accounts({
          company: companyPubkey,
          proposal: proposalPda,
        })
        .rpc();

      return tx;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", companyAddress, variables.proposalId] });
      queryClient.invalidateQueries({ queryKey: ["proposals", companyAddress] });
      queryClient.invalidateQueries({ queryKey: ["company", companyAddress] });
    },
  });
}
