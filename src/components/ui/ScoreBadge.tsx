interface ScoreBadgeProps {
  score: number;
  showBar?: boolean;
}

export function ScoreBadge({ score, showBar = true }: ScoreBadgeProps) {
  const color =
    score >= 80 ? "text-accent-emerald" :
    score >= 60 ? "text-accent-amber" :
    "text-accent-rose";
  const barColor =
    score >= 80 ? "bg-accent-emerald" :
    score >= 60 ? "bg-accent-amber" :
    "bg-accent-rose";

  return (
    <div className="flex items-center gap-2.5">
      {showBar && (
        <div className="w-14 h-2 bg-dark-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
      <span className={`text-xs font-semibold min-w-[24px] ${color}`}>
        {score}
      </span>
    </div>
  );
}
