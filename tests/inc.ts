import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Inc } from "../target/types/inc";

describe("inc", () => {
  // Configure the client to use the local cluster.
  console.log("Tesitng inc");

  anchor.setProvider(anchor.AnchorProvider.env());
  // console.log("provider", anchor.AnchorProvider.env());
  const program = anchor.workspace.Inc as Program<Inc>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
