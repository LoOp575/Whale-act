import { PageHeader, Badge, Card } from "@/components/ui";
import { liveActivities } from "@/data/dummy";

export default function LiveActivityPage() {
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

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 text-sm font-medium text-white bg-whale-600/20 border border-whale-500/30 rounded-lg">
          All
        </button>
        <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          Buys
        </button>
        <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          Sells
        </button>
        <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          Swaps
        </button>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        {liveActivities.map((activity) => (
          <Card key={activity.id} hover className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Action Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  activity.action === "BUY"
                    ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
                    : activity.action === "SELL"
                    ? "bg-accent-rose/10 text-accent-rose border border-accent-rose/20"
                    : "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                }`}>
                  {activity.action === "BUY" ? "↑" : activity.action === "SELL" ? "↓" : "⇄"}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{activity.walletLabel}</span>
                    <Badge variant={
                      activity.action === "BUY" ? "success" :
                      activity.action === "SELL" ? "danger" : "info"
                    }>
                      {activity.action}
                    </Badge>
                  </div>
                  <p className="text-sm text-dark-400 mt-1">
                    {activity.amount.toLocaleString()} <span className="text-white font-medium">{activity.token}</span>
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="text-right">
                <p className="text-lg font-semibold text-white">
                  ${activity.valueUsd.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span className="text-xs text-dark-500">{activity.timestamp}</span>
                  <span className="text-xs text-dark-600 font-mono">{activity.txHash}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
