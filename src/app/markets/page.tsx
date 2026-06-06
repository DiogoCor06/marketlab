import { MarketCard } from "@/components/marketlab/market-card";
import { MarketEmptyState } from "@/components/marketlab/market-empty-state";
import { getMarkets } from "@/lib/markets/queries";

export default async function MarketsPage() {
  const markets = await getMarkets();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Markets</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Browse live Yes/No markets backed by Supabase. Trading controls arrive
          in a later workshop step.
        </p>
      </div>

      {markets.length === 0 ? (
        <MarketEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
