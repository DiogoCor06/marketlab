export function MarketEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <h2 className="text-xl font-semibold">No markets yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Markets will appear here once they are created in Supabase. This list
        reads live data and shows an empty state when none exist.
      </p>
    </div>
  );
}
