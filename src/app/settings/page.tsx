"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";

export default function SettingsPage() {
  const [paperMode, setPaperMode] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Konfigurasi simulasi paper trading dan risk management."
      />

      {/* Warning Banner */}
      <div className="flex items-center gap-3 p-4 bg-accent-amber/5 border border-accent-amber/20 rounded-xl">
        <svg className="w-5 h-5 text-accent-amber flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-sm text-accent-amber/90">
          Live trading is disabled in this version.
        </p>
      </div>

      {/* Paper Trading Mode */}
      <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Paper Trading Mode</h3>
            <p className="text-sm text-dark-400 mt-0.5">Semua trade bersifat simulasi. Tidak ada dana asli yang digunakan.</p>
          </div>
          <button
            onClick={() => setPaperMode(!paperMode)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              paperMode ? "bg-accent-emerald" : "bg-dark-600"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                paperMode ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {paperMode && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-xs font-medium text-accent-emerald">Paper Mode Active</span>
          </div>
        )}
      </div>

      {/* Trading Configuration */}
      <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-5">Trading Configuration</h3>
        <div className="space-y-0 divide-y divide-dark-700/30">
          <SettingRow
            label="Max Trade Size"
            description="Ukuran maksimum per paper trade"
            value="$10"
          />
          <SettingRow
            label="Max Daily Loss"
            description="Batas kerugian harian sebelum auto-stop"
            value="$20"
          />
        </div>
      </div>

      {/* Wallet Filter */}
      <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-5">Wallet Filter</h3>
        <div className="space-y-0 divide-y divide-dark-700/30">
          <SettingRow
            label="Min Wallet Score"
            description="Hanya copy wallet dengan copy score di atas threshold"
            value="75"
          />
          <SettingRow
            label="Min Liquidity"
            description="Skip token dengan liquidity di bawah batas ini"
            value="$20,000"
          />
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-dark-800/50 border border-dark-700/40 rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-5">Risk Management</h3>
        <div className="space-y-0 divide-y divide-dark-700/30">
          <SettingRow
            label="Stop Loss"
            description="Auto close jika paper trade turun melewati batas"
            value="-6%"
            valueColor="text-accent-rose"
          />
          <SettingRow
            label="Take Profit 1"
            description="Target pertama — partial exit"
            value="+8%"
            valueColor="text-accent-emerald"
          />
          <SettingRow
            label="Take Profit 2"
            description="Target kedua — full exit"
            value="+15%"
            valueColor="text-accent-emerald"
          />
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 py-3 px-4 bg-dark-800/30 border border-dark-700/20 rounded-lg">
        <svg className="w-4 h-4 text-dark-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-dark-500">Settings bersifat lokal. Tidak ada koneksi ke exchange atau wallet asli.</p>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  value,
  valueColor = "text-white",
}: {
  label: string;
  description: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-dark-500 mt-0.5">{description}</p>
      </div>
      <span className={`text-sm font-semibold ${valueColor} bg-dark-700/50 px-3 py-1.5 rounded-lg border border-dark-600/30 font-mono`}>
        {value}
      </span>
    </div>
  );
}
