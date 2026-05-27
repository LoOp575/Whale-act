import type { ActivityData, ActivityAction } from "@/lib/mock-data";

const ACTION_CONFIG: Record<ActivityAction, { label: string; color: string; bg: string; border: string; icon: string }> = {
  bought: { label: "Bought", color: "text-accent-emerald", bg: "bg-accent-emerald/10", border: "border-accent-emerald/20", icon: "↑" },
  sold: { label: "Sold", color: "text-accent-rose", bg: "bg-accent-rose/10", border: "border-accent-rose/20", icon: "↓" },
  added: { label: "Added", color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/20", icon: "+" },
  warning: { label: "Warning", color: "text-accent-rose", bg: "bg-accent-rose/8", border: "border-accent-rose/25", icon: "!" },
};

export function formatValue(valueUsd: number): string {
  if (valueUsd >= 1000000) return `$${(valueUsd / 1000000).toFixed(1)}M`;
  if (valueUsd >= 1000) return `$${(valueUsd / 1000).toFixed(0)}K`;
  return `$${valueUsd.toLocaleString()}`;
}

interface ActivityFeedItemProps {
  activity: ActivityData;
  compact?: boolean;
}

export function ActivityFeedItem({ activity, compact = false }: ActivityFeedItemProps) {
  const config = ACTION_CONFIG[activity.action];

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-800/40 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}>
          <span className={`text-xs font-bold ${config.color}`}>{config.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">
            <span className="font-medium">{activity.walletLabel}</span>
            <span className="text-dark-500"> · </span>
            <span className="font-semibold">{activity.token}</span>
          </p>
          <p className="text-[11px] text-dark-500">{activity.timestamp}</p>
        </div>
        <span className="text-sm font-medium text-dark-200 flex-shrink-0">
          {formatValue(activity.valueUsd)}
        </span>
      </div>
    );
  }

  const isWarning = activity.action === "warning";

  return (
    <div className={`relative p-4 sm:p-5 rounded-xl border transition-all duration-200 hover:translate-x-1 ${
      isWarning
        ? "bg-accent-rose/[0.03] border-accent-rose/15 hover:border-accent-rose/30"
        : "bg-dark-800/40 border-dark-700/30 hover:border-dark-600/50 hover:bg-dark-800/60"
    }`}>
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${config.bg} ${config.border} border`} />
      <div className="flex items-start gap-4 pl-3">
        <div className={`w-9 h-9 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <span className={`text-sm font-bold ${config.color}`}>{config.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{activity.walletLabel}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${config.bg} ${config.color} border ${config.border}`}>
              {config.label}
            </span>
            <span className="text-sm font-bold text-white bg-dark-700/60 px-2 py-0.5 rounded-md border border-dark-600/30">
              {activity.token}
            </span>
          </div>
          <p className="text-sm text-dark-400 mt-1.5 leading-relaxed">{activity.description}</p>
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <span className="text-xs text-dark-300">
              <span className="text-dark-500">Amt:</span>{" "}
              <span className="font-medium text-white">{activity.amount} {activity.token}</span>
            </span>
            <span className="text-xs text-dark-300">
              <span className="text-dark-500">Value:</span>{" "}
              <span className="font-semibold text-white">{formatValue(activity.valueUsd)}</span>
            </span>
            <span className="text-[11px] text-dark-600 font-mono">tx: {activity.txHash}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right hidden sm:block">
          <p className="text-[11px] text-dark-500 font-medium">{activity.timestamp}</p>
        </div>
      </div>
      <div className="sm:hidden pl-3 mt-2">
        <p className="text-[11px] text-dark-500">{activity.timestamp}</p>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  activities: ActivityData[];
  compact?: boolean;
}

export function ActivityFeed({ activities, compact = false }: ActivityFeedProps) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {activities.map((activity) => (
        <ActivityFeedItem key={activity.id} activity={activity} compact={compact} />
      ))}
    </div>
  );
}
