import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface Shareholder {
  address: PublicKey;
  shares: BN;
}

export interface Voter {
  address: PublicKey;
  votingPower: BN;
}

export interface Company {
  companyName: string;
  jurisdiction: string;
  authority: PublicKey;
  pendingAuthority: PublicKey | null;
  treasury: PublicKey;
  shareholders: Shareholder[];
  voters: Voter[];
  bump: number;
}

/**
 * Decode a company account from raw data
 */
function decodeCompany(data: Buffer): Company {
  let offset = 8; // Skip discriminator

  // Read company name (String: 4-byte length + bytes)
  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const companyName = data.slice(offset, offset + nameLen).toString("utf8");
  offset += nameLen;

  // Read jurisdiction
  const jurisdictionLen = data.readUInt32LE(offset);
  offset += 4;
  const jurisdiction = data.slice(offset, offset + jurisdictionLen).toString("utf8");
  offset += jurisdictionLen;

  // Read authority (32 bytes)
  const authority = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // Read pending authority (Option<Pubkey>: 1 byte discriminant + 32 bytes if Some)
  const hasPendingAuthority = data.readUInt8(offset) === 1;
  offset += 1;
  let pendingAuthority: PublicKey | null = null;
  if (hasPendingAuthority) {
    pendingAuthority = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
  }

  // Read treasury (32 bytes)
  const treasury = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  // Read shareholders (Vec<Shareholder>)
  const shareholdersLen = data.readUInt32LE(offset);
  offset += 4;
  const shareholders: Shareholder[] = [];
  for (let i = 0; i < shareholdersLen; i++) {
    const address = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const shares = new BN(data.slice(offset, offset + 8), "le");
    offset += 8;
    shareholders.push({ address, shares });
  }

  // Read voters (Vec<Voter>)
  const votersLen = data.readUInt32LE(offset);
  offset += 4;
  const voters: Voter[] = [];
  for (let i = 0; i < votersLen; i++) {
    const address = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const votingPower = new BN(data.slice(offset, offset + 8), "le");
    offset += 8;
    voters.push({ address, votingPower });
  }

  // Read bump
  const bump = data.readUInt8(offset);

  return {
    companyName,
    jurisdiction,
    authority,
    pendingAuthority,
    treasury,
    shareholders,
    voters,
    bump,
  };
}

/**
 * Hook to fetch a single company by address
 */
export function useCompany(companyAddress: string | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["company", companyAddress],
    queryFn: async (): Promise<Company | null> => {
      if (!companyAddress) return null;

      try {
        const pubkey = new PublicKey(companyAddress);
        const accountInfo = await connection.getAccountInfo(pubkey);

        if (!accountInfo) {
          console.log("Company not found");
          return null;
        }

        return decodeCompany(accountInfo.data as Buffer);
      } catch (error) {
        console.error("Failed to fetch company:", error);
        return null;
      }
    },
    enabled: !!companyAddress,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch multiple companies by addresses
 */
export function useCompaniesByAddresses(addresses: PublicKey[]) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["companies-batch", addresses.map(a => a.toBase58()).join(",")],
    queryFn: async (): Promise<(Company | null)[]> => {
      if (addresses.length === 0) return [];

      try {
        const accountInfos = await connection.getMultipleAccountsInfo(addresses);

        return accountInfos.map((info) => {
          if (!info) return null;
          try {
            return decodeCompany(info.data as Buffer);
          } catch {
            return null;
          }
        });
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        return [];
      }
    },
    enabled: addresses.length > 0,
    staleTime: 30000,
  });
}
