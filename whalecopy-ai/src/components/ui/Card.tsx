import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  const base = hover ? "glass-card-hover" : "glass-card";
  return <div className={`${base} ${className}`}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
}

export function StatCard({ label, value, change, changeType = "neutral", icon }: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-accent-emerald"
      : changeType === "negative"
      ? "text-accent-rose"
      : "text-dark-400";

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-400">{label}</span>
        {icon && <div className="text-whale-400">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {change && <span className={`text-sm font-medium ${changeColor}`}>{change}</span>}
      </div>
    </div>
  );
}
