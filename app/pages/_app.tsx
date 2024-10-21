import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import CreateCompany from "~/components/Createcompany";
import GetCompanyList from "~/components/GetCompanyList";
import Init from "~/components/Init";

const Wallet = () => {
  const { connected, publicKey, wallet } = useWallet();

  return (
    <>
      <h1>Welcome to IncFactory</h1>
      {/* Your UI components */}
      {connected ? (
        <p>Connected as {publicKey?.toBase58()}</p>
      ) : (
        <p>Please connect your wallet.</p>
      )}

      <div className="flex flex-row gap-4 my-8">
        <WalletMultiButton />
        <WalletDisconnectButton />
        {/* Your app's components go here, nested within the context providers. */}
        <Init />
        <CreateCompany />
        <GetCompanyList />
      </div>
    </>
  );
};

export default Wallet;
