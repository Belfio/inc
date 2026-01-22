import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";

// Import IDL files
import companyManagementIdl from "~/lib/idl/company_management.json";
import companyRegistryIdl from "~/lib/idl/company_registry.json";
import incTokenIdl from "~/lib/idl/inc_token.json";
import inccoinIdl from "~/lib/idl/inccoin.json";

// Program IDs
export const COMPANY_MANAGEMENT_PROGRAM_ID = new PublicKey(
  "H1cFWB88pJvr443ak2gx1BpFVr2GcAZid38tEc5xUfk7"
);
export const COMPANY_REGISTRY_PROGRAM_ID = new PublicKey(
  "AygfummZBxjDZoE3FhoWfyG2mvBE3jZS1FM2sNttDvvv"
);
export const INC_TOKEN_PROGRAM_ID = new PublicKey(
  "8Vc5phYTpDDt92QKabTfNiQ2CaEcTKKMtGTovGkREdTP"
);
export const INCCOIN_PROGRAM_ID = new PublicKey(
  "Cbhb1XRLFxVc69yngp1iXJQmDVVTQPhzrXnCo939T9pL"
);

// Type definitions based on IDL
export type CompanyManagement = typeof companyManagementIdl;
export type CompanyRegistry = typeof companyRegistryIdl;
export type IncToken = typeof incTokenIdl;
export type Inccoin = typeof inccoinIdl;

/**
 * Create an Anchor provider from wallet and connection
 */
export function createProvider(
  connection: Connection,
  wallet: AnchorWallet
): AnchorProvider {
  return new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
}

/**
 * Get the Company Management program instance
 */
export function getCompanyManagementProgram(
  provider: AnchorProvider
): Program<CompanyManagement> {
  return new Program(
    companyManagementIdl as CompanyManagement,
    provider
  );
}

/**
 * Get the Company Registry program instance
 */
export function getCompanyRegistryProgram(
  provider: AnchorProvider
): Program<CompanyRegistry> {
  return new Program(
    companyRegistryIdl as CompanyRegistry,
    provider
  );
}

/**
 * Get the INC Token program instance
 */
export function getIncTokenProgram(
  provider: AnchorProvider
): Program<IncToken> {
  return new Program(
    incTokenIdl as IncToken,
    provider
  );
}

/**
 * Get the Inccoin program instance
 */
export function getInccoinProgram(
  provider: AnchorProvider
): Program<Inccoin> {
  return new Program(
    inccoinIdl as Inccoin,
    provider
  );
}
