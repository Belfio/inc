import { useWallet } from "@solana/wallet-adapter-react";
import incFactory from "../lib/incFactory";
import { Keypair, PublicKey } from "@solana/web3.js";

const CreateCompany = () => {
  const { wallet, connected } = useWallet();

  const handleInit = async () => {
    console.log("handleInit", wallet);
    if (wallet) {
      if (connected && wallet) {
        const initialize = async () => {
          try {
            const { provider, program, companyRegistry, user } =
              await incFactory.init(wallet.adapter as any);
            // Continue with your logic, e.g., creating a company
            const { companyAccount, companyPDA } =
              await incFactory.createCompany({
                companyRegistryPublicKey: new PublicKey(
                  "HmtYcFcnXBHCSHVxEyMGsZq4YNAFahzHQJfGwSkE43C9"
                ),
                wallet: wallet.adapter,
              });
            console.log("Company Account:", companyAccount);
            console.log("Company PDA:", companyPDA.toBase58());
          } catch (error) {
            console.error("Initialization error:", error);
          }
        };

        initialize();
      }
    }
  };
  return <button onClick={handleInit}>Create Company</button>;
};

export default CreateCompany;
