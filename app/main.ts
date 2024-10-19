import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Inc } from "../target/types/inc";
// import { PublicKey } from "@solana/web3.js";
// import idl from "../target/idl/inc.json";

const main = async () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  // console.log("provider", provider);
  const program = anchor.workspace.Inc as Program<Inc>;

  // Interact with the program
  const myAccount = anchor.web3.Keypair.generate();
  const tx = await program.methods.initialize().rpc();
  console.log("tx", tx);
  // await program.rpc.initialize({
  //   accounts: {
  //     myAccount: myAccount.publicKey,
  //     user: provider.wallet.publicKey,
  //     systemProgram: anchor.web3.SystemProgram.programId,
  //   },
  //   signers: [myAccount],
  // });

  console.log("Account initialized:", myAccount.publicKey.toString());
};

main()
  .then(() => console.log("Done!"))
  .catch((err) => console.error(err));
