import { cn } from "@/lib/utils";

type MarketOutcomesProps = {
  yesChance: number;
  chanceSource: "aggregate" | "neutral";
};

export function MarketOutcomes({
  yesChance,
  chanceSource,
}: MarketOutcomesProps) {
  const noChance = 100 - yesChance;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Yes</p>
          <p className="text-xs text-muted-foreground">Outcome A</p>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{yesChance}%</p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium">No</p>
          <p className="text-xs text-muted-foreground">Outcome B</p>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{noChance}%</p>
      </div>

      <p
        className={cn(
          "text-xs",
          chanceSource === "neutral"
            ? "text-amber-700 dark:text-amber-300"
            : "text-muted-foreground",
        )}
      >
        {chanceSource === "neutral"
          ? "Showing a neutral 50% baseline because market-wide position totals are not available under current access rules."
          : "Yes chance is computed from available position totals."}
      </p>
    </div>
  );
}
