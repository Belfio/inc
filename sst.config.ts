/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "inc",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: { aws: { region: "us-east-1" } },
    };
  },
  async run() {
    const site = new sst.aws.Remix("INCApp", {
      environment: {
        INC_PROGRAM_ID: "H1cFWB88pJvr443ak2gx1BpFVr2GcAZid38tEc5xUfk7",
        INC_FACTORY_PROGRAM_ID: "7kmLroKer2JooHLqQi8ugBRHhVVTudxUm1JsAa9gpyhK",
        INC_TOKEN_PROGRAM_ID: "8Vc5phYTpDDt92QKabTfNiQ2CaEcTKKMtGTovGkREdTP",
        INCCOIN_PROGRAM_ID: "Cbhb1XRLFxVc69yngp1iXJQmDVVTQPhzrXnCo939T9pL",
        SOLANA_RPC_URL: "https://api.devnet.solana.com",
      },
    });
    return { url: site.url };
  },
});
