import { PageHeader, StatCard, Card, Badge } from "@/components/ui";
import { getServerDb } from "@/lib/db/server";

export const dynamic = "force-dynamic";

type SignalRow = {
  id: string;
  signal_type: string | null;
  token_symbol: string | null;
  token_address: string | null;
  confidence: number | string | null;
  reason: string | null;
  suggested_action: string | null;
  created_at: string | null;
};

type ActivityRow = {
  id: string;
  wallet_address: string | null;
  token_symbol: string | null;
  token_address: string | null;
  action: string | null;
  amount_usd: number | string | null;
  description: string | null;
  created_at: string | null;
};

type WalletRow = {
  address: string;
  label: string | null;
  winrate_7d: number | string | null;
  realized_pnl_7d: number | string | null;
  copy_score: number | string | null;
  status: string | null;
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function short(value: string) {
  return value.length > 12 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;
}

function signalVariant(type: string): "success" | "info" | "warning" | "danger" | "default" {
  if (type === "STRONG_BUY" || type === "BUY") return "success";
  if (type === "WATCH") return "info";
  if (type === "SELL") return "danger";
  if (type === "SKIP") return "warning";
  return "default";
}

async function loadDashboard() {
  const db = getServerDb();
  if (!db) {
    return { dbReady: false, wallets: [] as WalletRow[], signals: [] as SignalRow[], activities: [] as ActivityRow[], error: "Supabase env belum lengkap." };
  }

  const [walletRes, signalRes, activityRes] = await Promise.all([
    db.from("wallets").select("address,label,winrate_7d,realized_pnl_7d,copy_score,status").order("copy_score", { ascending: false }).limit(20),
    db.from("signals").select("id,signal_type,token_symbol,token_address,confidence,reason,suggested_action,created_at").order("created_at", { ascending: false }).limit(8),
    db.from("live_activities").select("id,wallet_address,token_symbol,token_address,action,amount_usd,description,created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const firstError = walletRes.error || signalRes.error || activityRes.error;
  return {
    dbReady: true,
    wallets: ((walletRes.data || []) as WalletRow[]),
    signals: ((signalRes.data || []) as SignalRow[]),
    activities: ((activityRes.data || []) as ActivityRow[]),
    error: firstError?.message || null,
  };
}

export default async function DashboardPage() {
  const data = await loadDashboard();
  const totalPnl = data.wallets.reduce((sum, wallet) => sum + num(wallet.realized_pnl_7d), 0);
  const avgWinrate = data.wallets.length ? data.wallets.reduce((sum, wallet) => sum + num(wallet.winrate_7d), 0) / data.wallets.length : 0;
  const buySignals = data.signals.filter((signal) => ["STRONG_BUY", "BUY"].includes(signal.signal_type || "")).length;
  const qualifiedWallets = data.wallets.filter((wallet) => num(wallet.winrate_7d) >= 70 && num(wallet.realized_pnl_7d) > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Whale Profit AI"
        description="Real whale wallet scoring, live activity, and AI buy/skip decision engine"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 glass-card">
            <div className={`w-2 h-2 rounded-full ${data.dbReady ? "bg-accent-emerald" : "bg-accent-rose"}`} />
            <span className="text-xs font-medium text-dark-200">{data.dbReady ? "Real Data" : "Env Missing"}</span>
          </div>
        }
      />

      {data.error && (
        <Card className="p-4 border-accent-rose/30 bg-accent-rose/5">
          <p className="text-sm font-medium text-accent-rose">System warning</p>
          <p className="text-xs text-dark-300 mt-1">{data.error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="7D Whale P&L" value={money(totalPnl)} change="Supabase" changeType={totalPnl >= 0 ? "positive" : "negative"} />
        <StatCard label="Qualified Wallets" value={`${qualifiedWallets}/${data.wallets.length}`} change="min 70% winrate" changeType="positive" />
        <StatCard label="Buy Signals" value={`${buySignals}`} change={`${data.signals.length} latest`} changeType="positive" />
        <StatCard label="Avg Win Rate" value={`${avgWinrate.toFixed(1)}%`} change="tracked wallets" changeType={avgWinrate >= 70 ? "positive" : "neutral"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">AI Decision Queue</h3>
              <p className="text-xs text-dark-400 mt-1">Generated by /api/agent/run from profitable whale flow.</p>
            </div>
            <a href="/api/agent/run?dryRun=true" className="text-xs text-whale-400 hover:text-whale-300">Test agent →</a>
          </div>

          {data.signals.length === 0 ? (
            <div className="rounded-xl border border-dark-700/40 bg-dark-800/30 p-8 text-center">
              <p className="text-sm font-medium text-white">Belum ada signal real</p>
              <p className="text-xs text-dark-400 mt-1">Isi tabel wallets lalu jalankan /api/agent/run. Sistem tidak pakai dummy fallback.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.signals.map((signal) => {
                const type = signal.signal_type || "WATCH";
                return (
                  <div key={signal.id} className="rounded-xl border border-dark-700/40 bg-dark-800/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{signal.token_symbol || short(signal.token_address || "UNKNOWN")}</span>
                          <Badge variant={signalVariant(type)}>{type.replace("_", " ")}</Badge>
                          <span className="text-xs text-dark-400">{num(signal.confidence)}% confidence</span>
                        </div>
                        <p className="text-sm text-dark-300 mt-2 leading-relaxed">{signal.reason || "No reason saved."}</p>
                      </div>
                      <span className="text-xs text-dark-500 whitespace-nowrap">{signal.created_at ? new Date(signal.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "new"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Profit Wallets</h3>
          <div className="space-y-3">
            {data.wallets.slice(0, 6).map((wallet) => (
              <div key={wallet.address} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/40 border border-dark-700/30">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{wallet.label || short(wallet.address)}</p>
                  <p className="text-xs text-dark-500 font-mono">{short(wallet.address)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-accent-emerald">{num(wallet.winrate_7d).toFixed(1)}%</p>
                  <p className="text-xs text-dark-400">{money(num(wallet.realized_pnl_7d))}</p>
                </div>
              </div>
            ))}
            {data.wallets.length === 0 && <p className="text-sm text-dark-400">Belum ada wallet real di Supabase.</p>}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Whale Activity</h3>
          <a href="/live-activity" className="text-sm text-whale-400 hover:text-whale-300 transition-colors">View all →</a>
        </div>
        <div className="space-y-2">
          {data.activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-dark-700/30 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">
                  {short(activity.wallet_address || "unknown")}
                  <span className="text-dark-400 font-normal"> {(activity.action || "TRANSFER").toLowerCase()} </span>
                  {activity.token_symbol || short(activity.token_address || "UNKNOWN")}
                </p>
                <p className="text-xs text-dark-500">{activity.description || "Whale activity"}</p>
              </div>
              <span className="text-sm font-medium text-dark-200">${num(activity.amount_usd).toLocaleString()}</span>
            </div>
          ))}
          {data.activities.length === 0 && <p className="text-sm text-dark-400">Belum ada aktivitas. Jalankan agent atau Helius webhook.</p>}
        </div>
      </Card>
    </div>
  );
}
