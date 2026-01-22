import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BN from "bn.js";
import { Coins, Loader2, Flame, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useInccoinProgram } from "~/hooks/use-anchor-program";
import { getInccoinConfigPda, getInccoinMintPda, getAuthorizedMinterPda } from "~/lib/anchor/pda";

export const meta: MetaFunction = () => {
  return [
    { title: "Inccoin - INC" },
    { name: "description", content: "Inccoin stablecoin operations" },
  ];
};

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export default function InccoinPage() {
  const { publicKey, connected } = useWallet();
  const inccoinProgram = useInccoinProgram();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isAddingMinter, setIsAddingMinter] = useState(false);

  const [mintAmount, setMintAmount] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [burnTokenAccount, setBurnTokenAccount] = useState("");
  const [newMinterAddress, setNewMinterAddress] = useState("");
  const [newMinterLimit, setNewMinterLimit] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInitialize = async () => {
    if (!inccoinProgram || !publicKey) return;

    setError(null);
    setSuccess(null);
    setIsInitializing(true);

    try {
      const [configPda] = getInccoinConfigPda();
      const [mintPda] = getInccoinMintPda();

      await inccoinProgram.methods
        .initializeInccoin()
        .accounts({
          inccoinConfig: configPda,
          inccoinMint: mintPda,
          authority: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setSuccess("Inccoin initialized successfully!");
    } catch (err) {
      console.error("Failed to initialize Inccoin:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddMinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inccoinProgram || !publicKey) return;

    setError(null);
    setSuccess(null);
    setIsAddingMinter(true);

    try {
      const [configPda] = getInccoinConfigPda();
      const minterPubkey = new PublicKey(newMinterAddress);
      const [authorizedMinterPda] = getAuthorizedMinterPda(minterPubkey);
      const limitBn = new BN(parseFloat(newMinterLimit) * 1e6); // 6 decimals for stablecoin

      await inccoinProgram.methods
        .addAuthorizedMinter(limitBn)
        .accounts({
          inccoinConfig: configPda,
          authorizedMinter: authorizedMinterPda,
          minter: minterPubkey,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess("Minter added successfully!");
      setNewMinterAddress("");
      setNewMinterLimit("");
    } catch (err) {
      console.error("Failed to add minter:", err);
      setError(err instanceof Error ? err.message : "Failed to add minter");
    } finally {
      setIsAddingMinter(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inccoinProgram || !publicKey) return;

    setError(null);
    setSuccess(null);
    setIsMinting(true);

    try {
      const [configPda] = getInccoinConfigPda();
      const [mintPda] = getInccoinMintPda();
      const [authorizedMinterPda] = getAuthorizedMinterPda(publicKey);
      const recipientAccount = new PublicKey(mintRecipient);
      const amountBn = new BN(parseFloat(mintAmount) * 1e6);

      await inccoinProgram.methods
        .mintInccoin(amountBn)
        .accounts({
          inccoinConfig: configPda,
          inccoinMint: mintPda,
          authorizedMinter: authorizedMinterPda,
          recipientTokenAccount: recipientAccount,
          minter: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setSuccess("Inccoin minted successfully!");
      setMintAmount("");
      setMintRecipient("");
    } catch (err) {
      console.error("Failed to mint:", err);
      setError(err instanceof Error ? err.message : "Failed to mint");
    } finally {
      setIsMinting(false);
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inccoinProgram || !publicKey) return;

    setError(null);
    setSuccess(null);
    setIsBurning(true);

    try {
      const [configPda] = getInccoinConfigPda();
      const [mintPda] = getInccoinMintPda();
      const tokenAccount = new PublicKey(burnTokenAccount);
      const amountBn = new BN(parseFloat(burnAmount) * 1e6);

      await inccoinProgram.methods
        .burnInccoin(amountBn)
        .accounts({
          inccoinConfig: configPda,
          inccoinMint: mintPda,
          holderTokenAccount: tokenAccount,
          holder: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setSuccess("Inccoin burned successfully!");
      setBurnAmount("");
      setBurnTokenAccount("");
    } catch (err) {
      console.error("Failed to burn:", err);
      setError(err instanceof Error ? err.message : "Failed to burn");
    } finally {
      setIsBurning(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Inccoin</h1>
            <p className="text-muted-foreground">INC Stablecoin</p>
          </div>
        </div>
      </div>

      {!connected ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Connect your wallet to interact with Inccoin
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Initialize Card */}
          <Card>
            <CardHeader>
              <CardTitle>Initialize Inccoin</CardTitle>
              <CardDescription>
                Set up the Inccoin stablecoin (admin only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This creates the Inccoin SPL token mint and configuration.
                Only needs to be done once.
              </p>

              {error && <p className="text-destructive text-sm mb-4">{error}</p>}
              {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

              <Button
                onClick={handleInitialize}
                disabled={isInitializing}
                className="w-full"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Inccoin"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Add Minter Card */}
          <Card>
            <CardHeader>
              <CardTitle>Add Authorized Minter</CardTitle>
              <CardDescription>
                Authorize an address to mint Inccoin (admin only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMinter} className="space-y-4">
                <div className="space-y-2">
                  <Label>Minter Address</Label>
                  <Input
                    placeholder="Enter minter wallet address"
                    value={newMinterAddress}
                    onChange={(e) => setNewMinterAddress(e.target.value)}
                    disabled={isAddingMinter}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mint Limit</Label>
                  <Input
                    type="number"
                    placeholder="Maximum amount this minter can mint"
                    value={newMinterLimit}
                    onChange={(e) => setNewMinterLimit(e.target.value)}
                    disabled={isAddingMinter}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isAddingMinter || !newMinterAddress || !newMinterLimit}
                  className="w-full"
                >
                  {isAddingMinter ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Minter"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Mint Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Mint Inccoin
              </CardTitle>
              <CardDescription>
                Mint new Inccoin tokens (authorized minters only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMint} className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Token Account</Label>
                  <Input
                    placeholder="Enter recipient's token account"
                    value={mintRecipient}
                    onChange={(e) => setMintRecipient(e.target.value)}
                    disabled={isMinting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="Amount to mint"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    disabled={isMinting}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isMinting || !mintRecipient || !mintAmount}
                  className="w-full"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    "Mint Inccoin"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Burn Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Burn Inccoin
              </CardTitle>
              <CardDescription>
                Burn Inccoin tokens from your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBurn} className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Account</Label>
                  <Input
                    placeholder="Enter your token account address"
                    value={burnTokenAccount}
                    onChange={(e) => setBurnTokenAccount(e.target.value)}
                    disabled={isBurning}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="Amount to burn"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    disabled={isBurning}
                  />
                </div>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isBurning || !burnTokenAccount || !burnAmount}
                  className="w-full"
                >
                  {isBurning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Burning...
                    </>
                  ) : (
                    "Burn Inccoin"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
