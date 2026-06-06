import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "border-b border-border bg-background text-foreground",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/markets"
            className="text-lg font-semibold tracking-tight hover:opacity-80"
          >
            MarketLab
          </Link>
          <nav>
            <Link
              href="/markets"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Markets
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div data-auth-slot />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
