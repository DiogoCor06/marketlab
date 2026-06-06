import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyPlaceholder } from "@/components/marketlab/buy-placeholder";
import { MarketOutcomes } from "@/components/marketlab/market-outcomes";
import { MarketStatusBadge } from "@/components/marketlab/market-status-badge";
import { ProbabilityChart } from "@/components/marketlab/probability-chart";
import { Button } from "@/components/ui/button";
import { formatCloseDate } from "@/lib/markets/logic";
import { getMarketDetail } from "@/lib/markets/queries";

type MarketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MarketDetailPage({
  params,
}: MarketDetailPageProps) {
  const { id } = await params;
  const market = await getMarketDetail(id);

  if (!market) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/markets">← Back to markets</Link>
      </Button>

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {market.title}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {market.description || "No description provided."}
              </p>
            </div>
            <MarketStatusBadge status={market.status} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Closes {formatCloseDate(market.close_date)}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="mb-4 text-lg font-semibold">Outcomes</h2>
          <MarketOutcomes
            yesChance={market.yesChance}
            chanceSource={market.chanceSource}
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
          <ProbabilityChart series={market.chartSeries} />
        </section>

        <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
          <BuyPlaceholder market={market} />
        </section>
      </div>
    </div>
  );
}
