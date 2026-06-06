import { describe, expect, it } from "vitest";

import {
  buildChartSeries,
  filterChartPointsByRange,
  parseLedgerSide,
} from "@/lib/markets/chart";
import type { LedgerEntry, Market } from "@/lib/markets/types";

const market: Market = {
  id: "market-1",
  title: "Test",
  description: "",
  status: "open",
  close_date: "2099-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const now = new Date("2026-06-01T12:00:00.000Z");

function makeLedger(
  overrides: Partial<LedgerEntry> & Pick<LedgerEntry, "entry_type">,
): LedgerEntry {
  return {
    id: "ledger-1",
    user_id: "user-1",
    market_id: market.id,
    amount_cents: 100,
    description: null,
    created_at: "2026-02-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("parseLedgerSide", () => {
  it("detects yes and no hints from entry metadata", () => {
    expect(parseLedgerSide({ entry_type: "buy_yes", description: null })).toBe(
      "yes",
    );
    expect(
      parseLedgerSide({ entry_type: "trade", description: "Buy No" }),
    ).toBe("no");
    expect(parseLedgerSide({ entry_type: "deposit", description: null })).toBe(
      null,
    );
  });
});

describe("buildChartSeries", () => {
  it("returns a flat series when ledger history is unavailable", () => {
    const series = buildChartSeries({
      market,
      yesChance: 50,
      ledgerRows: null,
      now,
    });

    expect(series.mode).toBe("flat");
    expect(series.points).toHaveLength(2);
    expect(series.points[0].yesChance).toBe(50);
    expect(series.points[1].yesChance).toBe(50);
  });

  it("builds history when ledger rows encode sides", () => {
    const series = buildChartSeries({
      market,
      yesChance: 67,
      ledgerRows: [
        makeLedger({
          id: "1",
          entry_type: "buy_yes",
          amount_cents: 200,
          created_at: "2026-02-01T00:00:00.000Z",
        }),
        makeLedger({
          id: "2",
          entry_type: "buy_no",
          amount_cents: 100,
          created_at: "2026-03-01T00:00:00.000Z",
        }),
      ],
      now,
    });

    expect(series.mode).toBe("history");
    expect(series.points.length).toBeGreaterThan(2);
    expect(series.points[series.points.length - 1].yesChance).toBe(67);
  });
});

describe("filterChartPointsByRange", () => {
  const points = [
    {
      timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
      yesChance: 50,
    },
    {
      timestamp: new Date("2026-05-20T00:00:00.000Z").getTime(),
      yesChance: 60,
    },
    {
      timestamp: new Date("2026-05-28T00:00:00.000Z").getTime(),
      yesChance: 65,
    },
  ];

  it("keeps all points for the all range", () => {
    expect(filterChartPointsByRange(points, "all", now)).toHaveLength(3);
  });

  it("filters to recent points for bounded ranges", () => {
    const filtered = filterChartPointsByRange(points, "7d", now);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].timestamp).toBeGreaterThan(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
  });
});
