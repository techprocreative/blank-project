import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query: string };

    // TODO: Integrasi Supabase + OpenRouter.
    // Untuk sementara, return dummy streaming-like text.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunks = [
          "Hmm, menarik nih pertanyaannya.\n\n",
          "Saat ini saya belum terhubung ke data real-time, ",
          "tapi struktur analisanya akan seperti ini:\n\n",
          "1. Ringkasan kondisi saham atau pasar.\n",
          "2. Data pendukung (broker, volume, foreign flow).\n",
          "3. Konteks historis jika ada polanya.\n",
          "4. Edukasi singkat tentang istilah yang dipakai.\n",
          "5. Disclaimer: ini bukan rekomendasi beli/jual.\n\n",
          "Begitu data dari miner sudah masuk ke Supabase, ",
          "jawaban di sini akan langsung memakai data real / near real-time."
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
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}