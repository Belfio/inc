import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useCompanyManagementProgram, useCompanyRegistryProgram } from "~/hooks/use-anchor-program";
import { hashCompanyName, getCompanyPda, getCompanyRegistryPda, getTreasuryPda, INC_PROGRAM_ID, INC_FACTORY_PROGRAM_ID } from "~/lib/anchor/pda";
import { useTransactionStatus, getExplorerUrl } from "~/hooks/use-transaction";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Company - INC" },
    { name: "description", content: "Create a new Internet Native Company" },
  ];
};

export default function CreateCompany() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const companyProgram = useCompanyManagementProgram();
  const registryProgram = useCompanyRegistryProgram();
  const { status, signature, error, startSigning, waitForConfirmation, setError, reset } = useTransactionStatus();

  const [companyName, setCompanyName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyProgram || !registryProgram || !publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    if (!companyName.trim() || !jurisdiction.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (companyName.length > 50) {
      setError("Company name must be 50 characters or less");
      return;
    }

    if (jurisdiction.length > 50) {
      setError("Jurisdiction must be 50 characters or less");
      return;
    }

    try {
      reset();
      startSigning();

      const nameHash = hashCompanyName(companyName);
      const [companyPda] = getCompanyPda(companyName);
      const [treasuryPda] = getTreasuryPda(companyPda);
      const [registryPda] = getCompanyRegistryPda();

      const tx = await companyProgram.methods
        .initializeCompany(companyName, jurisdiction, Array.from(nameHash))
        .accounts({
          company: companyPda,
          treasury: treasuryPda,
          registryProgram: INC_FACTORY_PROGRAM_ID,
          companyProgram: INC_PROGRAM_ID,
          companyRegistry: registryPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const confirmed = await waitForConfirmation(tx);
      if (confirmed) {
        // Wait a bit for state to propagate, then navigate
        setTimeout(() => {
          navigate(`/companies/${companyPda.toBase58()}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to create company:", err);
      setError(err instanceof Error ? err.message : "Failed to create company");
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <CardTitle>Create Company</CardTitle>
          </div>
          <CardDescription>
            Register a new Internet Native Company on Solana
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!connected ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to create a company
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={50}
                  disabled={status === "signing" || status === "confirming"}
                />
                <p className="text-xs text-muted-foreground">
                  {companyName.length}/50 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  placeholder="e.g., Delaware, Wyoming, Singapore"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  maxLength={50}
                  disabled={status === "signing" || status === "confirming"}
                />
                <p className="text-xs text-muted-foreground">
                  {jurisdiction.length}/50 characters
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {status === "confirmed" && signature && (
                <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm">
                  <p>Company created successfully!</p>
                  <a
                    href={getExplorerUrl(signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View transaction
                  </a>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={status === "signing" || status === "confirming"}
              >
                {status === "signing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Transaction...
                  </>
                ) : status === "confirming" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Create Company"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
