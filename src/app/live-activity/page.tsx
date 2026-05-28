"use client";

import { PageHeader, ActivityFeed } from "@/components/ui";
import { activities as mockActivities } from "@/lib/mock-data";
import type { ActivityData } from "@/lib/mock-data";
import { useApi } from "@/lib/hooks/useApi";

export default function LiveActivityPage() {
  const { data: activities } = useApi<ActivityData[]>("/api/live-activities", mockActivities);
  const allActivities = activities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Whale Activity"
        description="Real-time wallet movement feed from connected data sources."
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/60 border border-dark-700/40 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-xs font-semibold text-accent-emerald">Live Feed</span>
          </div>
        }
      />

      <ActivityFeed activities={allActivities} />

      <div className="flex items-center gap-3 justify-center py-4">
        <div className="h-px flex-1 bg-dark-700/30" />
        <span className="text-xs text-dark-500 font-medium">End of feed — refreshes automatically</span>
        <div className="h-px flex-1 bg-dark-700/30" />
      </div>
    </div>
  );
}
