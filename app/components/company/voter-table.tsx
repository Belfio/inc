import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { shortenAddress } from "~/lib/anchor/pda";
import { useCompanyManagementProgram } from "~/hooks/use-anchor-program";
import type { Voter } from "~/hooks/use-company";

interface VoterTableProps {
  companyAddress: string;
  voters: Voter[];
  isAuthority: boolean;
}

export function VoterTable({ companyAddress, voters, isAuthority }: VoterTableProps) {
  const { publicKey } = useWallet();
  const program = useCompanyManagementProgram();
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newVotingPower, setNewVotingPower] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalVotingPower = voters.reduce(
    (sum, v) => sum.add(v.votingPower),
    new BN(0)
  );

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey) return;

    setError(null);
    setLoading(true);

    try {
      const voterPubkey = new PublicKey(newAddress);
      const votingPower = new BN(newVotingPower);

      await program.methods
        .addVoter(voterPubkey, votingPower)
        .accounts({
          company: new PublicKey(companyAddress),
          authority: publicKey,
        })
        .rpc();

      setNewAddress("");
      setNewVotingPower("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add voter:", err);
      setError(err instanceof Error ? err.message : "Failed to add voter");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoter = async (address: PublicKey) => {
    if (!program || !publicKey) return;

    setLoading(true);
    try {
      await program.methods
        .removeVoter(address)
        .accounts({
          company: new PublicKey(companyAddress),
          authority: publicKey,
        })
        .rpc();
    } catch (err) {
      console.error("Failed to remove voter:", err);
      setError(err instanceof Error ? err.message : "Failed to remove voter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Voters</CardTitle>
            <CardDescription>
              {voters.length} voters • {totalVotingPower.toString()} total voting power
            </CardDescription>
          </div>
          {isAuthority && !isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Voter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleAddVoter} className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="voterAddress">Wallet Address</Label>
                <Input
                  id="voterAddress"
                  placeholder="Enter wallet address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="votingPower">Voting Power</Label>
                <Input
                  id="votingPower"
                  type="number"
                  placeholder="Enter voting power"
                  value={newVotingPower}
                  onChange={(e) => setNewVotingPower(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {voters.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No voters registered yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Voting Power</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                {isAuthority && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {voters.map((v) => {
                const percentage = totalVotingPower.gt(new BN(0))
                  ? (v.votingPower.toNumber() / totalVotingPower.toNumber() * 100).toFixed(2)
                  : "0.00";

                return (
                  <TableRow key={v.address.toBase58()}>
                    <TableCell className="font-mono">
                      {shortenAddress(v.address.toBase58(), 8)}
                    </TableCell>
                    <TableCell className="text-right">{v.votingPower.toString()}</TableCell>
                    <TableCell className="text-right">{percentage}%</TableCell>
                    {isAuthority && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVoter(v.address)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
