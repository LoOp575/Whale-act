"use client";

import { useState } from "react";
import { PageHeader, Table, Badge, Button } from "@/components/ui";
import { wallets } from "@/lib/mock-data";
import type { WalletTag } from "@/lib/mock-data";

const TAG_STYLES: Record<WalletTag, { label: string; variant: "info" | "success" | "warning" | "danger" | "purple" | "default" }> = {
  watchlist: { label: "Watchlist", variant: "info" },
  testing: { label: "Testing", variant: "purple" },
  good: { label: "Good", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  neutral: { label: "Neutral", variant: "default" },
};

type FilterType = "all" | WalletTag;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "watchlist", label: "Watchlist" },
  { key: "testing", label: "Testing" },
  { key: "good", label: "Good" },
  { key: "rejected", label: "Rejected" },
];

export default function TopWalletsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredWallets =
    activeFilter === "all"
      ? wallets
      : wallets.filter((w) => w.tag === activeFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Top Wallets"
        description="Track and evaluate the most profitable whale wallets on Solana"
        actions={
          <Button variant="primary" size="md">
            + Add Wallet
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeFilter === filter.key
                ? "text-white bg-whale-600/20 border border-whale-500/30 shadow-sm shadow-whale-500/10"
                : "text-dark-400 hover:text-white hover:bg-dark-700/40 border border-transparent"
            }`}
          >
            {filter.label}
            {filter.key !== "all" && (
              <span className="ml-1.5 text-xs text-dark-500">
                ({wallets.filter((w) => w.tag === filter.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-dark-500">
        Showing <span className="text-dark-300 font-medium">{filteredWallets.length}</span> wallets
      </p>

      {/* Wallets Table */}
      <Table headers={["Wallet", "ROI 24h", "Realized PnL", "Winrate", "Avg Hold", "Copy Score", "Status"]}>
        {filteredWallets.map((wallet) => (
          <tr key={wallet.id} className="hover:bg-dark-800/40 transition-colors group">
            {/* Wallet */}
            <td className="table-cell">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-700/50 border border-dark-600/30 flex items-center justify-center flex-shrink-0 group-hover:border-dark-500/50 transition-colors">
                  <span className="text-xs font-bold text-white">
                    {wallet.label.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{wallet.label}</p>
                  <p className="text-[11px] text-dark-500 font-mono">{wallet.address}</p>
                </div>
              </div>
            </td>

            {/* ROI 24h */}
            <td className="table-cell">
              <span className={`font-semibold ${wallet.roi24h >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                {wallet.roi24h >= 0 ? "+" : ""}{wallet.roi24h}%
              </span>
            </td>

            {/* Realized PnL */}
            <td className="table-cell">
              <span className="text-white font-medium">
                ${wallet.realizedPnl >= 1000000
                  ? (wallet.realizedPnl / 1000000).toFixed(2) + "M"
                  : wallet.realizedPnl >= 1000
                  ? (wallet.realizedPnl / 1000).toFixed(1) + "K"
                  : wallet.realizedPnl.toLocaleString()
                }
              </span>
            </td>

            {/* Winrate */}
            <td className="table-cell">
              <span className={`font-medium ${wallet.winRate >= 80 ? "text-accent-emerald" : wallet.winRate >= 70 ? "text-white" : "text-accent-amber"}`}>
                {wallet.winRate}%
              </span>
            </td>

            {/* Avg Hold */}
            <td className="table-cell text-dark-300 text-sm">
              {wallet.avgHoldTime}
            </td>

            {/* Copy Score */}
            <td className="table-cell">
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-2 bg-dark-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      wallet.copyScore >= 80 ? "bg-accent-emerald" :
                      wallet.copyScore >= 60 ? "bg-accent-amber" :
                      "bg-accent-rose"
                    }`}
                    style={{ width: `${wallet.copyScore}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold min-w-[24px] ${
                  wallet.copyScore >= 80 ? "text-accent-emerald" :
                  wallet.copyScore >= 60 ? "text-accent-amber" :
                  "text-accent-rose"
                }`}>
                  {wallet.copyScore}
                </span>
              </div>
            </td>

            {/* Status Badge */}
            <td className="table-cell">
              <Badge variant={TAG_STYLES[wallet.tag].variant}>
                {TAG_STYLES[wallet.tag].label}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>

      {/* Empty state */}
      {filteredWallets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-400 text-sm">No wallets match this filter.</p>
        </div>
      )}
    </div>
  );
}
