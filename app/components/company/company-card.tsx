import { Link } from "@remix-run/react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { shortenAddress } from "~/lib/anchor/pda";
import type { Company } from "~/hooks/use-company";

interface CompanyCardProps {
  company: Company;
  address: string;
}

export function CompanyCard({ company, address }: CompanyCardProps) {
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
              <span className="font-mono text-xs">
                {shortenAddress(company.authority.toBase58())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
