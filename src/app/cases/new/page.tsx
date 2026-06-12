"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { caseTypeLabel } from "@/lib/utils";

export default function CaseCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    caseType: "",
    summary: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "请输入案件名称";
    if (!form.clientName.trim()) errs.clientName = "请输入客户姓名";
    if (!form.summary.trim()) errs.summary = "请输入一句话案情描述";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/cases/${json.data.id}`);
      } else {
        setServerError(json.error?.message || "创建失败");
      }
    } catch {
      setServerError("网络连接异常，请检查网络后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="p-lg max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="btn-ghost mb-md">
        ← 返回
      </button>

      <h1 className="text-title text-primary mb-lg">新建案件</h1>

      {serverError && (
        <div className="bg-red-50 text-error p-md rounded-md mb-lg text-body">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-lg">
        <div>
          <label className="label">
            案件名称 <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.name ? "border-error" : ""}`}
            placeholder="例如：张三民间借贷纠纷"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          {errors.name && <p className="text-caption text-error mt-xs">{errors.name}</p>}
        </div>

        <div>
          <label className="label">
            客户姓名 <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.clientName ? "border-error" : ""}`}
            placeholder="当事人姓名"
            value={form.clientName}
            onChange={(e) => updateField("clientName", e.target.value)}
          />
          {errors.clientName && <p className="text-caption text-error mt-xs">{errors.clientName}</p>}
        </div>

        <div>
          <label className="label">案件类型</label>
          <p className="text-caption text-text-hint mb-sm">AI 将根据案情描述自动推荐，也可手动选择</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
            {(["lending", "labor", "family", "other"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("caseType", type)}
                className={`p-md rounded-lg border-2 text-center transition-all ${
                  form.caseType === type
                    ? "border-primary bg-primary-pale text-primary font-medium"
                    : "border-[#E0E0E0] text-text-secondary hover:border-primary"
                }`}
              >
                <div className="text-2xl mb-xs">
                  {type === "lending" ? "💰" : type === "labor" ? "💼" : type === "family" ? "👨‍👩‍👧" : "📄"}
                </div>
                <div className="text-caption">{caseTypeLabel(type)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">
            一句话案情 <span className="text-error">*</span>
          </label>
          <textarea
            className={`input h-24 resize-none ${errors.summary ? "border-error" : ""}`}
            placeholder={`简单描述案情，AI 将据此推荐案件类型和关键节点。\n例如：张三借李四10万元不还，有借条和微信转账，约定年底还，对方一直拖。`}
            value={form.summary}
            onChange={(e) => updateField("summary", e.target.value)}
          />
          {errors.summary && <p className="text-caption text-error mt-xs">{errors.summary}</p>}
          <p className="text-caption text-text-hint mt-xs">
            提示：写清楚人物、事件、金额、时间，AI 识别更准确
          </p>
        </div>

        <div className="flex gap-md pt-md">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "创建中..." : "创建案件"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
