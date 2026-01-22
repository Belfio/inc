import { Building2, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>INC - Internet Native Companies</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Belfio/inc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          Built on Solana
        </p>
      </div>
    </footer>
  );
}
