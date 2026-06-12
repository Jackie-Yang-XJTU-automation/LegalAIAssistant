"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CaseSummary } from "@/types";
import { CaseCard } from "@/components/cases/CaseCard";
import { Modal } from "@/components/ui/Modal";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type ViewState = "loading" | "empty" | "error" | "data";

export default function CaseListPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CaseSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCases = useCallback(async () => {
    setView("loading");
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/cases?${params.toString()}`);
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
  }, [filter, search]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/cases/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchCases();
    } catch { /* ignore */ }
    setDeleting(false);
  };

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

  return (
    <div className="p-lg space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-title text-primary">案件列表</h1>
        <Link href="/cases/new" className="btn-primary no-underline text-body">
          + 新建案件
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-md">
        <div className="flex-1 relative">
          <input
            type="text"
            className="input pl-9"
            placeholder="搜索案件名称、客户名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint">🔍</span>
        </div>
        <div className="flex gap-xs">
          {[
            { key: "all", label: "全部" },
            { key: "active", label: "进行中" },
            { key: "closed", label: "已结案" },
            { key: "archived", label: "已归档" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-md py-xs rounded-full text-caption font-medium transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-secondary-light text-text-secondary hover:text-text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Case list */}
      {cases.length === 0 ? (
        <EmptyState
          icon="📁"
          title={filter !== "all" || search ? "没有符合条件的案件" : "暂无案件"}
          description={filter !== "all" || search ? "当前筛选或搜索条件下没有案件" : "点击「新建案件」开始管理您的第一个案件"}
          action={!search && filter === "all" ? { label: "新建案件", href: "/cases/new" } : { label: "清除筛选", onClick: () => { setFilter("all"); setSearch(""); } }}
        />
      ) : (
        <div className="space-y-md">
          {cases.map((case_) => (
            <div key={case_.id} className="relative group">
              <CaseCard case_={case_} />
              <button
                onClick={(e) => { e.preventDefault(); setDeleteTarget(case_); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-caption text-text-hint hover:text-error p-1"
                title="删除案件"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="确认删除案件"
        actions={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary text-caption py-xs px-md">取消</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger text-caption py-xs px-md">
              {deleting ? "删除中..." : "确认删除"}
            </button>
          </>
        }
      >
        <p className="text-body text-text-secondary">
          案件「{deleteTarget?.name}」及其所有相关数据将被永久删除。此操作不可撤销。
        </p>
      </Modal>
    </div>
  );
}
