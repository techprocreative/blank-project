"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        'Halo, saya Pak Bandar. Cukup ketik kode saham atau pertanyaan sederhana, misalnya: "BBRI lagi diakumulasi gak?"'
    }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      // Anti-FOMO delay 3 detik sebelum mulai stream
      await new Promise((res) => setTimeout(res, 3000));
      setIsThinking(false);
      setIsStreaming(true);

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        body: JSON.stringify({ query: trimmed }),
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok || !response.body) {
        throw new Error("AI error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" }
      ]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!value) continue;
        const chunk = decoder.decode(value);

        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        );
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Waduh, otaknya lagi nge-lag nih. Coba ulang beberapa saat lagi ya."
        }
      ]);
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Tanya Pak Bandar
          </h2>
          <p className="text-[11px] text-slate-400">
            Ketik kode saham atau pertanyaan singkat. Jawaban bukan rekomendasi
            beli/jual.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 p-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                m.role === "user"
                  ? "bg-emerald-600 text-slate-900"
                  : "bg-slate-800 text-slate-100"
              } text-xs md:text-sm`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="mt-1 text-[11px] text-slate-400">
            Sedang menganalisis data...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-2 space-y-1">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Contoh: "Analisa BBRI" atau "Saham apa yang lagi diakumulasi bandar?"'
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Keputusan terbaik dibuat dengan kepala dingin.</span>
          <button
            type="submit"
            disabled={isStreaming}
            className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
}