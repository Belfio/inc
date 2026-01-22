import { PublicKey } from "@solana/web3.js";
import { createHash } from "crypto";

// Program IDs
export const INC_PROGRAM_ID = new PublicKey(
  "H1cFWB88pJvr443ak2gx1BpFVr2GcAZid38tEc5xUfk7"
);
export const INC_FACTORY_PROGRAM_ID = new PublicKey(
  "AygfummZBxjDZoE3FhoWfyG2mvBE3jZS1FM2sNttDvvv"
);
export const INC_TOKEN_PROGRAM_ID = new PublicKey(
  "8Vc5phYTpDDt92QKabTfNiQ2CaEcTKKMtGTovGkREdTP"
);
export const INCCOIN_PROGRAM_ID = new PublicKey(
  "Cbhb1XRLFxVc69yngp1iXJQmDVVTQPhzrXnCo939T9pL"
);

/**
 * Hash a company name using SHA256
 */
export function hashCompanyName(companyName: string): Uint8Array {
  const hash = createHash("sha256");
  hash.update(companyName);
  return new Uint8Array(hash.digest());
}

/**
 * Get the Company Registry PDA
 */
export function getCompanyRegistryPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("company_registry")],
    INC_FACTORY_PROGRAM_ID
  );
}

/**
 * Get a Company PDA from company name
 */
export function getCompanyPda(companyName: string): [PublicKey, number] {
  const nameHash = hashCompanyName(companyName);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("company"), nameHash],
    INC_PROGRAM_ID
  );
}

/**
 * Get a Company PDA from name hash
 */
export function getCompanyPdaFromHash(
  nameHash: Uint8Array
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("company"), nameHash],
    INC_PROGRAM_ID
  );
}

/**
 * Get the Treasury PDA for a company
 */
export function getTreasuryPda(companyPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), companyPubkey.toBuffer()],
    INC_PROGRAM_ID
  );
}

/**
 * Get a Proposal PDA
 */
export function getProposalPda(
  companyPubkey: PublicKey,
  proposalId: bigint | number
): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8);
  idBuffer.writeBigUInt64LE(BigInt(proposalId));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), companyPubkey.toBuffer(), idBuffer],
    INC_PROGRAM_ID
  );
}

/**
 * Get Token Config PDA for a company
 */
export function getTokenConfigPda(companyPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("token_config"), companyPubkey.toBuffer()],
    INC_TOKEN_PROGRAM_ID
  );
}

/**
 * Get Share Token Mint PDA for a company
 */
export function getShareMintPda(companyPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("share_mint"), companyPubkey.toBuffer()],
    INC_TOKEN_PROGRAM_ID
  );
}

/**
 * Get Voting Token Mint PDA for a company
 */
export function getVotingMintPda(companyPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("voting_mint"), companyPubkey.toBuffer()],
    INC_TOKEN_PROGRAM_ID
  );
}

/**
 * Get Inccoin Config PDA
 */
export function getInccoinConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("inccoin_config")],
    INCCOIN_PROGRAM_ID
  );
}

/**
 * Get Inccoin Mint PDA
 */
export function getInccoinMintPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("inccoin_mint")],
    INCCOIN_PROGRAM_ID
  );
}

/**
 * Get Authorized Minter PDA for Inccoin
 */
export function getAuthorizedMinterPda(
  minterPubkey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("minter"), minterPubkey.toBuffer()],
    INCCOIN_PROGRAM_ID
  );
}

/**
 * Shorten a public key for display
 */
export function shortenAddress(address: PublicKey | string, chars = 4): string {
  const str = typeof address === "string" ? address : address.toBase58();
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}
