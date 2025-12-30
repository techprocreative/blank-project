import ProactiveDashboard from "@/components/ProactiveDashboard";
import ChatPanel from "@/components/ChatPanel";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold md:text-3xl">
          BandarInsight
        </h1>
        <p className="text-sm text-slate-300 md:text-base">
          Mentor AI yang membantu kamu memahami pergerakan bandar dengan bahasa sederhana.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <ProactiveDashboard />
        </div>
        <div className="space-y-4">
          <ChatPanel />
        </div>
      </section>
    </main>
  );
}