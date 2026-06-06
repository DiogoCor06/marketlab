import { computeYesChance } from "@/lib/markets/logic";
import type {
  ChartPoint,
  ChartRange,
  ChartSeries,
  LedgerEntry,
  Market,
} from "@/lib/markets/types";

type BuildChartSeriesInput = {
  market: Market;
  yesChance: number;
  ledgerRows?: LedgerEntry[] | null;
  range?: ChartRange;
  now?: Date;
};

const RANGE_MS: Record<Exclude<ChartRange, "all">, number> = {
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export function parseLedgerSide(
  entry: Pick<LedgerEntry, "entry_type" | "description">,
): "yes" | "no" | null {
  const haystack =
    `${entry.entry_type} ${entry.description ?? ""}`.toLowerCase();

  if (/(?:^|[\s_-])yes(?:[\s_-]|$)|\byes\b/.test(haystack)) {
    return "yes";
  }

  if (/(?:^|[\s_-])no(?:[\s_-]|$)|\bno\b/.test(haystack)) {
    return "no";
  }

  return null;
}

export function filterChartPointsByRange(
  points: ChartPoint[],
  range: ChartRange,
  now: Date,
): ChartPoint[] {
  if (range === "all" || points.length === 0) {
    return points;
  }

  const cutoff = now.getTime() - RANGE_MS[range];
  const filtered = points.filter((point) => point.timestamp >= cutoff);

  if (filtered.length === 0) {
    return [points[points.length - 1]];
  }

  return filtered;
}

function buildHistoryPoints(
  ledgerRows: LedgerEntry[],
  marketCreatedAt: Date,
  fallbackYesChance: number,
): ChartPoint[] | null {
  const marketEntries = ledgerRows.filter((row) => row.market_id);
  if (marketEntries.length === 0) {
    return null;
  }

  let yesTotal = 0;
  let noTotal = 0;
  const points: ChartPoint[] = [
    {
      timestamp: marketCreatedAt.getTime(),
      yesChance: fallbackYesChance,
    },
  ];

  for (const entry of marketEntries) {
    const side = parseLedgerSide(entry);
    const amount = Math.abs(entry.amount_cents);

    if (side === "yes") {
      yesTotal += amount;
    } else if (side === "no") {
      noTotal += amount;
    } else {
      continue;
    }

    points.push({
      timestamp: new Date(entry.created_at).getTime(),
      yesChance: computeYesChance(yesTotal, noTotal),
    });
  }

  if (points.length <= 1) {
    return null;
  }

  return points;
}

function buildFlatSeries(
  market: Market,
  yesChance: number,
  now: Date,
): ChartSeries {
  const start = new Date(market.created_at).getTime();
  const end = now.getTime();

  return {
    mode: "flat",
    label:
      "Current market balance and sentiment (no historical price data under current access rules)",
    points: [
      { timestamp: start, yesChance },
      { timestamp: end, yesChance },
    ],
  };
}

export function buildChartSeries({
  market,
  yesChance,
  ledgerRows,
  range = "all",
  now = new Date(),
}: BuildChartSeriesInput): ChartSeries {
  const marketCreatedAt = new Date(market.created_at);
  const historyPoints =
    ledgerRows && ledgerRows.length > 0
      ? buildHistoryPoints(ledgerRows, marketCreatedAt, yesChance)
      : null;

  if (!historyPoints) {
    const flat = buildFlatSeries(market, yesChance, now);
    return {
      ...flat,
      points: filterChartPointsByRange(flat.points, range, now),
    };
  }

  const endPoint: ChartPoint = {
    timestamp: now.getTime(),
    yesChance,
  };
  const lastPoint = historyPoints[historyPoints.length - 1];
  const points =
    lastPoint.timestamp === endPoint.timestamp &&
    lastPoint.yesChance === endPoint.yesChance
      ? historyPoints
      : [...historyPoints, endPoint];

  return {
    mode: "history",
    label: "Yes probability reconstructed from available ledger activity",
    points: filterChartPointsByRange(points, range, now),
  };
}
