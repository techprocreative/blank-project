import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-side Supabase client using service role.
 * IMPORTANT: This file is only for server code (API routes, server components).
 */
export function getSupabaseServer() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not set");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}

/**
 * Helper to fetch today's market sentiment.
 */
export async function fetchTodayMarketSentiment() {
  const supabase = getSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("market_sentiment_daily")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (error) {
    console.error("Error fetching market sentiment:", error);
    return null;
  }

  return data;
}

/**
 * Helper to fetch a small list of unusual activity candidates.
 * For MVP, this just picks top 3 by absolute accumulation_score.
 */
export async function fetchUnusualActivity(limit = 3) {
  const supabase = getSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("stock_snapshots")
    .select("*")
    .eq("date", today)
    .order("accumulation_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching unusual activity:", error);
    return [];
  }

  return data ?? [];
}