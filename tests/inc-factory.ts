import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IncFactory } from "../target/types/inc_factory";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { createHash } from "crypto";
import BN from "bn.js";

function hashCompanyName(name: string): Buffer {
  return createHash("sha256").update(name).digest().slice(0, 32);
}

// Usage in your test

describe("inc-factory", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.IncFactory as Program<IncFactory>;
  const provider = anchor.getProvider();

  // We'll need these for our tests
  let registryPda: PublicKey;
  let registryBump: number;
  let companyPda: PublicKey;
  let companyBump: number;
  const testCompanyName = "Test Corp";

  before(async () => {
    // Find the registry PDA
    [registryPda, registryBump] = await PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("company_registry")], // Encode the seed for the PDA.
      program.programId
    );
  });

  describe("initialize_registry", () => {
    it("successfully initializes the registry", async () => {
      try {
        const tx = await program.methods
          .initializeRegistry()
          .accounts({
            companyRegistry: registryPda,
            user: provider.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        const registryAccount = await program.account.companyRegistry.fetch(
          registryPda
        );
        expect(registryAccount.companies).to.be.empty;
      } catch (error) {
        throw error;
      }
    });

    it("fails to initialize registry twice", async () => {
      try {
        await program.methods
          .initializeRegistry()
          .accounts({
            companyRegistry: registryPda,
            user: provider.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have failed");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.toString()).to.include("custom program error: 0x0");
      }
    });
  });

  describe("create_company", () => {
    const testCompanyName2 = "";
    let companyPda2: PublicKey;
    let companyBump2: number;
    const testJurisdiction = "Delaware";
    const shareholders = [provider.publicKey];
    const voters = [provider.publicKey];
    const shareAmounts = [new BN(1000)];
    const voteAmounts = [new BN(1000)];

    before(async () => {
      // Find the company PDA
      const nameHash = hashCompanyName(testCompanyName);

      [companyPda, companyBump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("company"), nameHash],
        program.programId
      );

      const nameHash2 = hashCompanyName(testCompanyName2);
      [companyPda2, companyBump2] = await PublicKey.findProgramAddressSync(
        [Buffer.from("company"), nameHash2],
        program.programId
      );
    });

    it("successfully creates a company", async () => {
      try {
        const tx = await program.methods
          .createCompany(
            testCompanyName,
            testJurisdiction,
            shareholders,
            shareAmounts,
            voters,
            voteAmounts
          )
          .accounts({
            companyRegistry: registryPda,
            newCompany: companyPda,
            user: provider.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        const companyAccount = await program.account.company.fetch(companyPda);
        expect(companyAccount.companyName).to.equal(testCompanyName);
        expect(companyAccount.jurisdiction).to.equal(testJurisdiction);
      } catch (error) {
        throw error;
      }
    });

    it("fails to create company with empty name", async () => {
      try {
        await program.methods
          .createCompany(
            testCompanyName2,
            testJurisdiction,
            shareholders,
            shareAmounts,
            voters,
            voteAmounts
          )
          .accounts({
            companyRegistry: registryPda,
            newCompany: companyPda2,
            user: provider.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have failed");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.toString()).to.include("Empty");
      }
    });
  });

  describe("get_company_list", () => {
    it("successfully gets company list", async () => {
      try {
        const companies = await program.methods
          .getCompanyList()
          .accounts({
            companyRegistry: registryPda,
          })
          .view();

        expect(companies).to.be.an("array");
        expect(companies).to.have.lengthOf(1); // We created one company earlier
      } catch (error) {
        throw error;
      }
    });
  });

  describe("get_company_by_name", () => {
    it("successfully gets company by name", async () => {
      try {
        const company = await program.methods
          .getCompanyByName(testCompanyName)
          .accounts({
            companyRegistry: registryPda,
            companyAccount: companyPda,
          })
          .view();

        expect(company).to.deep.equal(companyPda);
      } catch (error) {
        throw error;
      }
    });

    it("fails to get non-existent company", async () => {
      try {
        // Generate a random public key for a non-existent company
        const nonExistentCompany = anchor.web3.Keypair.generate().publicKey;

        await program.methods
          .getCompanyByName("non existent company")
          .accounts({
            companyRegistry: registryPda,
          })
          .view();
        expect.fail("Should have failed");
      } catch (error) {
        // error.toString() was not working to check for the error message?
        expect(error.simulationResponse.logs.toString()).to.include(
          "CompanyNotFound"
        );
      }
    });
  });
});
