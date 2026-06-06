import Link from "next/link";

import { MarketStatusBadge } from "@/components/marketlab/market-status-badge";
import { Button } from "@/components/ui/button";
import { formatCloseDate } from "@/lib/markets/logic";
import type { Market } from "@/lib/markets/types";

export function MarketCard({ market }: { market: Market }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-tight">{market.title}</h2>
        <MarketStatusBadge status={market.status} />
      </div>

      <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
        {market.description || "No description provided."}
      </p>

      <div className="mt-auto space-y-3">
        <p className="text-xs text-muted-foreground">
          Closes {formatCloseDate(market.close_date)}
        </p>
        <Button asChild className="w-full">
          <Link href={`/markets/${market.id}`}>View market</Link>
        </Button>
      </div>
    </article>
  );
}
