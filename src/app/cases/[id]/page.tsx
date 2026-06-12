"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CaseDetail, EventItem, TaskItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { TabBar } from "@/components/ui/TabBar";
import { Timeline } from "@/components/cases/Timeline";
import { TaskList } from "@/components/cases/TaskList";
import { EvidenceList } from "@/components/cases/EvidenceList";
import { Modal } from "@/components/ui/Modal";
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

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", clientName: "", caseType: "", summary: "", stage: "", riskLevel: "", status: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Add task/event modal
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);

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

  const openEdit = () => {
    if (!case_) return;
    setEditForm({
      name: case_.name,
      clientName: case_.clientName,
      caseType: case_.caseType,
      summary: case_.summary,
      stage: case_.stage || "",
      riskLevel: case_.riskLevel,
      status: case_.status,
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditOpen(false);
        fetchCase();
      }
    } catch { /* ignore */ }
    setEditSubmitting(false);
  };

  const handleDelete = async () => {
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/cases");
      }
    } catch { /* ignore */ }
    setDeleteSubmitting(false);
  };

  const handleArchive = async () => {
    try {
      await fetch(`/api/cases/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      fetchCase();
    } catch { /* ignore */ }
  };

  const handleTaskToggle = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/cases/${params.id}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchCase();
    } catch { /* ignore */ }
  };

  if (view === "loading") return <DetailSkeleton />;
  if (view === "error") return (
    <div className="p-lg">
      <ErrorState onRetry={fetchCase} />
    </div>
  );
  if (!case_) return null;

  const tabs = TABS.map((t) => {
    if (t.key === "tasks")
      return { ...t, count: case_.tasks?.filter((tk: TaskItem) => tk.status !== "completed").length ?? 0 };
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
              <Badge variant={case_.status === "active" ? "success" : case_.status === "archived" ? "default" : "default"}>
                {statusLabel(case_.status)}
              </Badge>
              <Badge variant={case_.riskLevel === "high" ? "error" : case_.riskLevel === "medium" ? "warning" : "success"}>
                {riskLabel(case_.riskLevel)}
              </Badge>
              {(case_.tasks ?? []).some(t => t.isAIGenerated) && <span className="badge-ai">AI</span>}
            </div>
            <h1 className="text-title text-primary">{case_.name}</h1>
            <div className="flex flex-wrap gap-md mt-sm text-caption text-text-hint">
              <span>客户：{case_.clientName}</span>
              <span>类型：{caseTypeLabel(case_.caseType)}</span>
              {case_.stage && <span>阶段：{case_.stage}</span>}
              <span>更新：{formatDate(case_.updatedAt)}</span>
            </div>
          </div>
          <div className="flex gap-sm flex-wrap">
            <Link href={`/cases/${case_.id}/import`} className="btn-primary no-underline text-caption py-xs px-md">
              + 导入素材
            </Link>
            <button onClick={openEdit} className="btn-secondary text-caption py-xs px-md">编辑</button>
            <button onClick={handleArchive} className="btn-ghost text-caption py-xs px-md" title="归档">
              {case_.status === "archived" ? "取消归档" : "归档"}
            </button>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger text-caption py-xs px-md">删除</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="p-lg">
        {activeTab === "overview" && <OverviewTab case_={case_} onAddTask={() => setAddTaskOpen(true)} />}
        {activeTab === "timeline" && (
          <div className="space-y-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-subtitle text-text-primary">案件时间线</h2>
              <button onClick={() => setAddEventOpen(true)} className="btn-secondary text-caption py-xs px-md">+ 添加事件</button>
            </div>
            <Timeline events={case_.events ?? []} />
          </div>
        )}
        {activeTab === "tasks" && (
          <div className="space-y-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-subtitle text-text-primary">待办清单</h2>
              <button onClick={() => setAddTaskOpen(true)} className="btn-secondary text-caption py-xs px-md">+ 添加待办</button>
            </div>
            <TaskList tasks={case_.tasks ?? []} onToggle={handleTaskToggle} />
          </div>
        )}
        {activeTab === "evidence" && <EvidenceList evidences={case_.evidences ?? []} />}
        {activeTab === "communication" && <CommunicationTab caseId={case_.id} />}
        {activeTab === "ai" && <AITab case_={case_} />}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="编辑案件信息"
        actions={
          <>
            <button onClick={() => setEditOpen(false)} className="btn-secondary text-caption py-xs px-md">取消</button>
            <button onClick={handleEdit} disabled={editSubmitting} className="btn-primary text-caption py-xs px-md">
              {editSubmitting ? "保存中..." : "保存"}
            </button>
          </>
        }
      >
        <div className="space-y-md">
          <div>
            <label className="label">案件名称</label>
            <input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">客户姓名</label>
            <input className="input" value={editForm.clientName} onChange={e => setEditForm(p => ({ ...p, clientName: e.target.value }))} />
          </div>
          <div>
            <label className="label">案件类型</label>
            <select className="input" value={editForm.caseType} onChange={e => setEditForm(p => ({ ...p, caseType: e.target.value }))}>
              <option value="lending">民间借贷</option>
              <option value="labor">劳动争议</option>
              <option value="family">婚姻家事</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label className="label">当前阶段</label>
            <input className="input" value={editForm.stage} onChange={e => setEditForm(p => ({ ...p, stage: e.target.value }))} placeholder="如：准备起诉、调解中" />
          </div>
          <div>
            <label className="label">风险等级</label>
            <select className="input" value={editForm.riskLevel} onChange={e => setEditForm(p => ({ ...p, riskLevel: e.target.value }))}>
              <option value="low">低风险</option>
              <option value="medium">中风险</option>
              <option value="high">高风险</option>
            </select>
          </div>
          <div>
            <label className="label">案情描述</label>
            <textarea className="input h-20 resize-none" value={editForm.summary} onChange={e => setEditForm(p => ({ ...p, summary: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="确认删除案件"
        actions={
          <>
            <button onClick={() => setDeleteOpen(false)} className="btn-secondary text-caption py-xs px-md">取消</button>
            <button onClick={handleDelete} disabled={deleteSubmitting} className="btn-danger text-caption py-xs px-md">
              {deleteSubmitting ? "删除中..." : "确认删除"}
            </button>
          </>
        }
      >
        <p className="text-body text-text-secondary">
          案件「{case_.name}」及其所有相关数据（事件、待办、证据、素材）将被永久删除。此操作不可撤销。
        </p>
      </Modal>

      {/* Add Task Modal */}
      <AddTaskModal open={addTaskOpen} onClose={() => setAddTaskOpen(false)} caseId={case_.id} onCreated={fetchCase} />

      {/* Add Event Modal */}
      <AddEventModal open={addEventOpen} onClose={() => setAddEventOpen(false)} caseId={case_.id} onCreated={fetchCase} />
    </div>
  );
}

function OverviewTab({ case_, onAddTask }: { case_: CaseDetail; onAddTask: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
      <div className="lg:col-span-2 space-y-lg">
        <div className="card">
          <h3 className="text-heading text-text-primary mb-sm">案件摘要</h3>
          <p className="text-body text-text-secondary">{case_.summary}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-heading text-text-primary">最新进展</h3>
          </div>
          <Timeline events={(case_.events ?? []).slice(-4)} />
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-heading text-text-primary">待办事项</h3>
            <button onClick={onAddTask} className="text-caption text-primary font-medium">+ 添加</button>
          </div>
          {((case_.tasks ?? []).filter(t => t.status !== "completed").length === 0) ? (
            <p className="text-caption text-text-hint text-center py-lg">暂无待办</p>
          ) : (
            <div className="space-y-sm">
              {(case_.tasks ?? []).filter(t => t.status !== "completed").slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center gap-sm py-xs">
                  <span className={t.priority === "high" ? "text-error" : t.priority === "medium" ? "text-warning" : "text-text-hint"}>●</span>
                  <span className="text-body text-text-primary flex-1 truncate">{t.title}</span>
                  {t.dueDate && <span className="text-caption text-text-hint">{t.dueDate}</span>}
                </div>
              ))}
            </div>
          )}
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
              <span className="text-number text-success">{(case_.evidences ?? []).filter((e) => e.isConfirmed).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body text-text-secondary">待确认证据</span>
              <span className="text-number text-warning">{(case_.evidences ?? []).filter((e) => !e.isConfirmed).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunicationTab({ caseId }: { caseId: string }) {
  const [sources, setSources] = useState<Array<{ id: string; type: string; title: string; content: string; status: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cases/${caseId}`);
        const json = await res.json();
        if (json.success && json.data.sources) {
          setSources(json.data.sources);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [caseId]);

  if (loading) return <div className="text-center py-xl text-text-hint">加载中...</div>;

  if (sources.length === 0) {
    return (
      <div className="text-center py-2xl">
        <span className="text-4xl">💬</span>
        <p className="text-body text-text-secondary mt-md mb-sm">暂无沟通记录</p>
        <p className="text-caption text-text-hint mb-lg">导入聊天记录、电话记录等素材后，将在此显示</p>
        <Link href={`/cases/${caseId}/import`} className="btn-primary no-underline">+ 导入素材</Link>
      </div>
    );
  }

  return (
    <div className="space-y-md max-w-2xl">
      {sources.map((s) => (
        <div key={s.id} className="card">
          <div className="flex items-center gap-sm mb-sm">
            <span className="text-lg">{s.type === "text" ? "📝" : s.type === "image" ? "📸" : s.type === "pdf" ? "📄" : "🎙"}</span>
            <h3 className="text-heading text-text-primary">{s.title}</h3>
            <Badge variant={s.status === "completed" ? "success" : s.status === "processing" ? "warning" : "default"}>
              {s.status === "completed" ? "已分析" : s.status === "processing" ? "分析中" : "待分析"}
            </Badge>
          </div>
          <p className="text-body text-text-secondary whitespace-pre-wrap">{s.content?.substring(0, 300)}{(s.content?.length ?? 0) > 300 ? "..." : ""}</p>
          <p className="text-caption text-text-hint mt-sm">{new Date(s.createdAt).toLocaleString("zh-CN")}</p>
        </div>
      ))}
    </div>
  );
}

function AITab({ case_ }: { case_: CaseDetail }) {
  return (
    <div className="space-y-lg">
      <div className="card">
        <h3 className="text-heading text-text-primary mb-sm flex items-center gap-sm">
          <span className="badge-ai">AI</span>案件类型判断
        </h3>
        <p className="text-body text-text-secondary">
          根据案情描述，AI 判断本案为 <strong>{caseTypeLabel(case_.caseType)}</strong>，置信度：高
        </p>
      </div>
      <div className="card">
        <h3 className="text-heading text-text-primary mb-md flex items-center gap-sm">
          <span className="badge-ai">AI</span>待核实问题
        </h3>
        <ul className="space-y-sm">
          {case_.caseType === "lending" && (
            <>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">是否约定利息？利率多少？</span></li>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">被告住所地信息缺失，影响管辖确定</span></li>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">缺少完整还款记录</span></li>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">诉讼时效计算需确认最后一次催款时间</span></li>
            </>
          )}
          {case_.caseType === "labor" && (
            <>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">未签书面劳动合同，需确认入职时间</span></li>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">是否在仲裁时效内？</span></li>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">缺少劳动合同、社保记录、考勤记录</span></li>
            </>
          )}
          {case_.caseType === "family" && (
            <>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">共同财产范围待确认</span></li>
              <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">子女抚养方案需协商</span></li>
            </>
          )}
        </ul>
      </div>
      <div className="card">
        <h3 className="text-heading text-text-primary mb-md flex items-center gap-sm">
          <span className="badge-ai">AI</span>建议下一步
        </h3>
        <ol className="list-decimal list-inside space-y-sm text-body text-text-secondary">
          {case_.caseType === "lending" && (<>
            <li>补齐被告身份信息（身份证号、住址）</li>
            <li>整理所有转账记录和凭证</li>
            <li>生成事实时间线草稿</li>
            <li>起草民事起诉状</li>
            <li>确认诉讼时效是否中断</li>
          </>)}
          {case_.caseType === "labor" && (<>
            <li>确认劳动关系证明材料</li>
            <li>计算经济补偿金金额</li>
            <li>整理工资流水和考勤记录</li>
            <li>起草仲裁申请书</li>
          </>)}
          {case_.caseType === "family" && (<>
            <li>整理夫妻共同财产清单</li>
            <li>准备子女抚养方案</li>
            <li>收集感情破裂相关证据</li>
          </>)}
        </ol>
      </div>
      <div className="card">
        <h3 className="text-heading text-text-primary mb-md flex items-center gap-sm">
          <span className="badge-ai">AI</span>风险提示
        </h3>
        <ul className="space-y-sm">
          {case_.caseType === "lending" && (<>
            <li className="flex items-start gap-sm"><span className="text-error mt-0.5">⚠</span><span className="text-body text-text-secondary">证据链不完整：缺少完整银行流水</span></li>
            <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">主体信息缺失：被告身份信息不全</span></li>
          </>)}
          {case_.caseType === "labor" && (<>
            <li className="flex items-start gap-sm"><span className="text-error mt-0.5">⚠</span><span className="text-body text-text-secondary">仲裁时效即将届满</span></li>
            <li className="flex items-start gap-sm"><span className="text-warning mt-0.5">⚠</span><span className="text-body text-text-secondary">未签订劳动合同，需补强证据</span></li>
          </>)}
        </ul>
      </div>
    </div>
  );
}

function AddTaskModal({ open, onClose, caseId, onCreated }: { open: boolean; onClose: () => void; caseId: string; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "medium" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onCreated();
      onClose();
      setForm({ title: "", description: "", dueDate: "", priority: "medium" });
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="添加待办"
      actions={<>
        <button onClick={onClose} className="btn-secondary text-caption py-xs px-md">取消</button>
        <button onClick={handleSubmit} disabled={submitting || !form.title.trim()} className="btn-primary text-caption py-xs px-md">
          {submitting ? "创建中..." : "添加"}
        </button>
      </>}
    >
      <div className="space-y-md">
        <div><label className="label">待办标题 *</label><input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="如：补充被告身份信息" /></div>
        <div><label className="label">详细说明</label><textarea className="input h-16 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
        <div><label className="label">截止日期</label><input className="input" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
        <div><label className="label">优先级</label><select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
          <option value="high">高优先</option><option value="medium">中优先</option><option value="low">低优先</option>
        </select></div>
      </div>
    </Modal>
  );
}

function AddEventModal({ open, onClose, caseId, onCreated }: { open: boolean; onClose: () => void; caseId: string; onCreated: () => void }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], description: "", amount: "", persons: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/cases/${caseId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onCreated();
      onClose();
      setForm({ date: new Date().toISOString().split("T")[0], description: "", amount: "", persons: "", tags: "" });
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="添加时间线事件"
      actions={<>
        <button onClick={onClose} className="btn-secondary text-caption py-xs px-md">取消</button>
        <button onClick={handleSubmit} disabled={submitting || !form.description.trim()} className="btn-primary text-caption py-xs px-md">
          {submitting ? "创建中..." : "添加"}
        </button>
      </>}
    >
      <div className="space-y-md">
        <div><label className="label">事件日期</label><input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
        <div><label className="label">事件描述 *</label><textarea className="input h-16 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="如：原告向被告转账10万元" /></div>
        <div><label className="label">涉及金额</label><input className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="如：100,000" /></div>
        <div><label className="label">相关人物</label><input className="input" value={form.persons} onChange={e => setForm(p => ({ ...p, persons: e.target.value }))} placeholder="逗号分隔" /></div>
        <div><label className="label">标签</label><input className="input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="如：转账,催款" /></div>
      </div>
    </Modal>
  );
}
