interface RiskBadgeProps {
  risk: "Low" | "Medium" | "High";
}

const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
  Low: { color: "text-accent-emerald", bg: "bg-accent-emerald/10" },
  Medium: { color: "text-accent-amber", bg: "bg-accent-amber/10" },
  High: { color: "text-accent-rose", bg: "bg-accent-rose/10" },
};

export function RiskBadge({ risk }: RiskBadgeProps) {
  const config = RISK_CONFIG[risk];
  return (
    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
      {risk}
    </span>
  );
}
