"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/ui";

type AppSettings = {
  displayName: string;
  theme: string;
  whaleAlerts: boolean;
  aiSignalAlerts: boolean;
  paperTradeUpdates: boolean;
  minTransactionValue: number;
  autoTrackThreshold: number;
  discoveryLimitPairs: number;
  discoveryTxLimit: number;
};

const defaults: AppSettings = {
  displayName: "Whale User",
  theme: "Dark",
  whaleAlerts: true,
  aiSignalAlerts: true,
  paperTradeUpdates: false,
  minTransactionValue: 10000,
  autoTrackThreshold: 80,
  discoveryLimitPairs: 8,
  discoveryTxLimit: 20,
};

function numeric(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    try {
      setLoading(true);
      const response = await fetch("/api/paper-trades?kind=settings", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to load settings");
      setSettings({ ...defaults, ...json.data });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const response = await fetch("/api/paper-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveSettings", settings }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to save settings");
      setSettings({ ...defaults, ...json.data });
      setMessage("Settings tersimpan ke Supabase.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure WhaleCopy AI behavior and dashboard preferences" />

      {message && <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-4 text-sm text-accent-emerald">{message}</div>}
      {error && <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-4 text-sm text-accent-rose">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-whale-500/30 border-t-whale-500 rounded-full animate-spin" /></div>
      ) : (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">General</h3>
            <div className="space-y-4">
              <SettingRow label="Display Name" description="Name shown in local dashboard settings">
                <input type="text" value={settings.displayName} onChange={(e) => setSettings({ ...settings, displayName: e.target.value })} className="input-field w-64" />
              </SettingRow>
              <SettingRow label="Theme" description="Dashboard color theme preference">
                <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="input-field w-48">
                  <option>Dark</option>
                  <option>Midnight Blue</option>
                  <option>Deep Space</option>
                </select>
              </SettingRow>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <SettingRow label="Whale Alerts" description="Dashboard preference for large transaction alerts">
                <ToggleSwitch checked={settings.whaleAlerts} onChange={(value) => setSettings({ ...settings, whaleAlerts: value })} />
              </SettingRow>
              <SettingRow label="AI Signal Alerts" description="Dashboard preference for high-confidence signal alerts">
                <ToggleSwitch checked={settings.aiSignalAlerts} onChange={(value) => setSettings({ ...settings, aiSignalAlerts: value })} />
              </SettingRow>
              <SettingRow label="Paper Trade Updates" description="Dashboard preference for open position updates">
                <ToggleSwitch checked={settings.paperTradeUpdates} onChange={(value) => setSettings({ ...settings, paperTradeUpdates: value })} />
              </SettingRow>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tracking Preferences</h3>
            <div className="space-y-4">
              <SettingRow label="Min Transaction Value" description="Used as a dashboard preference for whale activity filtering">
                <input type="number" value={settings.minTransactionValue} onChange={(e) => setSettings({ ...settings, minTransactionValue: numeric(e.target.value) })} className="input-field w-48" />
              </SettingRow>
              <SettingRow label="Auto-Track Threshold" description="Preferred copy score/winrate threshold">
                <input type="number" value={settings.autoTrackThreshold} onChange={(e) => setSettings({ ...settings, autoTrackThreshold: numeric(e.target.value) })} className="input-field w-32" />
              </SettingRow>
              <SettingRow label="Discovery Pair Limit" description="Default number of active token pairs to scan manually">
                <input type="number" value={settings.discoveryLimitPairs} onChange={(e) => setSettings({ ...settings, discoveryLimitPairs: numeric(e.target.value) })} className="input-field w-32" />
              </SettingRow>
              <SettingRow label="Discovery TX Limit" description="Default number of transactions checked per pair">
                <input type="number" value={settings.discoveryTxLimit} onChange={(e) => setSettings({ ...settings, discoveryTxLimit: numeric(e.target.value) })} className="input-field w-32" />
              </SettingRow>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="lg" onClick={loadSettings} disabled={saving}>Reload</Button>
            <Button variant="primary" size="lg" onClick={saveSettings} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
          </div>
        </>
      )}
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-dark-700/30 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-dark-400 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-whale-500" : "bg-dark-600"}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
