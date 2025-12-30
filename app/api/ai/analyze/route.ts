import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PAK_BANDAR_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/promptTemplates";
import { buildContextFromSnapshot } from "@/lib/bandarmologyLogic";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const runtime = "edge";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

type AnalyzeRequestBody = {
  query: string;
};

function extractStockCode(query: string): string | null {
  const match = query.toUpperCase().match(/\b[ABCEFGHIJKLMNOPQRSTUVWXYZ]{3,4}\b/);
  return match ? match[0] : null;
}

async function fetchContextForStock(stockCode: string | null) {
  if (!stockCode) return null;
  try {
    const supabase = getSupabaseServer();
    const today = new Date().toISOString().slice(0, 10);

    const { data: snapshot } = await supabase
      .from("stock_snapshots")
      .select("*")
      .eq("stock_code", stockCode)
      .eq("date", today)
      .maybeSingle();

    if (!snapshot) return null;

    const { data: topBuyers } = await supabase
      .from("broker_transactions")
      .select("broker_code, net_value, net_lot")
      .eq("stock_code", stockCode)
      .eq("date", today)
      .order("net_value", { ascending: false })
      .limit(5);

    const { data: topSellers } = await supabase
      .from("broker_transactions")
      .select("broker_code, net_value, net_lot")
      .eq("stock_code", stockCode)
      .eq("date", today)
      .order("net_value", { ascending: true })
      .limit(5);

    return buildContextFromSnapshot({
      snapshot,
      topBuyers: topBuyers ?? [],
      topSellers: topSellers ?? []
    });
  } catch (e) {
    console.error("Error building context:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeRequestBody;
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Fallback: behave like earlier dummy streamer if no key configured.
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunks = [
            "Hmm, menarik nih pertanyaannya.\n\n",
            "Saat ini saya belum terhubung ke OpenRouter, ",
            "tapi struktur analisanya akan seperti ini:\n\n",
            "1. Ringkasan kondisi saham atau pasar.\n",
            "2. Data pendukung (broker, volume, foreign flow).\n",
            "3. Konteks historis jika ada polanya.\n",
            "4. Edukasi singkat tentang istilah yang dipakai.\n",
            "5. Disclaimer: ini bukan rekomendasi beli/jual.\n\n",
            "Setelah API key di-setup, jawaban akan menggunakan LLM sungguhan."
          ];

          let i = 0;
          function pushChunk() {
            if (i >= chunks.length) {
              controller.close();
              return;
            }
            controller.enqueue(encoder.encode(chunks[i]));
            i += 1;
            setTimeout(pushChunk, 120);
          }

          pushChunk();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }

    const stockCode = extractStockCode(query);
    const contextText = await fetchContextForStock(stockCode);

    const client = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL
    });

    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3-8b-instruct:free",
      stream: true,
      messages: [
        { role: "system", content: PAK_BANDAR_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(query, contextText) }
      ]
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (!delta) continue;
            controller.enqueue(encoder.encode(delta));
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}