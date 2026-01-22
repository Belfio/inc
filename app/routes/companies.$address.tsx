import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, Building2, Users, Vote, Wallet, Settings, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useCompany } from "~/hooks/use-company";
import { useTreasuryBalance } from "~/hooks/use-treasury";
import { shortenAddress } from "~/lib/anchor/pda";
import { ShareholderTable } from "~/components/company/shareholder-table";
import { VoterTable } from "~/components/company/voter-table";
import { TreasuryCard } from "~/components/company/treasury-card";

export const meta: MetaFunction = () => {
  return [
    { title: "Company Details - INC" },
    { name: "description", content: "View company details" },
  ];
};

export default function CompanyDetail() {
  const params = useParams();
  const { publicKey } = useWallet();
  const address = params.address ?? null;

  const { data: company, isLoading, error } = useCompany(address);
  const { data: treasuryBalance } = useTreasuryBalance(address);

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

  if (error || !company) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-destructive">Failed to load company</p>
            <p className="text-muted-foreground text-sm mt-2">
              The company might not exist or there was a network error
            </p>
            <Button asChild className="mt-4">
              <Link to="/companies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            to="/companies"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Companies
          </Link>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{company.companyName}</h1>
              <p className="text-muted-foreground">{company.jurisdiction}</p>
            </div>
          </div>
        </div>
        {isAuthority && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/companies/${address}/governance`}>
                <Vote className="h-4 w-4 mr-2" />
                Governance
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/companies/${address}/tokens`}>
                <Settings className="h-4 w-4 mr-2" />
                Tokens
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Treasury Balance</CardDescription>
            <CardTitle className="text-2xl">
              {treasuryBalance?.toFixed(4) ?? "0"} SOL
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shareholders</CardDescription>
            <CardTitle className="text-2xl">{company.shareholders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Voters</CardDescription>
            <CardTitle className="text-2xl">{company.voters.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Authority</CardDescription>
            <CardTitle className="text-sm font-mono">
              {shortenAddress(company.authority.toBase58(), 8)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shareholders">Shareholders</TabsTrigger>
          <TabsTrigger value="voters">Voters</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Shareholders
                </CardTitle>
                <CardDescription>
                  Current shareholders and their share allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {company.shareholders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No shareholders yet</p>
                ) : (
                  <div className="space-y-2">
                    {company.shareholders.slice(0, 5).map((sh) => (
                      <div key={sh.address.toBase58()} className="flex justify-between text-sm">
                        <span className="font-mono">{shortenAddress(sh.address.toBase58())}</span>
                        <span>{sh.shares.toString()} shares</span>
                      </div>
                    ))}
                    {company.shareholders.length > 5 && (
                      <p className="text-muted-foreground text-xs">
                        +{company.shareholders.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Voters
                </CardTitle>
                <CardDescription>
                  Registered voters and their voting power
                </CardDescription>
              </CardHeader>
              <CardContent>
                {company.voters.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No voters yet</p>
                ) : (
                  <div className="space-y-2">
                    {company.voters.slice(0, 5).map((v) => (
                      <div key={v.address.toBase58()} className="flex justify-between text-sm">
                        <span className="font-mono">{shortenAddress(v.address.toBase58())}</span>
                        <span>{v.votingPower.toString()} power</span>
                      </div>
                    ))}
                    {company.voters.length > 5 && (
                      <p className="text-muted-foreground text-xs">
                        +{company.voters.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shareholders">
          <ShareholderTable
            companyAddress={address!}
            shareholders={company.shareholders}
            isAuthority={isAuthority ?? false}
          />
        </TabsContent>

        <TabsContent value="voters">
          <VoterTable
            companyAddress={address!}
            voters={company.voters}
            isAuthority={isAuthority ?? false}
          />
        </TabsContent>

        <TabsContent value="treasury">
          <TreasuryCard
            companyAddress={address!}
            balance={treasuryBalance ?? 0}
            isAuthority={isAuthority ?? false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
