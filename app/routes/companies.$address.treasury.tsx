import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCompany } from "~/hooks/use-company";
import { useTreasuryBalance } from "~/hooks/use-treasury";
import { TreasuryCard } from "~/components/company/treasury-card";
import { Card, CardContent } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "Treasury - INC" },
    { name: "description", content: "Company treasury management" },
  ];
};

export default function CompanyTreasury() {
  const params = useParams();
  const { publicKey } = useWallet();
  const address = params.address ?? null;

  const { data: company, isLoading } = useCompany(address);
  const { data: balance } = useTreasuryBalance(address);

  const isAuthority = publicKey && company?.authority.equals(publicKey);

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
        <h1 className="text-3xl font-bold">Treasury</h1>
        <p className="text-muted-foreground mt-1">
          Manage treasury funds for {company.companyName}
        </p>
      </div>

      <TreasuryCard
        companyAddress={address!}
        balance={balance ?? 0}
        isAuthority={isAuthority ?? false}
      />
    </div>
  );
}
