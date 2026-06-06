import {
  fetchMarketLedgerForMarket,
  fetchMarketPositionTotals,
} from "@/lib/markets/aggregates";
import { buildChartSeries } from "@/lib/markets/chart";
import { computeYesChance, NEUTRAL_YES_CHANCE } from "@/lib/markets/logic";
import type { ChartRange, ChartSeries, Market } from "@/lib/markets/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type MarketWithChance = Market & {
  yesChance: number;
  chanceSource: "aggregate" | "neutral";
};

export type MarketDetail = MarketWithChance & {
  chartSeries: ChartSeries;
};

export async function getMarkets(): Promise<Market[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function getMarketById(id: string): Promise<Market | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getMarketYesChance(
  marketId: string,
): Promise<{ yesChance: number; source: "aggregate" | "neutral" }> {
  const totals = await fetchMarketPositionTotals(marketId);

  if (!totals) {
    return { yesChance: NEUTRAL_YES_CHANCE, source: "neutral" };
  }

  return {
    yesChance: computeYesChance(totals.yesTotal, totals.noTotal),
    source: "aggregate",
  };
}

export async function getMarketDetail(
  id: string,
  range: ChartRange = "all",
): Promise<MarketDetail | null> {
  const market = await getMarketById(id);
  if (!market) {
    return null;
  }

  const [chance, ledgerRows] = await Promise.all([
    getMarketYesChance(id),
    fetchMarketLedgerForMarket(id),
  ]);

  const chartSeries = buildChartSeries({
    market,
    yesChance: chance.yesChance,
    ledgerRows,
    range,
  });

  return {
    ...market,
    yesChance: chance.yesChance,
    chanceSource: chance.source,
    chartSeries,
  };
}
