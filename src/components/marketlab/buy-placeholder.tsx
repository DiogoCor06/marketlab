import { Button } from "@/components/ui/button";
import { isMarketBuyable } from "@/lib/markets/logic";
import type { Market } from "@/lib/markets/types";

export function BuyPlaceholder({ market }: { market: Market }) {
  const buyable = isMarketBuyable(market);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Trade</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Buying and selling will be added in a later workshop step.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button disabled>Buy Yes</Button>
        <Button disabled variant="outline">
          Buy No
        </Button>
      </div>

      {!buyable ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Buying unavailable — this market is closed, resolved, or past its
          close date.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Trading controls are disabled for now. This market is still open.
        </p>
      )}
    </div>
  );
}
