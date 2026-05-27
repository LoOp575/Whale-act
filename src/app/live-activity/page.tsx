import { PageHeader, ActivityFeed } from "@/components/ui";
import { activities } from "@/lib/mock-data";

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

      <ActivityFeed activities={activities} />

      <div className="flex items-center gap-3 justify-center py-4">
        <div className="h-px flex-1 bg-dark-700/30" />
        <span className="text-xs text-dark-500 font-medium">End of feed — refreshes automatically</span>
        <div className="h-px flex-1 bg-dark-700/30" />
      </div>
    </div>
  );
}
