import { describe, expect, it } from "vitest";

import {
  computeYesChance,
  formatCloseDate,
  formatMarketStatus,
  isMarketBuyable,
  NEUTRAL_YES_CHANCE,
} from "@/lib/markets/logic";
import type { Market } from "@/lib/markets/types";

function makeMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: "market-1",
    title: "Test market",
    description: "Description",
    status: "open",
    close_date: "2099-01-01T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeYesChance", () => {
  it("returns neutral baseline when totals are zero", () => {
    expect(computeYesChance(0, 0)).toBe(NEUTRAL_YES_CHANCE);
  });

  it("computes rounded yes percentage from totals", () => {
    expect(computeYesChance(75, 25)).toBe(75);
    expect(computeYesChance(1, 3)).toBe(25);
  });
});

describe("isMarketBuyable", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("returns true for open markets before close date", () => {
    expect(isMarketBuyable(makeMarket(), now)).toBe(true);
  });

  it("returns false for closed or resolved markets", () => {
    expect(isMarketBuyable(makeMarket({ status: "closed" }), now)).toBe(false);
    expect(isMarketBuyable(makeMarket({ status: "resolved" }), now)).toBe(
      false,
    );
  });

  it("returns false when close date has passed", () => {
    expect(
      isMarketBuyable(
        makeMarket({ close_date: "2020-01-01T00:00:00.000Z" }),
        now,
      ),
    ).toBe(false);
  });
});

describe("formatMarketStatus", () => {
  it("formats known statuses", () => {
    expect(formatMarketStatus("open")).toBe("Open");
    expect(formatMarketStatus("closed")).toBe("Closed");
    expect(formatMarketStatus("resolved")).toBe("Resolved");
  });
});

describe("formatCloseDate", () => {
  it("formats close dates for display", () => {
    expect(formatCloseDate("2026-12-31T18:30:00.000Z")).toMatch(/Dec/);
  });
});
