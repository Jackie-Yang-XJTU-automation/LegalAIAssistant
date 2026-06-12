"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CaseSummary, DeadlineItem, AIResultItem } from "@/types";
import { formatDate, isOverdue, isToday } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type ViewState = "loading" | "empty" | "error" | "data";

interface DashboardData {
  todayMeetings: DeadlineItem[];
  todayDeadlines: DeadlineItem[];
  newAIResults: AIResultItem[];
  pendingConfirmations: AIResultItem[];
  recentCases: CaseSummary[];
}

export default function Dashboard() {
  const [view, setView] = useState<ViewState>("loading");
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchData = useCallback(async () => {
    setView("loading");
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        const d = json.data as DashboardData;
        const hasAny =
          d.todayMeetings.length > 0 ||
          d.todayDeadlines.length > 0 ||
          d.newAIResults.length > 0 ||
          d.recentCases.length > 0;
        setView(hasAny ? "data" : "empty");
      } else {
        setView("error");
      }
    } catch {
      setView("error");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (view === "loading") return <PageSkeleton />;
  if (view === "error") return <ErrorState onRetry={fetchData} />;

  const todayMeetings = data?.todayMeetings ?? [];
  const todayDeadlines = data?.todayDeadlines ?? [];
  const pendingResults = data?.pendingConfirmations ?? [];
  const recentCases = data?.recentCases ?? [];

  if (view === "empty") {
    return (
      <div className="p-lg">
        <h1 className="text-title text-primary mb-lg">今日概览</h1>
        <EmptyState
          icon="📊"
          title="欢迎使用律案助理"
          description="创建您的第一个案件，开始用 AI 管理案件进展"
          action={{ label: "创建案件", href: "/cases/new" }}
        />
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-title text-primary">今日概览</h1>
        <span className="text-caption text-text-hint">2026年6月12日 星期五</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <DashboardCard icon="📅" title="今日日程" count={todayMeetings.length} color="text-info">
          {todayMeetings.map((m) => (
            <DashboardCardItem key={m.id} label={m.title} date={m.date} type="meeting" />
          ))}
        </DashboardCard>

        <DashboardCard icon="⏰" title="即将到期" count={todayDeadlines.length} color="text-warning">
          {todayDeadlines.map((d) => (
            <DashboardCardItem key={d.id} label={d.title} date={d.date} type="deadline" />
          ))}
        </DashboardCard>

        <DashboardCard icon="🤖" title="AI 新识别" count={pendingResults.length} color="text-ai">
          {pendingResults.slice(0, 3).map((r) => (
            <Link key={r.id} href="/review" className="block text-caption text-text-secondary hover:text-primary mb-xs truncate no-underline">
              {r.title}
            </Link>
          ))}
        </DashboardCard>

        <DashboardCard icon="✅" title="待确认" count={pendingResults.length} color="text-success">
          {pendingResults.slice(0, 3).map((r) => (
            <Link key={r.id} href="/review" className="block text-caption text-text-secondary hover:text-primary mb-xs truncate no-underline">
              {r.title}
            </Link>
          ))}
        </DashboardCard>
      </div>

      <section>
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-subtitle text-text-primary">进行中案件</h2>
          <Link href="/cases" className="text-caption text-primary no-underline hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {recentCases.map((c) => (
            <DashboardCaseCard key={c.id} case_={c} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-subtitle text-text-primary mb-md">快捷操作</h2>
        <div className="flex gap-md">
          <Link href="/cases/new" className="btn-primary no-underline">
            + 新建案件
          </Link>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  count,
  color,
  children,
}: {
  icon: string;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-caption text-text-hint font-medium uppercase tracking-wide">{title}</h3>
        <span className={`text-title font-bold ${color}`}>{count}</span>
      </div>
      <div className="space-y-xs">
        {count === 0 ? (
          <p className="text-caption text-text-hint">暂无</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function DashboardCardItem({ label, date, type }: { label: string; date: string; type: string }) {
  return (
    <div className="flex items-center gap-sm">
      <span
        className={
          type === "meeting"
            ? "text-info"
            : isOverdue(date)
            ? "text-error"
            : isToday(date)
            ? "text-warning"
            : "text-text-hint"
        }
      >
        {type === "meeting" ? "●" : isOverdue(date) ? "⚠" : "●"}
      </span>
      <span className="text-caption text-text-secondary truncate">{label}</span>
      {date && <span className="text-caption text-text-hint ml-auto">{formatDate(date)}</span>}
    </div>
  );
}

function DashboardCaseCard({ case_ }: { case_: CaseSummary }) {
  return (
    <Link href={`/cases/${case_.id}`} className="card block no-underline hover:shadow-medium transition-shadow">
      <div className="flex items-center gap-sm mb-sm">
        <Badge variant={case_.status === "active" ? "success" : "default"}>
          {case_.status === "active" ? "进行中" : "已结案"}
        </Badge>
        <h3 className="text-heading text-text-primary">{case_.name}</h3>
      </div>
      <p className="text-body text-text-secondary line-clamp-1 mb-sm">{case_.summary}</p>
      <div className="flex items-center gap-md text-caption text-text-hint">
        {case_.taskCount > 0 && <span>📋 {case_.taskCount} 待办</span>}
        {case_.pendingDeadlineCount > 0 && <span className="text-warning">⚠ {case_.pendingDeadlineCount} 提醒</span>}
      </div>
    </Link>
  );
}
