import { Link } from "@remix-run/react";
import { Building2, Wallet, Coins } from "lucide-react";
import { WalletButton } from "~/components/solana/wallet-button";
import { NetworkBadge } from "~/components/solana/network-badge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold">INC</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/companies"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Companies
            </Link>
            <Link
              to="/inccoin"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <span className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                Inccoin
              </span>
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <NetworkBadge />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
