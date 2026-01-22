import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { ArrowLeft, Plus, Loader2, Vote, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useCompany } from "~/hooks/use-company";
import { useCreateProposal, useCastVote, ProposalStatus, type ProposalType } from "~/hooks/use-proposals";

export const meta: MetaFunction = () => {
  return [
    { title: "Governance - INC" },
    { name: "description", content: "Company governance and proposals" },
  ];
};

type ProposalTypeKey =
  | "treasuryWithdrawal"
  | "addShareholder"
  | "removeShareholder"
  | "addVoter"
  | "removeVoter"
  | "updateCompanyName"
  | "updateJurisdiction"
  | "transferAuthority"
  | "generic";

const proposalTypeLabels: Record<ProposalTypeKey, string> = {
  treasuryWithdrawal: "Treasury Withdrawal",
  addShareholder: "Add Shareholder",
  removeShareholder: "Remove Shareholder",
  addVoter: "Add Voter",
  removeVoter: "Remove Voter",
  updateCompanyName: "Update Company Name",
  updateJurisdiction: "Update Jurisdiction",
  transferAuthority: "Transfer Authority",
  generic: "Generic Proposal",
};

export default function CompanyGovernance() {
  const params = useParams();
  const { publicKey, connected } = useWallet();
  const address = params.address ?? null;

  const { data: company, isLoading } = useCompany(address);
  const createProposalMutation = useCreateProposal(address);

  const [isCreating, setIsCreating] = useState(false);
  const [proposalType, setProposalType] = useState<ProposalTypeKey>("generic");
  const [description, setDescription] = useState("");
  const [proposalId, setProposalId] = useState("1");

  // Type-specific fields
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [newName, setNewName] = useState("");
  const [newJurisdiction, setNewJurisdiction] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [shares, setShares] = useState("");
  const [votingPower, setVotingPower] = useState("");

  const isVoter = company?.voters.some(
    (v) => publicKey && v.address.equals(publicKey)
  );

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    let proposalTypeData: ProposalType;

    switch (proposalType) {
      case "treasuryWithdrawal":
        proposalTypeData = {
          treasuryWithdrawal: {
            recipient: new PublicKey(recipientAddress),
            amount: new BN(parseFloat(amount) * 1e9), // Convert SOL to lamports
          },
        };
        break;
      case "addShareholder":
        proposalTypeData = {
          addShareholder: {
            shareholder: new PublicKey(targetAddress),
            shares: new BN(shares),
          },
        };
        break;
      case "removeShareholder":
        proposalTypeData = {
          removeShareholder: {
            shareholder: new PublicKey(targetAddress),
          },
        };
        break;
      case "addVoter":
        proposalTypeData = {
          addVoter: {
            voter: new PublicKey(targetAddress),
            votingPower: new BN(votingPower),
          },
        };
        break;
      case "removeVoter":
        proposalTypeData = {
          removeVoter: {
            voter: new PublicKey(targetAddress),
          },
        };
        break;
      case "updateCompanyName":
        proposalTypeData = {
          updateCompanyName: { newName },
        };
        break;
      case "updateJurisdiction":
        proposalTypeData = {
          updateJurisdiction: { newJurisdiction },
        };
        break;
      case "transferAuthority":
        proposalTypeData = {
          transferAuthority: {
            newAuthority: new PublicKey(targetAddress),
          },
        };
        break;
      default:
        proposalTypeData = { generic: {} };
    }

    try {
      await createProposalMutation.mutateAsync({
        proposalId: parseInt(proposalId),
        proposalType: proposalTypeData,
        description,
      });
      setIsCreating(false);
      // Reset form
      setDescription("");
      setProposalId((parseInt(proposalId) + 1).toString());
    } catch (err) {
      console.error("Failed to create proposal:", err);
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

  return (
    <div className="container py-8">
      <Link
        to={`/companies/${address}`}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Company
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-muted-foreground mt-1">
            Create and vote on proposals for {company?.companyName}
          </p>
        </div>
        {connected && isVoter && !isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        )}
      </div>

      {!connected ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Connect your wallet to participate in governance
            </p>
          </CardContent>
        </Card>
      ) : !isVoter ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Not a Voter</p>
            <p className="text-muted-foreground mt-2">
              You need to be registered as a voter to create or vote on proposals
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {isCreating && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Proposal</CardTitle>
                <CardDescription>
                  Submit a new proposal for the company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProposal} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="proposalId">Proposal ID</Label>
                      <Input
                        id="proposalId"
                        type="number"
                        value={proposalId}
                        onChange={(e) => setProposalId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposalType">Proposal Type</Label>
                      <select
                        id="proposalType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={proposalType}
                        onChange={(e) => setProposalType(e.target.value as ProposalTypeKey)}
                      >
                        {Object.entries(proposalTypeLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Describe the proposal"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Type-specific fields */}
                  {proposalType === "treasuryWithdrawal" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Recipient Address</Label>
                        <Input
                          placeholder="Recipient wallet address"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (SOL)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="Amount in SOL"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {(proposalType === "addShareholder" ||
                    proposalType === "removeShareholder" ||
                    proposalType === "addVoter" ||
                    proposalType === "removeVoter" ||
                    proposalType === "transferAuthority") && (
                    <div className="space-y-2">
                      <Label>Target Address</Label>
                      <Input
                        placeholder="Wallet address"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                      />
                    </div>
                  )}

                  {proposalType === "addShareholder" && (
                    <div className="space-y-2">
                      <Label>Shares</Label>
                      <Input
                        type="number"
                        placeholder="Number of shares"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                      />
                    </div>
                  )}

                  {proposalType === "addVoter" && (
                    <div className="space-y-2">
                      <Label>Voting Power</Label>
                      <Input
                        type="number"
                        placeholder="Voting power"
                        value={votingPower}
                        onChange={(e) => setVotingPower(e.target.value)}
                      />
                    </div>
                  )}

                  {proposalType === "updateCompanyName" && (
                    <div className="space-y-2">
                      <Label>New Company Name</Label>
                      <Input
                        placeholder="Enter new name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                  )}

                  {proposalType === "updateJurisdiction" && (
                    <div className="space-y-2">
                      <Label>New Jurisdiction</Label>
                      <Input
                        placeholder="Enter new jurisdiction"
                        value={newJurisdiction}
                        onChange={(e) => setNewJurisdiction(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                  )}

                  {createProposalMutation.error && (
                    <p className="text-destructive text-sm">
                      {createProposalMutation.error instanceof Error
                        ? createProposalMutation.error.message
                        : "Failed to create proposal"}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createProposalMutation.isPending}>
                      {createProposalMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Proposal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Proposals List */}
          <Card>
            <CardHeader>
              <CardTitle>Proposals</CardTitle>
              <CardDescription>
                Active and past proposals for this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No proposals found. Create one to get started!
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Proposal scanning is not yet implemented. Check the blockchain directly.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
