"use client";

import { useState, useEffect, useCallback } from "react";
import type { AIResultItem } from "@/types";
import { Badge, ConfidenceBadge } from "@/components/ui/Badge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type ViewState = "loading" | "empty" | "error" | "data";

export default function AIReviewPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [results, setResults] = useState<AIResultItem[]>([]);

  const fetchResults = useCallback(async () => {
    setView("loading");
    try {
      const res = await fetch("/api/review");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json.success) {
        const data = json.data as AIResultItem[];
        setResults(data);
        setView(data.length === 0 ? "empty" : "data");
      } else {
        setView("error");
      }
    } catch {
      setView("error");
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleConfirm = async (id: string, status: "confirmed" | "rejected" | "modified", content?: string) => {
    try {
      const res = await fetch(`/api/review/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, content }),
      });
      const json = await res.json();
      if (json.success) {
        setResults((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch {
      // silently fail for now
    }
  };

  if (view === "loading")
    return (
      <div className="p-lg">
        <h1 className="text-title text-primary mb-lg">AI 结果待确认</h1>
        <ListSkeleton />
      </div>
    );

  if (view === "error")
    return (
      <div className="p-lg">
        <ErrorState onRetry={fetchResults} />
      </div>
    );

  const pending = results.filter((r) => r.status === "pending");
  const confirmed = results.filter((r) => r.status !== "pending");

  return (
    <div className="p-lg space-y-lg">
      <h1 className="text-title text-primary">AI 结果待确认</h1>

      {results.length === 0 ? (
        <EmptyState
          icon="✅"
          title="没有待确认的结果"
          description="导入素材后，AI 分析结果将显示在这里供您审核确认"
          action={{ label: "去看看案件", href: "/cases" }}
        />
      ) : (
        <>
          <div className="flex gap-xs">
            <span className="px-md py-xs rounded-full bg-primary text-white text-caption font-medium">
              待确认 ({pending.length})
            </span>
            <span className="px-md py-xs rounded-full bg-secondary-light text-text-secondary text-caption font-medium">
              已确认 ({confirmed.length})
            </span>
          </div>

          <div className="space-y-md">
            {pending.map((item) => (
              <AIResultCard
                key={item.id}
                item={item}
                onConfirm={(id) => handleConfirm(id, "confirmed")}
                onReject={(id) => handleConfirm(id, "rejected")}
                onModify={(id, content) => handleConfirm(id, "modified", content)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AIResultCard({
  item,
  onConfirm,
  onReject,
  onModify,
}: {
  item: AIResultItem;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onModify: (id: string, content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);

  const typeLabels: Record<string, string> = {
    event: "时间事件",
    deadline: "期限提醒",
    evidence: "证据识别",
    summary: "案情摘要",
    risk: "风险提示",
    missing: "待补材料",
  };

  return (
    <div className="card border-l-2 border-ai">
      <div className="flex items-start justify-between mb-sm">
        <div className="flex items-center gap-sm">
          <Badge variant="ai">{typeLabels[item.type] ?? item.type}</Badge>
          <ConfidenceBadge level={item.confidence} />
        </div>
      </div>

      <h3 className="text-heading text-text-primary mb-sm">{item.title}</h3>

      {editing ? (
        <textarea
          className="input h-24 resize-none mb-sm"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
        />
      ) : (
        <p className="text-body text-text-secondary mb-md">{item.content}</p>
      )}

      {item.confidence === "low" && (
        <div className="bg-ai-low p-sm rounded-md mb-md text-caption text-warning">
          ⚠ AI 置信度较低，建议仔细核对原文
        </div>
      )}

      {item.status === "pending" && (
        <div className="flex items-center gap-sm">
          <button
            onClick={() => {
              if (editing) {
                onModify(item.id, editContent);
                setEditing(false);
              } else {
                onConfirm(item.id);
              }
            }}
            className="btn-primary text-caption py-xs px-md"
          >
            ✓ {editing ? "保存修改" : "确认"}
          </button>
          <button
            onClick={() => {
              if (!editing) {
                setEditing(true);
              } else {
                setEditing(false);
                setEditContent(item.content);
              }
            }}
            className="btn-secondary text-caption py-xs px-md"
          >
            ✎ {editing ? "取消修改" : "修改"}
          </button>
          <button onClick={() => onReject(item.id)} className="btn-danger text-caption py-xs px-md">
            ✕ 删除
          </button>
        </div>
      )}
      {item.status === "confirmed" && (
        <span className="text-caption text-success">✓ 已确认</span>
      )}
      {item.status === "rejected" && (
        <span className="text-caption text-error">✕ 已删除</span>
      )}
      {item.status === "modified" && (
        <span className="text-caption text-info">✎ 已修改</span>
      )}
    </div>
  );
}
