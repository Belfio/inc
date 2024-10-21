import { useWallet } from "@solana/wallet-adapter-react";
import incFactory from "../lib/incFactory";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";

const GetCompanyList = () => {
  const { wallet, connected } = useWallet();
  const [companyList, setCompanyList] = useState([]);
  const handle = async () => {
    console.log("handleInit", wallet);
    if (wallet) {
      if (connected && wallet) {
        const getList = async () => {
          try {
            const companyList = await incFactory.getCompanyList({
              wallet: wallet.adapter as any,
            });
            companyList.forEach(async (company: PublicKey) => {
              const companyDetails = await incFactory.getCompanyDetails({
                wallet: wallet.adapter as any,
                companyPda: company,
              });
              setCompanyList((prev) => [...prev, companyDetails]);
            });
          } catch (error) {
            console.error("Initialization error:", error);
          }
        };

        getList();
      }
    }
  };
  return (
    <>
      <button onClick={handle}>Get Company List</button>
      <div>{JSON.stringify(companyList)}</div>
    </>
  );
};

export default GetCompanyList;
