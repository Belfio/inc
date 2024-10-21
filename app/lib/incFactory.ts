import * as anchor from "@coral-xyz/anchor";

import {
  Keypair,
  Connection,
  clusterApiUrl,
  PublicKey,
  // Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { IncFactory } from "../../target/types/inc_factory"; // Adjust the path as needed
import idl from "../../target/idl/inc_factory.json"; // Adjust the path as needed

// import { Keypair, PublicKey } from "@solana/web3.js";
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const PROGRAM_ID = new PublicKey(
  "7kmLroKer2JooHLqQi8ugBRHhVVTudxUm1JsAa9gpyhK"
);
const airdropSol = async (wallet: anchor.Wallet) => {
  // const signature = await provider.connection.requestAirdrop(
  //   wallet.publicKey,
  //   anchor.web3.LAMPORTS_PER_SOL
  // );
  // await provider.connection.confirmTransaction(signature);
};

// Define a function to initialize the provider manually
const init = async (wallet: anchor.Wallet) => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("connection", connection);
  // Manually create the AnchorProvider
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  anchor.setProvider(provider);
  // const program = anchor.workspace.IncFactory as Program<IncFactory>;
  console.log("idl", idl);
  console.log("PROGRAM_ID", PROGRAM_ID.toBase58());
  const program = new Program(idl, provider);
  console.log("Program instantiated:", program.programId.toBase58());

  const companyRegistry = new Keypair();
  // Generate a new Keypair for the company registry

  console.log(`
   Company registry: ${companyRegistry.publicKey}
   user: ${wallet.publicKey}
   systemProgram: ${SystemProgram.programId}
 `);

  await program.methods
    .initializeRegistry()
    .accounts({
      companyRegistry: companyRegistry.publicKey,
      user: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([companyRegistry])
    .rpc();
  console.log("Registry initialized");

  // Fetch the company registry account to verify initialization
  const registryAccount = await program.account.companyRegistry.fetch(
    companyRegistry.publicKey
  );
  console.log("Registry Account");
  console.log(companyRegistry.publicKey.toBase58());
  console.log(registryAccount.companies);
  return {
    provider,
    program,
    companyRegistry,
    user: provider.wallet,
  };
};

const createCompany = async ({
  companyRegistry,
  user,
  provider,
  program,
}: {
  companyRegistry: Keypair;
  user: anchor.Wallet;
  provider: anchor.AnchorProvider;
  program: Program<IncFactory>;
}) => {
  const [newCompanyPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("company"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );
  try {
    await program.methods
      .createCompany(
        "Test Company",
        "Test Jurisdiction",
        [], // shareholders
        [], // share_amounts
        [], // voters
        [] // vote_amounts
      )
      .accounts({
        companyRegistry: companyRegistry.publicKey,
        newCompany: newCompanyPda,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user.payer])
      .rpc();
    console.log("new company created with no errors");
  } catch (error) {
    console.log("error creating new company", error);
  }
  // Fetch the new company account to verify creation
  const companyAccount = await program.account.company.fetch(newCompanyPda);

  return { companyAccount, companyPDA: newCompanyPda };
};

const getCompanyList = async ({
  program,
  companyRegistry,
}: {
  program: Program<IncFactory>;
  companyRegistry: Keypair;
}) => {
  const companyList = await program.account.companyRegistry.fetch(
    companyRegistry.publicKey
  );
  return companyList.companies;
};

export default {
  createCompany,
  init,
  airdropSol,
};
