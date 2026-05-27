import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-dark-700/60 text-dark-300 border-dark-600/50",
  success: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30",
  warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
  danger: "bg-accent-rose/10 text-accent-rose border-accent-rose/30",
  info: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  purple: "bg-accent-violet/10 text-accent-violet border-accent-violet/30",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
