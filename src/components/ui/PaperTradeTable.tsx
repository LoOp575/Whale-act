import type { PaperTradeData } from "@/lib/mock-data";
import { Badge } from "./Badge";

interface PaperTradeTableProps {
  trades: PaperTradeData[];
  showExit?: boolean;
}

export function PaperTradeTable({ trades, showExit = false }: PaperTradeTableProps) {
  const headers = showExit
    ? ["Token", "Copied Wallet", "Entry", "Exit", "PnL", "Duration", "Entry Reason", "Exit Reason", "Status"]
    : ["Token", "Copied Wallet", "Entry Price", "PnL", "Duration", "Entry Reason", "Status"];

  return (
    <div className="bg-dark-800/40 border border-dark-700/30 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700/40">
              {headers.map((h) => (
                <th key={h} className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/20">
            {trades.map((trade) => (
              <tr key={trade.id} className={`hover:bg-dark-800/60 transition-colors ${showExit ? "opacity-80" : ""}`}>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-bold text-white">{trade.token}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-dark-200">{trade.copiedFrom}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-dark-300 font-mono">${trade.entryPrice}</span>
                </td>
                {showExit && (
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-dark-200 font-mono">${trade.exitPrice}</span>
                  </td>
                )}
                <td className="px-4 py-3.5">
                  <div>
                    <span className={`text-sm font-semibold ${trade.pnl >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                    </span>
                    <span className={`text-xs ml-1.5 ${trade.pnlPercent >= 0 ? "text-accent-emerald/70" : "text-accent-rose/70"}`}>
                      ({trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-dark-300">{trade.duration}</span>
                </td>
                <td className="px-4 py-3.5 max-w-[220px]">
                  <p className="text-xs text-dark-400 truncate">{trade.entryReason}</p>
                </td>
                {showExit && (
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <p className="text-xs text-dark-400 truncate">{trade.exitReason}</p>
                  </td>
                )}
                <td className="px-4 py-3.5">
                  <Badge variant={trade.status === "OPEN" ? "info" : "default"}>
                    {trade.status === "OPEN" ? "Open" : "Closed"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
