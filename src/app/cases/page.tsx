"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CaseSummary } from "@/types";
import { CaseCard } from "@/components/cases/CaseCard";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type ViewState = "loading" | "empty" | "error" | "data";

export default function CaseListPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const fetchCases = useCallback(async () => {
    setView("loading");
    try {
      const res = await fetch("/api/cases");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json.success) {
        const data = json.data as CaseSummary[];
        setCases(data);
        setView(data.length === 0 ? "empty" : "data");
      } else {
        setView("error");
      }
    } catch {
      setView("error");
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  if (view === "loading")
    return (
      <div className="p-lg">
        <h1 className="text-title text-primary mb-lg">案件列表</h1>
        <ListSkeleton />
      </div>
    );

  if (view === "error")
    return (
      <div className="p-lg">
        <ErrorState onRetry={fetchCases} />
      </div>
    );

  const filtered = filter === "all" ? cases : cases.filter((c) => c.status === filter);

  return (
    <div className="p-lg space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-title text-primary">案件列表</h1>
        <Link href="/cases/new" className="btn-primary no-underline text-body">
          + 新建案件
        </Link>
      </div>

      <div className="flex gap-xs flex-wrap">
        {[
          { key: "all", label: "全部" },
          { key: "active", label: "进行中" },
          { key: "closed", label: "已结案" },
          { key: "archived", label: "已归档" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-md py-xs rounded-full text-caption font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-secondary-light text-text-secondary hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📁"
          title={filter !== "all" ? "没有符合条件的案件" : "暂无案件"}
          description={filter !== "all" ? "当前筛选条件下没有案件" : "点击「新建案件」开始管理您的第一个案件"}
          action={filter === "all" ? { label: "新建案件", href: "/cases/new" } : undefined}
        />
      ) : (
        <div className="space-y-md">
          {filtered.map((case_) => (
            <CaseCard key={case_.id} case_={case_} />
          ))}
        </div>
      )}
    </div>
  );
}
