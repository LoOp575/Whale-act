import type { WalletTag } from "@/lib/mock-data";

interface StatusBadgeProps {
  tag: WalletTag;
}

const TAG_CONFIG: Record<WalletTag, { label: string; color: string; bg: string; border: string }> = {
  watchlist: { label: "Watchlist", color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/30" },
  testing: { label: "Testing", color: "text-accent-violet", bg: "bg-accent-violet/10", border: "border-accent-violet/30" },
  good: { label: "Good", color: "text-accent-emerald", bg: "bg-accent-emerald/10", border: "border-accent-emerald/30" },
  rejected: { label: "Rejected", color: "text-accent-rose", bg: "bg-accent-rose/10", border: "border-accent-rose/30" },
  neutral: { label: "Neutral", color: "text-dark-300", bg: "bg-dark-700/60", border: "border-dark-600/50" },
};

export function StatusBadge({ tag }: StatusBadgeProps) {
  const config = TAG_CONFIG[tag];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${config.bg} ${config.color} ${config.border}`}>
      {config.label}
    </span>
  );
}
