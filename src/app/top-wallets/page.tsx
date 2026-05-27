"use client";

import { useState } from "react";
import { PageHeader, Button, WalletTable } from "@/components/ui";
import { wallets } from "@/lib/mock-data";
import type { WalletTag } from "@/lib/mock-data";

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
        actions={<Button variant="primary" size="md">+ Add Wallet</Button>}
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

      <p className="text-xs text-dark-500">
        Showing <span className="text-dark-300 font-medium">{filteredWallets.length}</span> wallets
      </p>

      <WalletTable wallets={filteredWallets} />

      {filteredWallets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-400 text-sm">No wallets match this filter.</p>
        </div>
      )}
    </div>
  );
}
