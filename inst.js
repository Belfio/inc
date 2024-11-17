import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
(async () => {
  try {
    console.log("ANCHOR_PROVIDER_URL:", process.env.ANCHOR_PROVIDER_URL);
    console.log("ANCHOR_WALLET:", process.env.ANCHOR_WALLET);
    console.log("Initializing the registry");
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.IncFactory;

    // Generate a new Keypair for the company registry
    const [companyRegistry, _bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("company_registry")],
      program.programId
    );
    console.log("companyRegistry", companyRegistry);
    console.log("user", provider.wallet.publicKey.toBase58());
    console.log(
      "SystemProgram",
      anchor.web3.SystemProgram.programId.toBase58()
    );
    await program.methods
      .initializeRegistry()
      .accounts({
        companyRegistry: companyRegistry,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch the company registry account to verify initialization
    const registryAccount = await program.account.companyRegistry.fetch(
      companyRegistry
    );
    console.log("Registry Account");
    console.log(registryAccount);
  } catch (error) {
    console.error("Error initializing the registry:", error);
  }
})();
