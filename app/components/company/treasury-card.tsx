import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Wallet } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useDepositFunds, useWithdrawFunds } from "~/hooks/use-treasury";

interface TreasuryCardProps {
  companyAddress: string;
  balance: number;
  isAuthority: boolean;
}

export function TreasuryCard({ companyAddress, balance, isAuthority }: TreasuryCardProps) {
  const { connected, publicKey } = useWallet();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawRecipient, setWithdrawRecipient] = useState("");

  const depositMutation = useDepositFunds(companyAddress);
  const withdrawMutation = useWithdrawFunds(companyAddress);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await depositMutation.mutateAsync(amount);
      setDepositAmount("");
    } catch (err) {
      console.error("Deposit failed:", err);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    const recipient = withdrawRecipient || publicKey?.toBase58();
    if (!recipient) return;

    try {
      await withdrawMutation.mutateAsync({ amountSol: amount, recipient });
      setWithdrawAmount("");
      setWithdrawRecipient("");
    } catch (err) {
      console.error("Withdraw failed:", err);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Treasury Balance
          </CardTitle>
          <CardDescription>Current funds in the company treasury</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{balance.toFixed(4)} SOL</div>
          <p className="text-muted-foreground text-sm mt-2">
            {(balance * 100).toFixed(2)} USD (at $100/SOL)
          </p>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Treasury Actions</CardTitle>
          <CardDescription>Deposit or withdraw funds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!connected ? (
            <p className="text-muted-foreground text-center py-4">
              Connect your wallet to manage treasury
            </p>
          ) : (
            <>
              {/* Deposit Form */}
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit SOL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="depositAmount"
                      type="number"
                      step="0.0001"
                      placeholder="Amount in SOL"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={depositMutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={depositMutation.isPending || !depositAmount}
                    >
                      {depositMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowDownToLine className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {depositMutation.error && (
                  <p className="text-destructive text-sm">
                    {depositMutation.error instanceof Error
                      ? depositMutation.error.message
                      : "Deposit failed"}
                  </p>
                )}
                {depositMutation.isSuccess && (
                  <p className="text-green-600 text-sm">Deposit successful!</p>
                )}
              </form>

              {/* Withdraw Form - Authority only */}
              {isAuthority && (
                <form onSubmit={handleWithdraw} className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawAmount">Withdraw SOL</Label>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      step="0.0001"
                      placeholder="Amount in SOL"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={withdrawMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdrawRecipient">Recipient (optional)</Label>
                    <Input
                      id="withdrawRecipient"
                      placeholder="Leave empty to withdraw to your wallet"
                      value={withdrawRecipient}
                      onChange={(e) => setWithdrawRecipient(e.target.value)}
                      disabled={withdrawMutation.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={withdrawMutation.isPending || !withdrawAmount}
                  >
                    {withdrawMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Withdraw
                      </>
                    )}
                  </Button>
                  {withdrawMutation.error && (
                    <p className="text-destructive text-sm">
                      {withdrawMutation.error instanceof Error
                        ? withdrawMutation.error.message
                        : "Withdrawal failed"}
                    </p>
                  )}
                  {withdrawMutation.isSuccess && (
                    <p className="text-green-600 text-sm">Withdrawal successful!</p>
                  )}
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
