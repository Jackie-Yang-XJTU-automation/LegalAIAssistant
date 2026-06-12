import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "ai" | "success" | "warning" | "error" | "default";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  const base = "badge-status";
  const variants: Record<string, string> = {
    ai: "badge-ai",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    default: "bg-gray-100 text-text-secondary",
  };

  return (
    <span className={cn(base, variants[variant], className)}>
      {variant === "ai" && <span className="text-[10px] font-bold">AI</span>}
      {variant === "success" && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
      {variant === "warning" && <span className="w-1.5 h-1.5 rounded-full bg-warning" />}
      {variant === "error" && <span className="w-1.5 h-1.5 rounded-full bg-error" />}
      {children}
    </span>
  );
}

export function AIBadge() {
  return <span className="badge-ai">AI</span>;
}

export function ConfidenceBadge({ level }: { level: string }) {
  const map: Record<string, { label: string; className: string }> = {
    high: { label: "高", className: "badge-success" },
    medium: { label: "中", className: "badge-warning" },
    low: { label: "低", className: "badge-error" },
  };
  const info = map[level] ?? { label: level, className: "bg-gray-100 text-text-hint" };
  return <span className={cn("badge-status text-[10px] px-1.5 py-0", info.className)}>置信度{info.label}</span>;
}
