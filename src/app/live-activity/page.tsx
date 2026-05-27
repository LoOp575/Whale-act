import { PageHeader } from "@/components/ui";
import { activities } from "@/lib/mock-data";
import type { ActivityAction } from "@/lib/mock-data";

const ACTION_CONFIG: Record<ActivityAction, { label: string; color: string; bg: string; border: string; icon: string }> = {
  bought: {
    label: "Bought",
    color: "text-accent-emerald",
    bg: "bg-accent-emerald/10",
    border: "border-accent-emerald/20",
    icon: "↑",
  },
  sold: {
    label: "Sold",
    color: "text-accent-rose",
    bg: "bg-accent-rose/10",
    border: "border-accent-rose/20",
    icon: "↓",
  },
  added: {
    label: "Added",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    border: "border-accent-cyan/20",
    icon: "+",
  },
  warning: {
    label: "Warning",
    color: "text-accent-rose",
    bg: "bg-accent-rose/8",
    border: "border-accent-rose/25",
    icon: "!",
  },
};

function formatValue(valueUsd: number): string {
  if (valueUsd >= 1000000) return `$${(valueUsd / 1000000).toFixed(2)}M`;
  if (valueUsd >= 1000) return `$${(valueUsd / 1000).toFixed(0)}K`;
  return `$${valueUsd.toLocaleString()}`;
}

export default function LiveActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Whale Activity"
        description="Real-time simulated wallet movement feed."
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/60 border border-dark-700/40 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-xs font-semibold text-accent-emerald">Live Feed</span>
          </div>
        }
      />

      {/* Terminal-style feed */}
      <div className="space-y-3">
        {activities.map((activity) => {
          const config = ACTION_CONFIG[activity.action];
          const isWarning = activity.action === "warning";

          return (
            <div
              key={activity.id}
              className={`
                relative p-4 sm:p-5 rounded-xl border transition-all duration-200
                hover:translate-x-1
                ${isWarning
                  ? "bg-accent-rose/[0.03] border-accent-rose/15 hover:border-accent-rose/30"
                  : "bg-dark-800/40 border-dark-700/30 hover:border-dark-600/50 hover:bg-dark-800/60"
                }
              `}
            >
              {/* Left accent line */}
              <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${config.bg} ${config.border} border`} />

              <div className="flex items-start gap-4 pl-3">
                {/* Action icon */}
                <div className={`w-9 h-9 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-sm font-bold ${config.color}`}>
                    {config.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Top row: wallet + action + token */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{activity.walletLabel}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${config.bg} ${config.color} border ${config.border}`}>
                      {config.label}
                    </span>
                    <span className="text-sm font-bold text-white bg-dark-700/60 px-2 py-0.5 rounded-md border border-dark-600/30">
                      {activity.token}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-dark-400 mt-1.5 leading-relaxed">
                    {activity.description}
                  </p>

                  {/* Bottom row: amount + timestamp + tx */}
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    <span className="text-xs text-dark-300">
                      <span className="text-dark-500">Amt:</span>{" "}
                      <span className="font-medium text-white">{activity.amount} {activity.token}</span>
                    </span>
                    <span className="text-xs text-dark-300">
                      <span className="text-dark-500">Value:</span>{" "}
                      <span className="font-semibold text-white">{formatValue(activity.valueUsd)}</span>
                    </span>
                    <span className="text-[11px] text-dark-600 font-mono">
                      tx: {activity.txHash}
                    </span>
                  </div>
                </div>

                {/* Right: timestamp */}
                <div className="flex-shrink-0 text-right hidden sm:block">
                  <p className="text-[11px] text-dark-500 font-medium">{activity.timestamp}</p>
                </div>
              </div>

              {/* Mobile timestamp */}
              <div className="sm:hidden pl-3 mt-2">
                <p className="text-[11px] text-dark-500">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* End marker */}
      <div className="flex items-center gap-3 justify-center py-4">
        <div className="h-px flex-1 bg-dark-700/30" />
        <span className="text-xs text-dark-500 font-medium">End of feed — refreshes automatically</span>
        <div className="h-px flex-1 bg-dark-700/30" />
      </div>
    </div>
  );
}
