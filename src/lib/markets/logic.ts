import type { Market, MarketStatus } from "@/lib/markets/types";

export const NEUTRAL_YES_CHANCE = 50;

export function computeYesChance(yesTotal: number, noTotal: number): number {
  const total = yesTotal + noTotal;
  if (total <= 0) {
    return NEUTRAL_YES_CHANCE;
  }

  return Math.round((yesTotal / total) * 100);
}

export function isMarketBuyable(market: Market, now = new Date()): boolean {
  return market.status === "open" && new Date(market.close_date) > now;
}

export function formatMarketStatus(status: MarketStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "closed":
      return "Closed";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
}

export function formatCloseDate(closeDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(closeDate));
}
