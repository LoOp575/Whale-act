import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-whale-600 to-whale-500 hover:from-whale-500 hover:to-whale-400 text-white shadow-lg shadow-whale-600/20",
  secondary:
    "bg-dark-700/60 hover:bg-dark-700 text-dark-200 border border-dark-600/50 hover:border-dark-500",
  ghost: "hover:bg-dark-700/50 text-dark-300 hover:text-white",
  danger:
    "bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose border border-accent-rose/30",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
