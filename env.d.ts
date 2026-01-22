/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare module "*.css?url" {
  const url: string;
  export default url;
}

interface Window {
  ENV: {
    INC_PROGRAM_ID: string;
    INC_FACTORY_PROGRAM_ID: string;
    INC_TOKEN_PROGRAM_ID: string;
    INCCOIN_PROGRAM_ID: string;
    SOLANA_RPC_URL: string;
  };
}
