type BrokerCategory = "RETAIL" | "LOCAL_INST" | "FOREIGN" | "MIXED" | "UNKNOWN";

export function classifyAccumulation(netValue: number | null | undefined) {
  if (netValue == null) return "NETRAL";
  const threshold = 0; // TODO: tune threshold based on typical ticket size
  if (netValue > threshold) return "AKUMULASI";
  if (netValue < -threshold) return "DISTRIBUSI";
  return "NETRAL";
}

export function accumulationScoreToSentiment(score: number | null | undefined) {
  if (score == null) return "neutral" as const;
  if (score >= 40) return "bullish" as const;
  if (score <= -40) return "bearish" as const;
  return "neutral" as const;
}

/**
 * Build a simple text context for LLM from snapshot + optional broker info.
 * All parameters are plain JS objects read from Supabase.
 */
export function buildContextFromSnapshot(params: {
  snapshot: any | null;
  topBuyers?: any[];
  topSellers?: any[];
}) {
  const { snapshot, topBuyers, topSellers } = params;

  if (!snapshot) {
    return null;
  }

  const lines: string[] = [];

  lines.push(
    `Saham: ${snapshot.stock_code}, tanggal: ${snapshot.date}.`,
    `Harga terakhir: ${snapshot.last_price ?? "N/A"}, perubahan: ${snapshot.price_change_pct ?? "N/A"}%.`,
    `Total nilai transaksi: ${snapshot.total_value ?? 0}, total lot: ${snapshot.total_lot ?? 0}.`,
    `Foreign net value: ${snapshot.foreign_net_value ?? 0}.`,
    `Broker top buyer: ${snapshot.top_buyer_broker ?? "-"}, top seller: ${snapshot.top_seller_broker ?? "-"}.`,
    `Skor akumulasi (perkiraan bandarmology): ${snapshot.accumulation_score ?? 0} (range -100 sampai +100).`
  );

  if (topBuyers && topBuyers.length > 0) {
    lines.push("Top buyer hari ini:");
    topBuyers.slice(0, 5).forEach((b, idx) => {
      lines.push(
        `${idx + 1}. Broker ${b.broker_code} - net buy value: ${b.net_value}, net lot: ${b.net_lot}.`
      );
    });
  }

  if (topSellers && topSellers.length > 0) {
    lines.push("Top seller hari ini:");
    topSellers.slice(0, 5).forEach((b, idx) => {
      lines.push(
        `${idx + 1}. Broker ${b.broker_code} - net sell value: ${b.net_value}, net lot: ${b.net_lot}.`
      );
    });
  }

  return lines.join("\n");
}