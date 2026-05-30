"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

type WalletForm = {
  address: string;
  label: string;
  winrate7d: string;
  realizedPnl7d: string;
  tradeCount7d: string;
  copyScore: string;
  riskScore: string;
};

const emptyForm: WalletForm = {
  address: "",
  label: "",
  winrate7d: "70",
  realizedPnl7d: "0",
  tradeCount7d: "3",
  copyScore: "70",
  riskScore: "45",
};

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

function numeric(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TopWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<WalletForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadWallets() {
    try {
      setLoading(true);
      const response = await fetch("/api/wallets", { cache: "no-store" });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to load wallets");
      }

      setWallets(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (err) {
      setWallets([]);
      setError(err instanceof Error ? err.message : "Unable to load wallets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWallets();
  }, []);

  async function submitWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const address = form.address.trim();
      if (!address) throw new Error("Wallet address wajib diisi.");

      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          label: form.label.trim() || undefined,
          status: "APPROVED",
          source: "manual_web",
          winrate7d: numeric(form.winrate7d),
          realizedPnl7d: numeric(form.realizedPnl7d),
          tradeCount7d: numeric(form.tradeCount7d),
          copyScore: numeric(form.copyScore),
          riskScore: numeric(form.riskScore),
          lastSeenAt: new Date().toISOString(),
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to save wallet");

      setForm(emptyForm);
      setShowForm(false);
      setMessage("Wallet tersimpan. Sekarang buka AI Signals lalu klik Run Agent.");
      await loadWallets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save wallet");
    } finally {
      setSaving(false);
    }
  }

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

  const inputClass = "input-field w-full";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Top Wallets"
        description="Track the most profitable whale wallets on Solana"
        actions={
          <Button variant="primary" size="md" onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Close" : "+ Add Wallet"}
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={submitWallet} className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Tambah wallet real</h3>
            <p className="text-xs text-dark-400 mt-1">Masukkan wallet yang mau discan agent. Minimal isi address; metric bisa kamu estimasi dulu lalu nanti diperbarui.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Wallet address</span>
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Solana wallet address" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Label</span>
              <input className={inputClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Whale Alpha" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Winrate 7D %</span>
              <input type="number" className={inputClass} value={form.winrate7d} onChange={(e) => setForm({ ...form, winrate7d: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Realized P&L 7D USD</span>
              <input type="number" className={inputClass} value={form.realizedPnl7d} onChange={(e) => setForm({ ...form, realizedPnl7d: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Trades 7D</span>
              <input type="number" className={inputClass} value={form.tradeCount7d} onChange={(e) => setForm({ ...form, tradeCount7d: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Copy Score</span>
              <input type="number" className={inputClass} value={form.copyScore} onChange={(e) => setForm({ ...form, copyScore: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Risk Score</span>
              <input type="number" className={inputClass} value={form.riskScore} onChange={(e) => setForm({ ...form, riskScore: e.target.value })} />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Wallet"}</Button>
            <p className="text-xs text-dark-500">Set status otomatis APPROVED agar langsung masuk filter agent.</p>
          </div>
        </form>
      )}

      {message && (
        <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-4">
          <p className="text-sm text-accent-emerald">{message}</p>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setFilter("all")} className={filterClass(filter === "all")}>All Wallets</button>
        <button onClick={() => setFilter("approved")} className={filterClass(filter === "approved")}>Tracked Only</button>
        <button onClick={() => setFilter("high-score")} className={filterClass(filter === "high-score")}>High Score</button>
        <button onClick={() => setFilter("low-risk")} className={filterClass(filter === "low-risk")}>Low Risk</button>
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
          <p className="text-xs text-dark-400 mt-1">Klik + Add Wallet untuk seed wallet real pertama, lalu jalankan agent.</p>
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
                <span className={wallet.realizedPnl7d >= 0 ? "text-accent-emerald" : "text-accent-rose"}>{money(wallet.realizedPnl7d)}</span>
              </td>
              <td className="table-cell">
                <span className={wallet.roi7d >= 0 ? "text-accent-emerald" : "text-accent-rose"}>{wallet.roi7d >= 0 ? "+" : ""}{wallet.roi7d}%</span>
              </td>
              <td className="table-cell"><span className="text-white font-medium">{wallet.winrate7d}%</span></td>
              <td className="table-cell text-dark-300">{wallet.tradeCount7d}</td>
              <td className="table-cell text-dark-300">{holdTime(wallet.avgHoldMinutes)}</td>
              <td className="table-cell"><Badge variant={riskVariant(wallet.riskScore)}>{riskLabel(wallet.riskScore)}</Badge></td>
              <td className="table-cell">
                <Badge variant={wallet.status === "REJECTED" ? "danger" : wallet.status === "APPROVED" ? "success" : "info"}>{wallet.status}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
