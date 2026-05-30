"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader, Badge, Card } from "@/components/ui";

type Activity = {
  id: string;
  walletLabel: string;
  walletAddress: string;
  action: string;
  token: string;
  tokenAddress: string;
  amount: number;
  valueUsd: number;
  timestamp: string;
  txHash: string;
  description: string;
};

type Filter = "ALL" | "BUY" | "SELL" | "TRANSFER";

function actionVariant(action: string): "success" | "danger" | "info" {
  if (action === "BUY") return "success";
  if (action === "SELL") return "danger";
  return "info";
}

function actionIcon(action: string) {
  if (action === "BUY") return "↑";
  if (action === "SELL") return "↓";
  return "⇄";
}

function actionClass(action: string) {
  if (action === "BUY") return "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20";
  if (action === "SELL") return "bg-accent-rose/10 text-accent-rose border border-accent-rose/20";
  return "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20";
}

function formatTime(value: string) {
  if (!value) return "synced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
}

export default function LiveActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      try {
        setLoading(true);
        const response = await fetch("/api/live-activities", { cache: "no-store" });
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || json.message || "Failed to load live activities");
        }

        if (!cancelled) {
          setActivities(Array.isArray(json.data) ? json.data : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setActivities([]);
          setError(err instanceof Error ? err.message : "Unable to load live activities");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadActivities();
    const interval = window.setInterval(loadActivities, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((activity) => activity.action === filter);
  }, [activities, filter]);

  const filterClass = (active: boolean) =>
    active
      ? "px-4 py-2 text-sm font-medium text-white bg-whale-600/20 border border-whale-500/30 rounded-lg"
      : "px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Activity"
        description="Real-time whale wallet transactions"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 glass-card">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-xs font-medium text-accent-emerald">Live</span>
            </div>
          </div>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setFilter("ALL")} className={filterClass(filter === "ALL")}>All</button>
        <button onClick={() => setFilter("BUY")} className={filterClass(filter === "BUY")}>Buys</button>
        <button onClick={() => setFilter("SELL")} className={filterClass(filter === "SELL")}>Sells</button>
        <button onClick={() => setFilter("TRANSFER")} className={filterClass(filter === "TRANSFER")}>Transfers</button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-whale-500/30 border-t-whale-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-5">
          <p className="text-sm font-medium text-accent-rose">Failed to load live activity</p>
          <p className="text-xs text-dark-400 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && filteredActivities.length === 0 && (
        <div className="rounded-xl border border-dark-700/40 bg-dark-800/30 p-8 text-center">
          <p className="text-sm font-medium text-white">Belum ada aktivitas live</p>
          <p className="text-xs text-dark-400 mt-1">Menunggu data Helius webhook masuk ke Supabase.</p>
        </div>
      )}

      {!loading && !error && filteredActivities.length > 0 && (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} hover className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${actionClass(activity.action)}`}>
                    {actionIcon(activity.action)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white truncate">{activity.walletLabel}</span>
                      <Badge variant={actionVariant(activity.action)}>{activity.action}</Badge>
                    </div>
                    <p className="text-sm text-dark-400 mt-1">
                      {activity.amount.toLocaleString()} <span className="text-white font-medium">{activity.token}</span>
                    </p>
                    <p className="text-xs text-dark-500 mt-1 truncate">{activity.description}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-semibold text-white">${activity.valueUsd.toLocaleString()}</p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className="text-xs text-dark-500">{formatTime(activity.timestamp)}</span>
                    <span className="text-xs text-dark-600 font-mono">{activity.txHash}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
