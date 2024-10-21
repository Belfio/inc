import type { MetaFunction } from "@remix-run/node";
import Wallet from "~/pages/_app";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Start of Selection
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Index() {
  return <Wallet />;
}
