import { PageHeader, SignalCard } from "@/components/ui";
import { signals } from "@/lib/mock-data";

export default function AISignalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Signals"
        description="Sinyal trading otomatis berdasarkan pola whale activity dan AI analysis."
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/60 border border-dark-700/40 rounded-lg">
            <svg className="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-xs font-semibold text-accent-violet">AI Engine v2.4</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}
