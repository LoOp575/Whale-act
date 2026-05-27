import { PageHeader, StatCard, Card } from "@/components/ui";
import { dashboardStats, liveActivities, aiSignals } from "@/data/dummy";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your whale tracking & AI signals"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total P&L (Paper)"
          value={dashboardStats.totalPnl}
          change={dashboardStats.totalPnlChange}
          changeType="positive"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Tracked Wallets"
          value={dashboardStats.trackedWallets}
          change={dashboardStats.trackedWalletsChange}
          changeType="positive"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
            </svg>
          }
        />
        <StatCard
          label="Active Signals"
          value={dashboardStats.activeSignals}
          change={dashboardStats.activeSignalsChange}
          changeType="positive"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        />
        <StatCard
          label="Win Rate"
          value={dashboardStats.winRate}
          change={dashboardStats.winRateChange}
          changeType="positive"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
      </div>

      {/* Charts placeholder + Recent signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
          <div className="h-64 flex items-center justify-center border border-dashed border-dark-600/50 rounded-lg">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-dark-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-dark-400 text-sm">Chart visualization</p>
              <p className="text-dark-500 text-xs mt-1">Connect chart library to display data</p>
            </div>
          </div>
        </Card>

        {/* Recent Signals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Latest AI Signals</h3>
          <div className="space-y-3">
            {aiSignals.slice(0, 4).map((signal) => (
              <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/40 border border-dark-700/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{signal.token}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      signal.type === "STRONG_BUY" ? "bg-accent-emerald/20 text-accent-emerald" :
                      signal.type === "BUY" ? "bg-accent-cyan/20 text-accent-cyan" :
                      signal.type === "SELL" ? "bg-accent-rose/20 text-accent-rose" :
                      "bg-dark-600/40 text-dark-300"
                    }`}>
                      {signal.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-1">{signal.timestamp}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{signal.confidence}%</p>
                  <p className="text-xs text-dark-400">confidence</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Whale Activity</h3>
          <a href="/live-activity" className="text-sm text-whale-400 hover:text-whale-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="space-y-2">
          {liveActivities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-dark-700/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.action === "BUY" ? "bg-accent-emerald/10 text-accent-emerald" :
                  activity.action === "SELL" ? "bg-accent-rose/10 text-accent-rose" :
                  "bg-accent-cyan/10 text-accent-cyan"
                }`}>
                  <span className="text-xs font-bold">{activity.action[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {activity.walletLabel}
                    <span className="text-dark-400 font-normal"> {activity.action.toLowerCase()} </span>
                    {activity.token}
                  </p>
                  <p className="text-xs text-dark-500">{activity.timestamp}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-dark-200">
                ${activity.valueUsd.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
