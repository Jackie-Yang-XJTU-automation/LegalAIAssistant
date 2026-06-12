import { clsx, type ClassValue } from "clsx";

// Simple classname merger (no external dependency needed for basic usage)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffHours < 48) return "昨天";
  if (diffHours < 168) return `${Math.floor(diffHours / 24)} 天前`;

  return formatDate(dateStr);
}

export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isSoon(dateStr: string, days: number = 7): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

export function caseTypeLabel(type: string): string {
  const map: Record<string, string> = {
    lending: "民间借贷",
    labor: "劳动争议",
    family: "婚姻家事",
    other: "其他",
  };
  return map[type] ?? type;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "进行中",
    closed: "已结案",
    archived: "已归档",
  };
  return map[status] ?? status;
}

export function riskLabel(risk: string): string {
  const map: Record<string, string> = {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
  };
  return map[risk] ?? risk;
}

export function riskColorClass(risk: string): string {
  const map: Record<string, string> = {
    low: "badge-success",
    medium: "badge-warning",
    high: "badge-error",
  };
  return map[risk] ?? "";
}
