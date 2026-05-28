"use client";

import { PageHeader, PaperTradeTable } from "@/components/ui";
import { paperTrades as mockTrades, paperTradingSummary as mockSummary } from "@/lib/mock-data";
import type { PaperTradeData, PaperTradingSummary } from "@/lib/mock-data";
import { useApi } from "@/lib/hooks/useApi";

export default function PaperTradingPage() {
  const { data, loading } = useApi<{ trades: PaperTradeData[]; summary: PaperTradingSummary }>(
    "/api/paper-trades?status=",
    { trades: mockTrades, summary: mockSummary }
  );

  const trades = data?.trades || [];
  const summary = data?.summary || mockSummary;
  const openTrades = trades.filter((t) => t.status === "OPEN");
  const closedTrades = trades.filter((t) => t.status === "CLOSED");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paper Trading"
        description="Track paper positions generated from wallet signals and risk rules."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Total Paper PnL</p>
          <p className="text-xl font-bold text-accent-emerald">{summary.totalPnl}</p>
          <p className="text-[11px] text-dark-500 mt-0.5">{summary.totalPnlPercent}</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Open Trades</p>
          <p className="text-xl font-bold text-accent-cyan">{summary.openPositions}</p>
          <p className="text-[11px] text-dark-500 mt-0.5">positions active</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Closed Trades</p>
          <p className="text-xl font-bold text-dark-200">{summary.closedPositions}</p>
          <p className="text-[11px] text-dark-500 mt-0.5">completed</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Winrate</p>
          <p className="text-xl font-bold text-accent-emerald">{summary.winRate}</p>
          <p className="text-[11px] text-dark-500 mt-0.5">profit ratio</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-whale-500/30 border-t-whale-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              <h2 className="text-base font-semibold text-white">Open Positions</h2>
              <span className="text-xs text-dark-500 ml-1">({openTrades.length})</span>
            </div>
            <PaperTradeTable trades={openTrades} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-dark-500" />
              <h2 className="text-base font-semibold text-white">Closed Trades</h2>
              <span className="text-xs text-dark-500 ml-1">({closedTrades.length})</span>
            </div>
            <PaperTradeTable trades={closedTrades} showExit />
          </div>
        </>
      )}

      <div className="flex items-center gap-2 py-3 px-4 bg-dark-800/30 border border-dark-700/20 rounded-lg">
        <svg className="w-4 h-4 text-dark-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-dark-500">Paper mode only. No exchange execution or private keys are used.</p>
      </div>
    </div>
  );
}
