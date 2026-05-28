"use client";

import { PageHeader, Card, SignalCard, ActivityFeed, RiskBadge } from "@/components/ui";
import { activities as mockActivities, signals as mockSignals, wallets as mockWallets } from "@/lib/mock-data";
import type { ActivityData, WalletData, SignalData } from "@/lib/mock-data";
import { useApi } from "@/lib/hooks/useApi";
import { ReactNode } from "react";

const stats: { label: string; value: string; change: string; changeType: "positive" | "negative" | "neutral"; icon: ReactNode; accentColor: string; bgColor: string }[] = [
  {
    label: "Wallets Tracked",
    value: "142",
    change: "+5 today",
    changeType: "positive",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" /></svg>,
    accentColor: "text-whale-400",
    bgColor: "bg-whale-500/10",
  },
  {
    label: "Top ROI Today",
    value: "+67.8%",
    change: "Degen King",
    changeType: "positive",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
    accentColor: "text-accent-emerald",
    bgColor: "bg-accent-emerald/10",
  },
  {
    label: "Active AI Signals",
    value: "6",
    change: "2 strong buy",
    changeType: "neutral",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
    accentColor: "text-accent-cyan",
    bgColor: "bg-accent-cyan/10",
  },
  {
    label: "Exit Warnings",
    value: "3",
    change: "BONK, PYTH, WIF",
    changeType: "negative",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    accentColor: "text-accent-rose",
    bgColor: "bg-accent-rose/10",
  },
  {
    label: "Paper PnL",
    value: "+$1,745",
    change: "+17.45% all time",
    changeType: "positive",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    accentColor: "text-accent-emerald",
    bgColor: "bg-accent-emerald/10",
  },
];

export default function DashboardPage() {
  const { data: wallets } = useApi<WalletData[]>("/api/wallets?sort=roi24h", mockWallets);
  const { data: signals } = useApi<SignalData[]>("/api/signals?limit=5", mockSignals);
  const { data: activities } = useApi<ActivityData[]>("/api/live-activities", mockActivities);

  const allWallets = wallets || mockWallets;
  const allSignals = signals || mockSignals;
  const allActivities = activities || mockActivities;
  const topWalletsToday = [...allWallets].sort((a, b) => b.roi24h - a.roi24h).slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader title="WhaleCopy AI Dashboard" description="Monitor smart wallets, AI signals, and paper trading performance." />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-dark-800/50 backdrop-blur border border-dark-700/40 rounded-xl p-5 hover:border-dark-600/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.accentColor}`}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className={`text-xs font-medium ${stat.changeType === "positive" ? "text-accent-emerald" : stat.changeType === "negative" ? "text-accent-rose" : "text-dark-400"}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest AI Signals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              <h3 className="text-base font-semibold text-white">Latest AI Signals</h3>
            </div>
            <a href="/ai-signals" className="text-xs text-whale-400 hover:text-whale-300 transition-colors font-medium">View all</a>
          </div>
          <div className="space-y-3">
            {allSignals.slice(0, 5).map((signal) => (
              <SignalCard key={signal.id} signal={signal} compact />
            ))}
          </div>
        </Card>

        {/* Live Whale Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <h3 className="text-base font-semibold text-white">Live Whale Activity</h3>
            </div>
            <a href="/live-activity" className="text-xs text-whale-400 hover:text-whale-300 transition-colors font-medium">View all</a>
          </div>
          <ActivityFeed activities={allActivities.slice(0, 7)} compact />
        </Card>

        {/* Top Wallets Today */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-violet" />
              <h3 className="text-base font-semibold text-white">Top Wallets Today</h3>
            </div>
            <a href="/top-wallets" className="text-xs text-whale-400 hover:text-whale-300 transition-colors font-medium">View all</a>
          </div>
          <div className="space-y-3">
            {topWalletsToday.map((wallet, index) => (
              <div key={wallet.id} className="p-3.5 rounded-lg bg-dark-850/60 border border-dark-700/30 hover:border-dark-600/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${index === 0 ? "bg-accent-amber/15 border border-accent-amber/25" : "bg-dark-700/40 border border-dark-600/20"}`}>
                    <span className={`text-xs font-bold ${index === 0 ? "text-accent-amber" : "text-dark-300"}`}>#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{wallet.label}</p>
                    <p className="text-[11px] text-dark-500 font-mono">{wallet.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${wallet.roi24h >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>{wallet.roi24h >= 0 ? "+" : ""}{wallet.roi24h}%</p>
                    <p className="text-[11px] text-dark-500">24h ROI</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-dark-700/20">
                  <span className="text-[11px] text-dark-500">Win: <span className="text-white font-medium">{wallet.winRate}%</span></span>
                  <span className="text-[11px] text-dark-500">Score: <span className="text-dark-300">{wallet.copyScore}</span></span>
                  <span className="ml-auto"><RiskBadge risk={wallet.riskScore} /></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
