"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CaseDetail, EventItem, TaskItem, EvidenceItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { TabBar } from "@/components/ui/TabBar";
import { Timeline } from "@/components/cases/Timeline";
import { TaskList } from "@/components/cases/TaskList";
import { EvidenceList } from "@/components/cases/EvidenceList";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { statusLabel, riskLabel, caseTypeLabel, formatDate } from "@/lib/utils";

type ViewState = "loading" | "error" | "data";

const TABS = [
  { key: "overview", label: "概览" },
  { key: "timeline", label: "时间线" },
  { key: "tasks", label: "待办" },
  { key: "evidence", label: "证据" },
  { key: "communication", label: "沟通记录" },
  { key: "ai", label: "AI 建议" },
];

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [view, setView] = useState<ViewState>("loading");
  const [case_, setCase] = useState<CaseDetail | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchCase = useCallback(async () => {
    setView("loading");
    try {
      const res = await fetch(`/api/cases/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json.success) {
        setCase(json.data);
        setView("data");
      } else {
        setView("error");
      }
    } catch {
      setView("error");
    }
  }, [params.id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  if (view === "loading") return <DetailSkeleton />;
  if (view === "error") return (
    <div className="p-lg">
      <ErrorState onRetry={fetchCase} />
    </div>
  );
  if (!case_) return null;

  // Update tab counts dynamically
  const tabs = TABS.map((t) => {
    if (t.key === "tasks") return { ...t, count: case_.tasks?.filter((tk: TaskItem) => tk.status !== "completed").length ?? 0 };
    return t;
  });

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] px-lg py-lg">
        <button onClick={() => router.push("/cases")} className="btn-ghost mb-md">
          ← 案件列表
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
          <div>
            <div className="flex items-center gap-sm mb-xs flex-wrap">
              <Badge variant={case_.status === "active" ? "success" : "default"}>
                {statusLabel(case_.status)}
              </Badge>
              <Badge variant={case_.riskLevel === "high" ? "error" : case_.riskLevel === "medium" ? "warning" : "success"}>
                {riskLabel(case_.riskLevel)}
              </Badge>
              <span className="badge-ai">AI</span>
            </div>
            <h1 className="text-title text-primary">{case_.name}</h1>
            <div className="flex flex-wrap gap-md mt-sm text-caption text-text-hint">
              <span>客户：{case_.clientName}</span>
              <span>类型：{caseTypeLabel(case_.caseType)}</span>
              {case_.stage && <span>阶段：{case_.stage}</span>}
              <span>更新：{formatDate(case_.updatedAt)}</span>
            </div>
          </div>

          <div className="flex gap-sm">
            <Link href={`/cases/${case_.id}/import`} className="btn-primary no-underline">
              + 导入素材
            </Link>
            <button className="btn-secondary">编辑</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="p-lg">
        {activeTab === "overview" && <OverviewTab case_={case_} />}
        {activeTab === "timeline" && <Timeline events={case_.events ?? []} />}
        {activeTab === "tasks" && <TaskList tasks={case_.tasks ?? []} />}
        {activeTab === "evidence" && <EvidenceList evidences={case_.evidences ?? []} />}
        {activeTab === "communication" && <CommunicationTab />}
        {activeTab === "ai" && <AITab case_={case_} />}
      </div>
    </div>
  );
}

function OverviewTab({ case_ }: { case_: CaseDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
      <div className="lg:col-span-2 space-y-lg">
        <div className="card">
          <h3 className="text-heading text-text-primary mb-sm">案件摘要</h3>
          <p className="text-body text-text-secondary">{case_.summary}</p>
        </div>

        <div className="card">
          <h3 className="text-heading text-text-primary mb-md">最新进展</h3>
          <Timeline events={(case_.events ?? []).slice(-3)} />
        </div>

        <div className="card">
          <h3 className="text-heading text-text-primary mb-md">待办事项</h3>
          <TaskList tasks={(case_.tasks ?? []).filter((t) => t.status !== "completed").slice(0, 3)} />
        </div>
      </div>

      <div className="space-y-lg">
        <div className="card">
          <h3 className="text-heading text-text-primary mb-md">当事人</h3>
          <div className="space-y-md">
            {(case_.parties ?? []).map((p) => (
              <div key={p.id} className="flex items-center gap-sm">
                <span className="text-lg">👤</span>
                <div>
                  <p className="text-body font-medium text-text-primary">{p.name}</p>
                  <p className="text-caption text-text-hint">
                    {p.role === "plaintiff" ? "原告" : p.role === "defendant" ? "被告" : p.role}
                    {p.phone ? ` · ${p.phone}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-heading text-text-primary mb-md">关键期限</h3>
          {(case_.deadlines ?? []).length === 0 ? (
            <p className="text-caption text-text-hint">暂无</p>
          ) : (
            <div className="space-y-sm">
              {(case_.deadlines ?? []).map((d) => (
                <div key={d.id} className="flex items-center gap-sm">
                  <span className="text-warning">⚠</span>
                  <div className="min-w-0">
                    <p className="text-caption text-text-primary truncate">{d.title}</p>
                    <p className="text-caption text-text-hint">{d.date}</p>
                  </div>
                  {!d.isConfirmed && <span className="badge-ai ml-auto text-[10px]">待确认</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-heading text-text-primary mb-md">证据概况</h3>
          <div className="space-y-sm">
            <div className="flex justify-between">
              <span className="text-body text-text-secondary">已确认证据</span>
              <span className="text-number text-success">
                {(case_.evidences ?? []).filter((e) => e.isConfirmed).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body text-text-secondary">待确认证据</span>
              <span className="text-number text-warning">
                {(case_.evidences ?? []).filter((e) => !e.isConfirmed).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunicationTab() {
  return (
    <div className="text-center py-xl text-text-hint text-body">
      沟通记录将在后续版本中实现
    </div>
  );
}

function AITab({ case_ }: { case_: CaseDetail }) {
  return (
    <div className="space-y-lg">
      <div className="card">
        <h3 className="text-heading text-text-primary mb-sm flex items-center gap-sm">
          <span className="badge-ai">AI</span>
          案件类型判断
        </h3>
        <p className="text-body text-text-secondary">
          根据案情描述，AI 判断本案为 <strong>{caseTypeLabel(case_.caseType)}</strong>，置信度：高
        </p>
      </div>

      <div className="card">
        <h3 className="text-heading text-text-primary mb-md flex items-center gap-sm">
          <span className="badge-ai">AI</span>
          待核实问题
        </h3>
        <ul className="space-y-sm">
          {case_.caseType === "lending" && (
            <>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">是否约定利息？利率多少？</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">被告住所地信息缺失，影响管辖确定</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">缺少完整还款记录</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">诉讼时效计算需确认最后一次催款时间</span>
              </li>
            </>
          )}
          {case_.caseType === "labor" && (
            <>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">未签书面劳动合同，需确认入职时间</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">是否在仲裁时效内？</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">缺少劳动合同、社保记录、考勤记录</span>
              </li>
            </>
          )}
          {case_.caseType === "family" && (
            <>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">共同财产范围待确认</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">子女抚养方案需协商</span>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="card">
        <h3 className="text-heading text-text-primary mb-md flex items-center gap-sm">
          <span className="badge-ai">AI</span>
          风险提示
        </h3>
        <ul className="space-y-sm">
          {case_.caseType === "lending" && (
            <>
              <li className="flex items-start gap-sm">
                <span className="text-error mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">证据链不完整：缺少完整银行流水</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">主体信息缺失：被告身份信息不全</span>
              </li>
            </>
          )}
          {case_.caseType === "labor" && (
            <>
              <li className="flex items-start gap-sm">
                <span className="text-error mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">仲裁时效即将届满</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-body text-text-secondary">未签订劳动合同，需补强证据</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
