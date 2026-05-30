"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader, Table, Badge, Button } from "@/components/ui";

type Wallet = {
  id: string;
  address: string;
  label: string;
  status: string;
  roi7d: number;
  realizedPnl7d: number;
  winrate7d: number;
  tradeCount7d: number;
  avgHoldMinutes: number;
  copyScore: number;
  riskScore: number;
};

type Filter = "all" | "approved" | "high-score" | "low-risk";

function money(value: number) {
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}$${Math.abs(value).toLocaleString()}`;
}

function riskLabel(score: number) {
  if (score <= 35) return "Low";
  if (score <= 65) return "Medium";
  return "High";
}

function riskVariant(score: number): "success" | "warning" | "danger" {
  if (score <= 35) return "success";
  if (score <= 65) return "warning";
  return "danger";
}

function holdTime(minutes: number) {
  if (!minutes) return "-";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
  return `${(minutes / 1440).toFixed(1)}d`;
}

export default function TopWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWallets() {
      try {
        setLoading(true);
        const response = await fetch("/api/wallets", { cache: "no-store" });
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || json.message || "Failed to load wallets");
        }

        if (!cancelled) {
          setWallets(Array.isArray(json.data) ? json.data : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setWallets([]);
          setError(err instanceof Error ? err.message : "Unable to load wallets");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWallets();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredWallets = useMemo(() => {
    if (filter === "approved") {
      return wallets.filter((wallet) => ["APPROVED", "WATCHLIST", "TRACKING"].includes(wallet.status));
    }
    if (filter === "high-score") {
      return wallets.filter((wallet) => wallet.copyScore >= 75);
    }
    if (filter === "low-risk") {
      return wallets.filter((wallet) => wallet.riskScore <= 35);
    }
    return wallets;
  }, [wallets, filter]);

  const filterClass = (active: boolean) =>
    active
      ? "px-4 py-2 text-sm font-medium text-white bg-whale-600/20 border border-whale-500/30 rounded-lg"
      : "px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Top Wallets"
        description="Track the most profitable whale wallets on Solana"
        actions={
          <Button variant="primary" size="md">
            + Add Wallet
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setFilter("all")} className={filterClass(filter === "all")}>
          All Wallets
        </button>
        <button onClick={() => setFilter("approved")} className={filterClass(filter === "approved")}>
          Tracked Only
        </button>
        <button onClick={() => setFilter("high-score")} className={filterClass(filter === "high-score")}>
          High Score
        </button>
        <button onClick={() => setFilter("low-risk")} className={filterClass(filter === "low-risk")}>
          Low Risk
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-whale-500/30 border-t-whale-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-5">
          <p className="text-sm font-medium text-accent-rose">Failed to load wallets</p>
          <p className="text-xs text-dark-400 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && filteredWallets.length === 0 && (
        <div className="rounded-xl border border-dark-700/40 bg-dark-800/30 p-8 text-center">
          <p className="text-sm font-medium text-white">Belum ada wallet kandidat</p>
          <p className="text-xs text-dark-400 mt-1">Tambahkan wallet manual atau tunggu data agent masuk ke Supabase.</p>
        </div>
      )}

      {!loading && !error && filteredWallets.length > 0 && (
        <Table headers={["Wallet", "7D P&L", "7D ROI", "Win Rate", "Trades", "Avg Hold", "Risk", "Status"]}>
          {filteredWallets.map((wallet) => (
            <tr key={wallet.id} className="hover:bg-dark-800/40 transition-colors">
              <td className="table-cell">
                <div>
                  <p className="font-medium text-white">{wallet.label || wallet.address}</p>
                  <p className="text-xs text-dark-500 font-mono">{wallet.address}</p>
                </div>
              </td>
              <td className="table-cell">
                <span className={wallet.realizedPnl7d >= 0 ? "text-accent-emerald" : "text-accent-rose"}>
                  {money(wallet.realizedPnl7d)}
                </span>
              </td>
              <td className="table-cell">
                <span className={wallet.roi7d >= 0 ? "text-accent-emerald" : "text-accent-rose"}>
                  {wallet.roi7d >= 0 ? "+" : ""}{wallet.roi7d}%
                </span>
              </td>
              <td className="table-cell">
                <span className="text-white font-medium">{wallet.winrate7d}%</span>
              </td>
              <td className="table-cell text-dark-300">{wallet.tradeCount7d}</td>
              <td className="table-cell text-dark-300">{holdTime(wallet.avgHoldMinutes)}</td>
              <td className="table-cell">
                <Badge variant={riskVariant(wallet.riskScore)}>{riskLabel(wallet.riskScore)}</Badge>
              </td>
              <td className="table-cell">
                <Badge variant={wallet.status === "REJECTED" ? "danger" : wallet.status === "APPROVED" ? "success" : "info"}>
                  {wallet.status}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
