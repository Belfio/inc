import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export function NetworkBadge() {
  const { connection } = useConnection();
  const [network, setNetwork] = useState<string>("unknown");

  useEffect(() => {
    const endpoint = connection.rpcEndpoint;
    if (endpoint.includes("devnet")) {
      setNetwork("devnet");
    } else if (endpoint.includes("mainnet")) {
      setNetwork("mainnet");
    } else if (endpoint.includes("testnet")) {
      setNetwork("testnet");
    } else if (endpoint.includes("localhost") || endpoint.includes("127.0.0.1")) {
      setNetwork("localnet");
    } else {
      setNetwork("custom");
    }
  }, [connection]);

  const colors: Record<string, string> = {
    devnet: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    mainnet: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    testnet: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    localnet: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    unknown: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[network]}`}>
      {network}
    </span>
  );
}
