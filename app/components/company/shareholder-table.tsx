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
import type { Shareholder } from "~/hooks/use-company";

interface ShareholderTableProps {
  companyAddress: string;
  shareholders: Shareholder[];
  isAuthority: boolean;
}

export function ShareholderTable({
  companyAddress,
  shareholders,
  isAuthority,
}: ShareholderTableProps) {
  const { publicKey } = useWallet();
  const program = useCompanyManagementProgram();
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newShares, setNewShares] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalShares = shareholders.reduce(
    (sum, sh) => sum.add(sh.shares),
    new BN(0)
  );

  const handleAddShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey) return;

    setError(null);
    setLoading(true);

    try {
      const shareholderPubkey = new PublicKey(newAddress);
      const shares = new BN(newShares);

      await program.methods
        .addShareholder(shareholderPubkey, shares)
        .accounts({
          company: new PublicKey(companyAddress),
          authority: publicKey,
        })
        .rpc();

      setNewAddress("");
      setNewShares("");
      setIsAdding(false);
      // Refresh will happen via react-query
    } catch (err) {
      console.error("Failed to add shareholder:", err);
      setError(err instanceof Error ? err.message : "Failed to add shareholder");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShareholder = async (address: PublicKey) => {
    if (!program || !publicKey) return;

    setLoading(true);
    try {
      await program.methods
        .removeShareholder(address)
        .accounts({
          company: new PublicKey(companyAddress),
          authority: publicKey,
        })
        .rpc();
    } catch (err) {
      console.error("Failed to remove shareholder:", err);
      setError(err instanceof Error ? err.message : "Failed to remove shareholder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Shareholders</CardTitle>
            <CardDescription>
              {shareholders.length} shareholders • {totalShares.toString()} total shares
            </CardDescription>
          </div>
          {isAuthority && !isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Shareholder
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleAddShareholder} className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shareholderAddress">Wallet Address</Label>
                <Input
                  id="shareholderAddress"
                  placeholder="Enter wallet address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shares">Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  placeholder="Enter share amount"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
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

        {shareholders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No shareholders registered yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                {isAuthority && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {shareholders.map((sh) => {
                const percentage = totalShares.gt(new BN(0))
                  ? (sh.shares.toNumber() / totalShares.toNumber() * 100).toFixed(2)
                  : "0.00";

                return (
                  <TableRow key={sh.address.toBase58()}>
                    <TableCell className="font-mono">
                      {shortenAddress(sh.address.toBase58(), 8)}
                    </TableCell>
                    <TableCell className="text-right">{sh.shares.toString()}</TableCell>
                    <TableCell className="text-right">{percentage}%</TableCell>
                    {isAuthority && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveShareholder(sh.address)}
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
