"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader, Card, StatCard, Table, Badge, Button } from "@/components/ui";

type PaperTrade = {
  id: string;
  token: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string;
};

type Summary = {
  totalBalance: number;
  totalPnl: number;
  totalPnlPercent: number;
  openPositions: number;
  closedPositions: number;
  winRate: number;
};

const emptySummary: Summary = {
  totalBalance: 10000,
  totalPnl: 0,
  totalPnlPercent: 0,
  openPositions: 0,
  closedPositions: 0,
  winRate: 0,
};

function money(value: number) {
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}$${Math.abs(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function plainMoney(value: number) {
  return `$${Math.abs(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
}

function numeric(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function PaperTradingPage() {
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ token: "", side: "LONG", entryPrice: "", quantity: "", currentPrice: "" });

  async function loadTrades() {
    try {
      setLoading(true);
      const response = await fetch("/api/paper-trades", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to load paper trades");
      setTrades(Array.isArray(json.data) ? json.data : []);
      setSummary(json.summary || emptySummary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load paper trades");
      setTrades([]);
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrades();
  }, []);

  async function submitTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const response = await fetch("/api/paper-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: form.token,
          side: form.side,
          entryPrice: numeric(form.entryPrice),
          quantity: numeric(form.quantity),
          currentPrice: numeric(form.currentPrice || form.entryPrice),
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to create trade");
      setTrades(Array.isArray(json.data) ? json.data : []);
      setSummary(json.summary || emptySummary);
      setForm({ token: "", side: "LONG", entryPrice: "", quantity: "", currentPrice: "" });
      setShowForm(false);
      setMessage("Paper trade tersimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create trade");
    } finally {
      setSaving(false);
    }
  }

  async function closeTrade(trade: PaperTrade) {
    const input = window.prompt(`Exit/current price untuk ${trade.token}`, String(trade.currentPrice || trade.entryPrice));
    if (input === null) return;
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const response = await fetch("/api/paper-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", id: trade.id, exitPrice: numeric(input) }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to close trade");
      setTrades(Array.isArray(json.data) ? json.data : []);
      setSummary(json.summary || emptySummary);
      setMessage("Position closed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to close trade");
    } finally {
      setSaving(false);
    }
  }

  const openTrades = useMemo(() => trades.filter((trade) => trade.status === "OPEN"), [trades]);
  const closedTrades = useMemo(() => trades.filter((trade) => trade.status === "CLOSED"), [trades]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paper Trading"
        description="Practice trading with virtual funds — saved in Supabase settings"
        actions={<Button variant="primary" size="md" onClick={() => setShowForm((value) => !value)}>{showForm ? "Close" : "+ New Trade"}</Button>}
      />

      {showForm && (
        <form onSubmit={submitTrade} className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">New paper trade</h3>
            <p className="text-xs text-dark-400 mt-1">Simulasi posisi tanpa uang real. Data tersimpan di Supabase.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Token</span>
              <input className="input-field w-full" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder="SOL" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Side</span>
              <select className="input-field w-full" value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })}>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Entry price</span>
              <input type="number" step="any" className="input-field w-full" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Quantity</span>
              <input type="number" step="any" className="input-field w-full" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-dark-400">Current price</span>
              <input type="number" step="any" className="input-field w-full" value={form.currentPrice} onChange={(e) => setForm({ ...form, currentPrice: e.target.value })} placeholder="optional" />
            </label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Trade"}</Button>
        </form>
      )}

      {message && <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-4 text-sm text-accent-emerald">{message}</div>}
      {error && <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-4 text-sm text-accent-rose">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Paper Balance" value={plainMoney(summary.totalBalance)} />
        <StatCard label="Total P&L" value={money(summary.totalPnl)} change={`${summary.totalPnlPercent >= 0 ? "+" : ""}${summary.totalPnlPercent.toFixed(2)}%`} changeType={summary.totalPnl >= 0 ? "positive" : "negative"} />
        <StatCard label="Open Positions" value={String(summary.openPositions)} />
        <StatCard label="Win Rate" value={`${summary.winRate.toFixed(1)}%`} changeType="positive" />
      </div>

      {loading && <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-whale-500/30 border-t-whale-500 rounded-full animate-spin" /></div>}

      {!loading && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Open Positions</h2>
            {openTrades.length === 0 ? (
              <Card className="p-6 text-center"><p className="text-sm text-dark-400">Belum ada open paper trade.</p></Card>
            ) : (
              <Table headers={["Token", "Side", "Entry", "Current", "Qty", "P&L", "Opened", "Action"]}>
                {openTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="table-cell"><span className="font-semibold text-white">{trade.token}</span></td>
                    <td className="table-cell"><Badge variant={trade.side === "LONG" ? "success" : "danger"}>{trade.side}</Badge></td>
                    <td className="table-cell text-dark-300">${trade.entryPrice}</td>
                    <td className="table-cell text-white font-medium">${trade.currentPrice}</td>
                    <td className="table-cell text-dark-300">{trade.quantity.toLocaleString()}</td>
                    <td className="table-cell"><span className={trade.pnl >= 0 ? "text-accent-emerald" : "text-accent-rose"}>{money(trade.pnl)} <span className="text-xs">({trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)</span></span></td>
                    <td className="table-cell text-dark-400 text-xs">{formatTime(trade.openedAt)}</td>
                    <td className="table-cell"><Button variant="ghost" size="sm" onClick={() => closeTrade(trade)} disabled={saving}>Close</Button></td>
                  </tr>
                ))}
              </Table>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Trade History</h2>
            {closedTrades.length === 0 ? (
              <Card className="p-6 text-center"><p className="text-sm text-dark-400">Belum ada trade history.</p></Card>
            ) : (
              <Table headers={["Token", "Side", "Entry", "Exit", "Qty", "P&L", "Closed"]}>
                {closedTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-dark-800/40 transition-colors opacity-80">
                    <td className="table-cell"><span className="font-semibold text-white">{trade.token}</span></td>
                    <td className="table-cell"><Badge variant={trade.side === "LONG" ? "success" : "danger"}>{trade.side}</Badge></td>
                    <td className="table-cell text-dark-300">${trade.entryPrice}</td>
                    <td className="table-cell text-white">${trade.currentPrice}</td>
                    <td className="table-cell text-dark-300">{trade.quantity.toLocaleString()}</td>
                    <td className="table-cell"><span className={trade.pnl >= 0 ? "text-accent-emerald" : "text-accent-rose"}>{money(trade.pnl)} ({trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)</span></td>
                    <td className="table-cell text-dark-400 text-xs">{formatTime(trade.closedAt || trade.openedAt)}</td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
