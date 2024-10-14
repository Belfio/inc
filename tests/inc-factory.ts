import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { IncFactory } from "../target/types/inc_factory";
import { expect } from "chai";

describe("inc-factory", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.IncFactory as Program<IncFactory>;

  it("Can create a new company", async () => {
    const companyRegistry = anchor.web3.Keypair.generate();
    const newCompany = anchor.web3.Keypair.generate();

    await program.methods
      .createCompany("Test Company", "Test Jurisdiction", [], [], [], [])
      .accounts({
        companyRegistry: companyRegistry.publicKey,
        newCompany: newCompany.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([companyRegistry, newCompany])
      .rpc();

    const companyAccount = await program.account.company.fetch(
      newCompany.publicKey
    );
    expect(companyAccount.name).to.equal("Test Company");
    expect(companyAccount.jurisdiction).to.equal("Test Jurisdiction");
  });

  it("Can get company list", async () => {
    const companyRegistry = anchor.web3.Keypair.generate();

    const companies = await program.methods
      .getCompanyList()
      .accounts({
        companyRegistry: companyRegistry.publicKey,
      })
      .view();

    expect(companies).to.be.an("array");
  });

  // Add more tests for other functions...
});
