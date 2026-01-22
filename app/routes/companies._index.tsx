import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Plus, Building2, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useCompanies } from "~/hooks/use-companies";
import { useCompaniesByAddresses, type Company } from "~/hooks/use-company";
import { shortenAddress } from "~/lib/anchor/pda";

export const meta: MetaFunction = () => {
  return [
    { title: "Companies - INC" },
    { name: "description", content: "Browse all registered companies" },
  ];
};

function CompanyCard({ company, address }: { company: Company | null; address: string }) {
  if (!company) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="text-lg">Loading...</CardTitle>
          <CardDescription>{shortenAddress(address)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Link to={`/companies/${address}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{company.companyName}</CardTitle>
          </div>
          <CardDescription>{company.jurisdiction}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shareholders:</span>
              <span>{company.shareholders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voters:</span>
              <span>{company.voters.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Authority:</span>
              <span className="font-mono text-xs">{shortenAddress(company.authority.toBase58())}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CompaniesIndex() {
  const { data: companyAddresses, isLoading: loadingAddresses, error } = useCompanies();
  const { data: companies, isLoading: loadingCompanies } = useCompaniesByAddresses(companyAddresses ?? []);

  const isLoading = loadingAddresses || loadingCompanies;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Browse all registered Internet Native Companies
          </p>
        </div>
        <Button asChild>
          <Link to="/companies/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Company
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-destructive">Failed to load companies</p>
            <p className="text-muted-foreground text-sm mt-2">
              Make sure you're connected to the right network
            </p>
          </CardContent>
        </Card>
      ) : !companyAddresses?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No companies found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Be the first to create an Internet Native Company!
            </p>
            <Button asChild className="mt-4">
              <Link to="/companies/new">Create Company</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companyAddresses.map((address, index) => (
            <CompanyCard
              key={address.toBase58()}
              company={companies?.[index] ?? null}
              address={address.toBase58()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
