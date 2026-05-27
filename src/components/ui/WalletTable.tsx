import type { WalletData } from "@/lib/mock-data";
import { ScoreBadge } from "./ScoreBadge";
import { StatusBadge } from "./StatusBadge";

interface WalletTableProps {
  wallets: WalletData[];
}

export function WalletTable({ wallets }: WalletTableProps) {
  return (
    <div className="bg-dark-800/40 border border-dark-700/30 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700/40">
              <th className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">Wallet</th>
              <th className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">ROI 24h</th>
              <th className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">Realized PnL</th>
              <th className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">Winrate</th>
              <th className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">Avg Hold</th>
              <th className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">Copy Score</th>
              <th className="text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/20">
            {wallets.map((wallet) => (
              <tr key={wallet.id} className="hover:bg-dark-800/40 transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-dark-700/50 border border-dark-600/30 flex items-center justify-center flex-shrink-0 group-hover:border-dark-500/50 transition-colors">
                      <span className="text-xs font-bold text-white">{wallet.label.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{wallet.label}</p>
                      <p className="text-[11px] text-dark-500 font-mono">{wallet.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`font-semibold ${wallet.roi24h >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                    {wallet.roi24h >= 0 ? "+" : ""}{wallet.roi24h}%
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-white font-medium">
                    ${wallet.realizedPnl >= 1000000
                      ? (wallet.realizedPnl / 1000000).toFixed(2) + "M"
                      : wallet.realizedPnl >= 1000
                      ? (wallet.realizedPnl / 1000).toFixed(1) + "K"
                      : wallet.realizedPnl.toLocaleString()
                    }
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`font-medium ${wallet.winRate >= 80 ? "text-accent-emerald" : wallet.winRate >= 70 ? "text-white" : "text-accent-amber"}`}>
                    {wallet.winRate}%
                  </span>
                </td>
                <td className="px-4 py-3.5 text-dark-300 text-sm">{wallet.avgHoldTime}</td>
                <td className="px-4 py-3.5">
                  <ScoreBadge score={wallet.copyScore} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge tag={wallet.tag} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
