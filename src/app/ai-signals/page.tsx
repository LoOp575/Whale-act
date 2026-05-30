"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Badge, Button } from "@/components/ui";

type Signal = {
  id: string;
  type: string;
  token: string;
  tokenAddress: string;
  confidence: number;
  reason: string;
  riskNote: string;
  suggestedAction: string;
  entryPlan: string;
  exitPlan: string;
  invalidIf: string;
  timeHorizon: string;
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
  timestamp: string;
};

function getSignalBadge(type: string) {
  switch (type) {
    case "STRONG_BUY":
      return <Badge variant="success" size="md">STRONG BUY</Badge>;
    case "BUY":
      return <Badge variant="success" size="md">BUY</Badge>;
    case "WATCH":
      return <Badge variant="info" size="md">WATCH</Badge>;
    case "SKIP":
      return <Badge variant="warning" size="md">SKIP</Badge>;
    case "SELL":
      return <Badge variant="danger" size="md">SELL</Badge>;
    default:
      return <Badge variant="default" size="md">{type}</Badge>;
  }
}

function compact(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })}`;
}

function formatTime(value: string) {
  if (!value) return "new";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
}

export default function AISignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentMessage, setAgentMessage] = useState<string | null>(null);

  async function loadSignals() {
    try {
      const response = await fetch("/api/signals?limit=50", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to load signals");
      setSignals(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (err) {
      setSignals([]);
      setError(err instanceof Error ? err.message : "Unable to load signals");
    } finally {
      setLoading(false);
    }
  }

  async function runAgent() {
    try {
      setRunning(true);
      setAgentMessage("Scanning active Solana pairs, discovering wallets, then generating signals...");
      const response = await fetch("/api/agent/full-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limitPairs: 8, limitWallets: 30, txLimit: 20 }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        const discoveryWarnings = json.discovery?.warnings?.join(" ") || "";
        const signalWarnings = json.signals?.warnings?.join(" ") || "";
        throw new Error(json.error || discoveryWarnings || signalWarnings || "Agent failed");
      }
      setAgentMessage(`Full agent selesai: ${json.discovery?.walletsSaved || 0} wallet tersimpan, ${json.discovery?.activitiesSaved || 0} activity tersimpan, ${json.signals?.signals?.length || 0} signal baru.`);
      await loadSignals();
    } catch (err) {
      setAgentMessage(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    loadSignals();
    const interval = window.setInterval(loadSignals, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Signals"
        description="Auto-discover whale wallets, save them, then generate buy/watch/skip decisions"
        actions={<Button onClick={runAgent} disabled={running}>{running ? "Scanning..." : "Discover + Run Agent"}</Button>}
      />

      {agentMessage && (
        <Card className="p-4">
          <p className="text-sm text-dark-200">{agentMessage}</p>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-whale-500/30 border-t-whale-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-5">
          <p className="text-sm font-medium text-accent-rose">Failed to load AI signals</p>
          <p className="text-xs text-dark-400 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && signals.length === 0 && (
        <div className="rounded-xl border border-dark-700/40 bg-dark-800/30 p-8 text-center">
          <p className="text-sm font-medium text-white">Belum ada signal real</p>
          <p className="text-xs text-dark-400 mt-1">Klik Discover + Run Agent. Sistem akan cari wallet dulu, simpan ke Supabase, lalu buat signal.</p>
        </div>
      )}

      {!loading && !error && signals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {signals.map((signal) => (
            <Card key={signal.id} hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-dark-700/60 border border-dark-600/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">{signal.token[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-lg truncate">{signal.token}</h3>
                    <p className="text-xs text-dark-400">{formatTime(signal.timestamp)}</p>
                  </div>
                </div>
                {getSignalBadge(signal.type)}
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-dark-400">Confidence</span>
                  <span className="text-xs font-medium text-white">{signal.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-dark-700/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${signal.confidence >= 70 ? "bg-accent-emerald" : signal.confidence >= 45 ? "bg-accent-amber" : "bg-accent-rose"}`} style={{ width: `${Math.min(signal.confidence, 100)}%` }} />
                </div>
              </div>

              <p className="text-sm text-dark-300 mb-4 leading-relaxed">{signal.reason}</p>

              <div className="space-y-2 mb-4 text-xs text-dark-300">
                {signal.riskNote && <p><span className="text-dark-500">Risk:</span> {signal.riskNote}</p>}
                {signal.entryPlan && <p><span className="text-dark-500">Entry:</span> {signal.entryPlan}</p>}
                {signal.exitPlan && <p><span className="text-dark-500">Exit:</span> {signal.exitPlan}</p>}
                {signal.invalidIf && <p><span className="text-dark-500">Invalid:</span> {signal.invalidIf}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-dark-700/30">
                <div>
                  <p className="text-xs text-dark-500">Liquidity</p>
                  <p className="text-sm font-medium text-white">{compact(signal.liquidityUsd)}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500">24h Change</p>
                  <p className={`text-sm font-medium ${signal.priceChange24h >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>{signal.priceChange24h >= 0 ? "+" : ""}{signal.priceChange24h}%</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500">Volume</p>
                  <p className="text-sm font-medium text-white">{compact(signal.volume24h)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
