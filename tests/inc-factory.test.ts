import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IncFactory } from "../target/types/inc_factory";
import { expect } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("inc-factory", async () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.IncFactory as Program<IncFactory>;

  const registryKey = "HjUHUnGvhBPMgxgrPmzfNyWySKQGPpAYqfFx5LEoAvmc";

  // Generate a new Keypair for the company registry
  const companyRegistry = new PublicKey(registryKey);

  // Generate a new Keypair to act as a non-owner
  const nonOwner = Keypair.generate();

  const user = new PublicKey("GgCoc1ZebjKJ1Dgojg5kEASR9voUvcP7tmD1KTaQPw8B");
  // Derive PDA for a new company
  const [newCompanyPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("company"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );
  // Utility function to airdrop SOL to a Keypair
  const airdropSol = async (wallet: Keypair) => {
    const signature = await provider.connection.requestAirdrop(
      wallet.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  };

  before(async () => {
    // Airdrop SOL to the non-owner for transaction fees
    await airdropSol(nonOwner);
  });

  it("Initializes the company registry", async () => {
    return;
    await program.methods
      .initializeRegistry()
      .accounts({
        companyRegistry: companyRegistry.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([companyRegistry])
      .rpc();

    // Fetch the company registry account to verify initialization
    const registryAccount = await program.account.companyRegistry.fetch(
      companyRegistry.publicKey
    );
    console.log("Registry Account");
    console.log(companyRegistry.publicKey.toBase58());
    console.log(registryAccount.companies);
    expect(registryAccount.companies.length).to.equal(0);
  });

  it("Allows the owner to create a new company", async () => {
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
        companyRegistry: registryKey,
        newCompany: newCompanyPda,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([provider.wallet])
      .rpc();

    // Fetch the new company account to verify creation
    const companyAccount = await program.account.company.fetch(newCompanyPda);
    expect(companyAccount.name).to.equal("Test Company");
    expect(companyAccount.jurisdiction).to.equal("Test Jurisdiction");
    expect(companyAccount.shareholders.length).to.equal(0);
    expect(companyAccount.shareAmounts.length).to.equal(0);
    expect(companyAccount.voters.length).to.equal(0);
    expect(companyAccount.voteAmounts.length).to.equal(0);
  });

  it("Prevents non-owners from creating a new company", async () => {
    return;
    // Derive PDA for another new company
    const [anotherCompanyPda, bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("company"), nonOwner.publicKey.toBuffer()],
        program.programId
      );

    try {
      await program.methods
        .createCompany(
          "Unauthorized Company",
          "Invalid Jurisdiction",
          [], // shareholders
          [], // share_amounts
          [], // voters
          [] // vote_amounts
        )
        .accounts({
          companyRegistry: companyRegistry.publicKey,
          newCompany: anotherCompanyPda,
          user: nonOwner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([nonOwner])
        .rpc();

      // If the above succeeds, the test should fail
      expect.fail("Non-owner was able to create a company");
    } catch (err: any) {
      // Check that the error is due to unauthorized access
      expect(err.error.errorCode.code).to.equal("Unauthorized");
    }
  });

  it("Retrieves the list of companies from the registry", async () => {
    return;
    const companyList = await program.methods
      .getCompanyList()
      .accounts({
        companyRegistry: companyRegistry.publicKey,
      })
      .rpc();

    // The list should contain one company
    expect(companyList.length).to.equal(1);
    expect(companyList[0]).to.equal(newCompanyPda.toBase58());
  });

  it("Retrieves a company by its name", async () => {
    return;
    const companyPubkey = await program.methods
      .getCompanyByName("Test Company")
      .accounts({
        companyRegistry: companyRegistry.publicKey,
        companyAccount: newCompanyPda,
      })
      .rpc();

    expect(companyPubkey).to.equal(newCompanyPda.toBase58());
  });

  it("Prevents adding a company with a duplicate name", async () => {
    return;
    try {
      await program.methods
        .createCompany(
          "Test Company", // Duplicate name
          "Another Jurisdiction",
          [], // shareholders
          [], // share_amounts
          [], // voters
          [] // vote_amounts
        )
        .accounts({
          companyRegistry: companyRegistry.publicKey,
          newCompany: Keypair.generate().publicKey, // Using a new PDA
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([provider.wallet.payer])
        .rpc();

      expect.fail("Was able to create a company with a duplicate name");
    } catch (err: any) {
      expect(err.error.errorCode.code).to.equal("NameAlreadyTaken");
    }
  });

  it("Prevents creating a company with an invalid name", async () => {
    return;
    const [invalidCompanyPda, bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("company"), provider.wallet.publicKey.toBuffer()],
        program.programId
      );

    try {
      await program.methods
        .createCompany(
          "", // Invalid name (empty)
          "Jurisdiction",
          [], // shareholders
          [], // share_amounts
          [], // voters
          [] // vote_amounts
        )
        .accounts({
          companyRegistry: companyRegistry.publicKey,
          newCompany: invalidCompanyPda,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([provider.wallet.payer])
        .rpc();

      expect.fail("Was able to create a company with an invalid name");
    } catch (err: any) {
      expect(err.error.errorCode.code).to.equal("InvalidName");
    }
  });
});
