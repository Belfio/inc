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
            console.log(`
              provider: ${provider.wallet.publicKey}
              program: ${program.programId}
              companyRegistry: ${companyRegistry.publicKey}
              user: ${user.publicKey}
            `);
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
