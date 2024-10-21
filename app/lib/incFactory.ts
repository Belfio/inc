import * as anchor from "@coral-xyz/anchor";

import {
  Keypair,
  Connection,
  clusterApiUrl,
  PublicKey,
  // Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { Program, Wallet } from "@coral-xyz/anchor";
import { IncFactory } from "../../target/types/inc_factory"; // Adjust the path as needed
import idl from "../../target/idl/inc_factory.json"; // Adjust the path as needed

// import { Keypair, PublicKey } from "@solana/web3.js";
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const PROGRAM_ID = new PublicKey(
  "7kmLroKer2JooHLqQi8ugBRHhVVTudxUm1JsAa9gpyhK"
);
const COMPANY_REGISTRY_ID = new PublicKey(
  "HmtYcFcnXBHCSHVxEyMGsZq4YNAFahzHQJfGwSkE43C9"
);
const airdropSol = async (wallet: anchor.Wallet) => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("connection for airdrop", connection);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  const signature = await provider.connection.requestAirdrop(
    wallet.publicKey,
    anchor.web3.LAMPORTS_PER_SOL
  );
  await provider.connection.confirmTransaction(signature);
};

// Define a function to initialize the provider manually
const init = async (wallet: anchor.Wallet) => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("connection for init", connection);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  anchor.setProvider(provider);
  const program = new Program(idl, provider);

  // *********************************************************************************
  // *********************************************************************************
  // *********************************************************************************
  // check if an my wallet address has already created an account of type companyRegistry exists
  const [companyRegistryPda, bump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("companyRegistry"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
  // if exists, return the account
  const companyRegistryAccount = await provider.connection.getAccountInfo(
    companyRegistryPda
  );
  if (companyRegistryAccount) {
    console.log("Company registry account already exists");
    return { companyRegistry: companyRegistryAccount };
  }
  // *********************************************************************************
  // *********************************************************************************
  // *********************************************************************************

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
    user: wallet,
  };
};

const createCompany = async ({ wallet }: { wallet: anchor.Wallet }) => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  const program = new Program(idl, provider);
  const user = wallet;
  console.log(`createCompany
    companyRegistryPublicKey: ${COMPANY_REGISTRY_ID}
    user: ${user.publicKey}
    provider: ${provider.wallet.publicKey}
    program: ${program.programId}
    companyRegistry: ${COMPANY_REGISTRY_ID}
    `);

  const [newCompanyPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("company"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );
  try {
    console.log(`
      companyRegistry: ${COMPANY_REGISTRY_ID}
      newCompany: ${newCompanyPda}
      user: ${user.publicKey}
      systemProgram: ${anchor.web3.SystemProgram.programId}
      signers: ${user.publicKey}
      `);
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
        companyRegistry: COMPANY_REGISTRY_ID,
        newCompany: newCompanyPda,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();
    console.log("new company created with no errors");
  } catch (error) {
    console.log("error creating new company", error);
  }
  // Fetch the new company account to verify creation
  const companyAccount = await program.account.company.fetch(newCompanyPda);
  console.log("companyAccount", companyAccount);
  return { companyAccount, companyPDA: newCompanyPda };
};

const getCompanyList = async ({ wallet }: { wallet: anchor.Wallet }) => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("connection for getCompanyList", connection);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  const program = new Program(idl, provider);
  const companyList = await program.account.companyRegistry.fetch(
    COMPANY_REGISTRY_ID
  );
  return companyList.companies;
};

const getCompanyDetails = async ({
  wallet,
  companyPda,
}: {
  wallet: anchor.Wallet;
  companyPda: PublicKey;
}) => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("connection for getCompanyDetails", connection);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  const program = new Program(idl, provider);
  const companyDetails = await program.account.company.fetch(companyPda);
  return companyDetails;
};

export default {
  createCompany,
  init,
  airdropSol,
  getCompanyList,
  getCompanyDetails,
};
