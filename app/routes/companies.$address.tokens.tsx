import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BN from "bn.js";
import { ArrowLeft, Loader2, Coins, CircleDollarSign } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useCompany } from "~/hooks/use-company";
import { useIncTokenProgram } from "~/hooks/use-anchor-program";
import { getTokenConfigPda, getShareMintPda, getVotingMintPda } from "~/lib/anchor/pda";

export const meta: MetaFunction = () => {
  return [
    { title: "Tokens - INC" },
    { name: "description", content: "Company token management" },
  ];
};

// Token program constant
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export default function CompanyTokens() {
  const params = useParams();
  const { publicKey, connected } = useWallet();
  const address = params.address ?? null;

  const { data: company, isLoading } = useCompany(address);
  const tokenProgram = useIncTokenProgram();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintType, setMintType] = useState<"shares" | "voting">("shares");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAuthority = publicKey && company?.authority.equals(publicKey);

  const handleInitializeTokens = async () => {
    if (!tokenProgram || !publicKey || !address) return;

    setError(null);
    setSuccess(null);
    setIsInitializing(true);

    try {
      const companyPubkey = new PublicKey(address);
      const [tokenConfigPda] = getTokenConfigPda(companyPubkey);
      const [shareMintPda] = getShareMintPda(companyPubkey);
      const [votingMintPda] = getVotingMintPda(companyPubkey);

      await tokenProgram.methods
        .initializeTokenConfig(9, 9) // 9 decimals for both tokens
        .accounts({
          company: companyPubkey,
          tokenConfig: tokenConfigPda,
          shareTokenMint: shareMintPda,
          votingTokenMint: votingMintPda,
          authority: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setSuccess("Token configuration initialized successfully!");
    } catch (err) {
      console.error("Failed to initialize tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize tokens");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenProgram || !publicKey || !address) return;

    setError(null);
    setSuccess(null);
    setIsMinting(true);

    try {
      const companyPubkey = new PublicKey(address);
      const [tokenConfigPda] = getTokenConfigPda(companyPubkey);
      const [shareMintPda] = getShareMintPda(companyPubkey);
      const [votingMintPda] = getVotingMintPda(companyPubkey);
      const recipientPubkey = new PublicKey(recipient);
      const amountBn = new BN(parseFloat(amount) * 1e9); // Assuming 9 decimals

      if (mintType === "shares") {
        // Note: This would need the recipient's token account
        // For simplicity, we're showing the concept
        await tokenProgram.methods
          .mintShares(amountBn)
          .accounts({
            tokenConfig: tokenConfigPda,
            shareTokenMint: shareMintPda,
            recipientTokenAccount: recipientPubkey, // This should be an ATA
            authority: publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      } else {
        await tokenProgram.methods
          .mintVotingTokens(amountBn)
          .accounts({
            tokenConfig: tokenConfigPda,
            votingTokenMint: votingMintPda,
            recipientTokenAccount: recipientPubkey, // This should be an ATA
            authority: publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      }

      setSuccess(`${mintType === "shares" ? "Share" : "Voting"} tokens minted successfully!`);
      setRecipient("");
      setAmount("");
    } catch (err) {
      console.error("Failed to mint tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to mint tokens");
    } finally {
      setIsMinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Company not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Link
        to={`/companies/${address}`}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Company
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Token Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage share and voting tokens for {company.companyName}
        </p>
      </div>

      {!connected ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Connect your wallet to manage tokens
            </p>
          </CardContent>
        </Card>
      ) : !isAuthority ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Not Authorized</p>
            <p className="text-muted-foreground mt-2">
              Only the company authority can manage tokens
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Initialize Tokens Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Initialize Tokens
              </CardTitle>
              <CardDescription>
                Set up SPL token mints for share and voting tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will create two SPL token mints:
              </p>
              <ul className="text-sm space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-primary" />
                  Share Token - Represents ownership shares
                </li>
                <li className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-primary" />
                  Voting Token - Represents voting power
                </li>
              </ul>

              {error && <p className="text-destructive text-sm mb-4">{error}</p>}
              {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

              <Button
                onClick={handleInitializeTokens}
                disabled={isInitializing}
                className="w-full"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Token Config"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Mint Tokens Card */}
          <Card>
            <CardHeader>
              <CardTitle>Mint Tokens</CardTitle>
              <CardDescription>
                Mint share or voting tokens to recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMintTokens} className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={mintType === "shares" ? "default" : "outline"}
                      onClick={() => setMintType("shares")}
                      className="flex-1"
                    >
                      Shares
                    </Button>
                    <Button
                      type="button"
                      variant={mintType === "voting" ? "default" : "outline"}
                      onClick={() => setMintType("voting")}
                      className="flex-1"
                    >
                      Voting
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Token Account</Label>
                  <Input
                    id="recipient"
                    placeholder="Enter token account address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={isMinting}
                  />
                  <p className="text-xs text-muted-foreground">
                    The recipient's Associated Token Account for this mint
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000000001"
                    placeholder="Amount to mint"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isMinting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isMinting || !recipient || !amount}
                  className="w-full"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    `Mint ${mintType === "shares" ? "Shares" : "Voting Tokens"}`
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
