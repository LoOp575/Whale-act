import { PageHeader } from "@/components/ui";
import { signals } from "@/lib/mock-data";
import type { SignalType } from "@/lib/mock-data";

const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; bg: string; border: string; dotColor: string }> = {
  BUY: {
    label: "BUY",
    color: "text-accent-emerald",
    bg: "bg-accent-emerald/10",
    border: "border-accent-emerald/25",
    dotColor: "bg-accent-emerald",
  },
  WAIT: {
    label: "WAIT",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    border: "border-accent-cyan/25",
    dotColor: "bg-accent-cyan",
  },
  REJECT: {
    label: "REJECT",
    color: "text-accent-rose",
    bg: "bg-accent-rose/10",
    border: "border-accent-rose/25",
    dotColor: "bg-accent-rose",
  },
  EXIT: {
    label: "EXIT",
    color: "text-accent-rose",
    bg: "bg-accent-rose/8",
    border: "border-accent-rose/20",
    dotColor: "bg-accent-rose",
  },
  WARNING: {
    label: "WARNING",
    color: "text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    dotColor: "bg-red-400",
  },
};

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

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {signals.map((signal) => {
          const config = SIGNAL_CONFIG[signal.type];

          return (
            <div
              key={signal.id}
              className={`
                relative rounded-xl border p-5 sm:p-6 transition-all duration-200
                bg-dark-800/40 hover:bg-dark-800/60
                ${config.border}
              `}
            >
              {/* Top: Type badge + Token + Timestamp */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Signal type badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${config.bg} ${config.color} border ${config.border}`}>
                    {config.label}
                  </span>
                  {/* Token */}
                  <span className="text-lg font-bold text-white">{signal.token}</span>
                </div>
                <span className="text-[11px] text-dark-500 mt-1">{signal.timestamp}</span>
              </div>

              {/* Confidence bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-dark-400">Confidence</span>
                  <span className={`text-xs font-bold ${
                    signal.confidence >= 80 ? "text-accent-emerald" :
                    signal.confidence >= 60 ? "text-accent-amber" :
                    "text-accent-rose"
                  }`}>{signal.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-dark-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      signal.confidence >= 80 ? "bg-accent-emerald" :
                      signal.confidence >= 60 ? "bg-accent-amber" :
                      "bg-accent-rose"
                    }`}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
              </div>

              {/* Wallet copied */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] text-dark-500 uppercase tracking-wide">Copied from</span>
                <span className="text-sm font-semibold text-white bg-dark-700/50 px-2 py-0.5 rounded-md border border-dark-600/30">
                  {signal.walletCopied}
                </span>
              </div>

              {/* Reason */}
              <div className="mb-3">
                <p className="text-[11px] text-dark-500 uppercase tracking-wide mb-1">Reason</p>
                <p className="text-sm text-dark-200 leading-relaxed">{signal.reason}</p>
              </div>

              {/* Risk Note */}
              <div className="mb-3">
                <p className="text-[11px] text-dark-500 uppercase tracking-wide mb-1">Risk Note</p>
                <p className="text-sm text-accent-amber/90 leading-relaxed">{signal.riskNote}</p>
              </div>

              {/* Suggested Action */}
              <div className={`mt-4 pt-4 border-t border-dark-700/30`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                  <span className="text-[11px] text-dark-500 uppercase tracking-wide">Suggested Action</span>
                </div>
                <p className={`text-sm font-medium mt-1 ${config.color}`}>
                  {signal.suggestedAction}
                </p>
              </div>

              {/* Bottom stats */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-700/20">
                <span className="text-[11px] text-dark-500">
                  24h: <span className={`font-medium ${signal.priceChange24h >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                    {signal.priceChange24h >= 0 ? "+" : ""}{signal.priceChange24h}%
                  </span>
                </span>
                <span className="text-[11px] text-dark-500">
                  Vol: <span className="text-dark-300 font-medium">{signal.volume24h}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
