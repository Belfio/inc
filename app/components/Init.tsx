import { useWallet } from "@solana/wallet-adapter-react";
import incFactory from "../lib/incFactory";

const Init = () => {
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
                companyRegistry,
                user,
                provider,
                program,
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
  return <button onClick={handleInit}>Init</button>;
};

export default Init;
