import type { LedgerEntry, MarketPositionTotals } from "@/lib/markets/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Attempts to read market-wide position totals. Under current RLS, only the
 * signed-in user's rows are visible, so this returns null when aggregates are
 * unavailable or empty.
 */
export async function fetchMarketPositionTotals(
  marketId: string,
): Promise<MarketPositionTotals | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("positions")
      .select("yes_shares_cents, no_shares_cents")
      .eq("market_id", marketId);

    if (error || !data || data.length === 0) {
      return null;
    }

    const yesTotal = data.reduce((sum, row) => sum + row.yes_shares_cents, 0);
    const noTotal = data.reduce((sum, row) => sum + row.no_shares_cents, 0);

    if (yesTotal + noTotal <= 0) {
      return null;
    }

    return { yesTotal, noTotal };
  } catch {
    return null;
  }
}

/**
 * Attempts to read ledger rows for a market. Under current RLS this only
 * returns the signed-in user's entries, so market-wide history is usually
 * unavailable.
 */
export async function fetchMarketLedgerForMarket(
  marketId: string,
): Promise<LedgerEntry[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("market_id", marketId)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
