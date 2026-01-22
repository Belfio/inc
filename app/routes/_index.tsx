import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Building2, Users, Vote, Wallet, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "INC - Internet Native Companies" },
    { name: "description", content: "Create and manage decentralized companies on Solana" },
  ];
};

const features = [
  {
    icon: Building2,
    title: "Create Companies",
    description: "Launch your decentralized company with a unique identity and jurisdiction on the Solana blockchain.",
  },
  {
    icon: Users,
    title: "Manage Shareholders",
    description: "Add shareholders, allocate shares, and track ownership transparently on-chain.",
  },
  {
    icon: Vote,
    title: "Governance",
    description: "Create proposals, vote on decisions, and execute approved changes through decentralized governance.",
  },
  {
    icon: Wallet,
    title: "Treasury Management",
    description: "Deposit and withdraw funds from your company treasury with full transparency.",
  },
];

export default function Index() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-20">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
            Internet Native Companies
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Create and manage decentralized companies on Solana. Transparent governance,
            on-chain treasury, and verifiable shareholder records.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link to="/companies/new">
              Create Company
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/companies">View Companies</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-8 md:py-12 lg:py-16">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Everything you need to run a decentralized organization on Solana.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4 mt-8">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl">
            Ready to get started?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Connect your wallet and create your first Internet Native Company today.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link to="/companies/new">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
