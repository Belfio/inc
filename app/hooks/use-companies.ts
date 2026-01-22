import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { getCompanyRegistryPda, INC_FACTORY_PROGRAM_ID } from "~/lib/anchor/pda";

// Import IDL to decode accounts
import companyRegistryIdl from "~/lib/idl/company_registry.json";

export interface CompanyRegistry {
  companies: PublicKey[];
}

/**
 * Hook to fetch all companies from the registry
 */
export function useCompanies() {
  const { connection } = useConnection();
  const [registryPda] = getCompanyRegistryPda();

  return useQuery({
    queryKey: ["companies", registryPda.toBase58()],
    queryFn: async (): Promise<PublicKey[]> => {
      try {
        const accountInfo = await connection.getAccountInfo(registryPda);
        if (!accountInfo) {
          console.log("Registry not initialized");
          return [];
        }

        // Decode the account data
        // Skip the 8-byte discriminator
        const data = accountInfo.data.slice(8);

        // Read the vector length (4 bytes)
        const vecLen = data.readUInt32LE(0);
        const companies: PublicKey[] = [];

        // Read each pubkey (32 bytes each)
        for (let i = 0; i < vecLen; i++) {
          const start = 4 + i * 32;
          const pubkeyBytes = data.slice(start, start + 32);
          companies.push(new PublicKey(pubkeyBytes));
        }

        return companies;
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        return [];
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to check if a company name is available
 */
export function useCompanyNameAvailable(companyName: string) {
  const { data: companies, isLoading } = useCompanies();

  // This would require fetching each company's name
  // For now, we just return true (implement proper check later)
  return {
    isAvailable: true,
    isLoading,
  };
}
