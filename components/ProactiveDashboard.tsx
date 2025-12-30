"use client";

import { useEffect, useState } from "react";

type UnusualStock = {
  stock_code: string;
  label: string;
  sentiment: "bullish" | "neutral" | "bearish";
  note: string;
};

type MarketSentiment = {
  market_mood: "bullish" | "bearish" | "neutral";
  note: string;
};

const mockUnusual: UnusualStock[] = [
  {
    stock_code: "BBRI",
    label: "ZP akumulasi Rp 80M",
    sentiment: "bullish",
    note: "Bullish Signal"
  },
  {
    stock_code: "GOTO",
    label: "Volume spike 300%",
    sentiment: "neutral",
    note: "Watch Closely"
  },
  {
    stock_code: "BUKA",
    label: "Foreign exit masif",
    sentiment: "bearish",
    note: "Caution"
  }
];

const mockSentiment: MarketSentiment = {
  market_mood: "bullish",
  note: "Bandar institusi mulai masuk di banking, tapi ritel masih jualan. Classic accumulation pattern."
};

export default function ProactiveDashboard() {
  const [sentiment] = useState<MarketSentiment | null>(mockSentiment);
  const [unusual] = useState<UnusualStock[]>(mockUnusual);

  // TODO: Wire to Supabase API once miner is feeding data.
  useEffect(() => {
    // placeholder for future data fetching
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-300">
          🔥 HARI INI DI PASAR
        </h2>
        {sentiment && (
          <div className="space-y-2 text-sm">
            <div className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-300">
              MARKET MOOD:{" "}
              {sentiment.market_mood === "bullish"
                ? "CAUTIOUSLY BULLISH"
                : sentiment.market_mood === "bearish"
                  ? "BEARISH"
                  : "NEUTRAL"}
            </div>
            <p className="text-slate-200">{sentiment.note}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2 text-sm">
          <h3 className="font-semibold text-slate-200">
            🚨 UNUSUAL ACTIVITY
          </h3>
          <span className="text-xs text-slate-400">3 saham terdeteksi</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-800/70 bg-slate-950/60 text-sm">
          {unusual.map((item) => (
            <div
              key={item.stock_code}
              className="flex items-center justify-between border-b border-slate-800/70 px-3 py-2 last:border-b-0"
            >
              <div className="flex flex-1 items-center gap-3">
                <span className="font-mono text-xs font-semibold text-slate-100">
                  {item.stock_code}
                </span>
                <span className="text-slate-200">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.sentiment === "bullish" && (
                  <span className="rounded-full bg-emerald-900/70 px-2 py-0.5 text-xs text-emerald-300">
                    🟢 {item.note}
                  </span>
                )}
                {item.sentiment === "neutral" && (
                  <span className="rounded-full bg-amber-900/70 px-2 py-0.5 text-xs text-amber-300">
                    🟡 {item.note}
                  </span>
                )}
                {item.sentiment === "bearish" && (
                  <span className="rounded-full bg-rose-900/70 px-2 py-0.5 text-xs text-rose-300">
                    🔴 {item.note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2 text-xs">
          <button className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-slate-500 hover:bg-slate-800">
            Lihat Detail
          </button>
          <button className="rounded-full bg-emerald-500 px-3 py-1 font-medium text-slate-900 hover:bg-emerald-400">
            Tanya AI tentang ini
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">
          💡 INSIGHT HARI INI
        </h3>
        <p className="text-sm text-slate-200">
          Broker MG (Maybank) tiba-tiba aktif di saham coal setelah 2 minggu
          absen. Terakhir pola ini terjadi sebelum rally ADRO 15%.
        </p>
        <div className="mt-3 flex gap-2 text-xs">
          <button className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-slate-500 hover:bg-slate-800">
            Saham apa saja?
          </button>
          <button className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-slate-500 hover:bg-slate-800">
            Kenapa ini penting?
          </button>
        </div>
      </section>
    </div>
  );
}