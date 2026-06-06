import type { Database } from "@/lib/supabase/database.types";

export type Market = Database["public"]["Tables"]["markets"]["Row"];
export type MarketStatus = Market["status"];
export type LedgerEntry = Database["public"]["Tables"]["ledger_entries"]["Row"];
export type Position = Database["public"]["Tables"]["positions"]["Row"];

export type ChartRange = "7d" | "30d" | "all";

export type ChartPoint = {
  timestamp: number;
  yesChance: number;
};

export type ChartSeries = {
  points: ChartPoint[];
  mode: "history" | "flat";
  label: string;
};

export type MarketPositionTotals = {
  yesTotal: number;
  noTotal: number;
};
