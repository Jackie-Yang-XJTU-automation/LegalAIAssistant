"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ImportTab = "text" | "image" | "pdf" | "audio";

const IMPORT_TABS: { key: ImportTab; label: string; icon: string }[] = [
  { key: "text", label: "粘贴文本", icon: "📝" },
  { key: "image", label: "上传截图", icon: "📸" },
  { key: "pdf", label: "上传 PDF", icon: "📄" },
  { key: "audio", label: "语音录入", icon: "🎙" },
];

type AnalysisStep = "idle" | "importing" | "analyzing" | "done" | "error";

export default function SourceImportPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [activeTab, setActiveTab] = useState<ImportTab>("text");
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("idle");
  const [resultCount, setResultCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleImport = async () => {
    if (activeTab === "text" && !textInput.trim()) return;

    setErrorMsg("");

    // Step 1: Create source
    setAnalysisStep("importing");
    try {
      const importRes = await fetch(`/api/cases/${caseId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          title:
            activeTab === "text"
              ? "文本素材"
              : activeTab === "image"
              ? "截图素材"
              : activeTab === "pdf"
              ? "PDF 文档"
              : "音频素材",
          content: textInput || "模拟素材内容",
        }),
      });

      const importJson = await importRes.json();
      if (!importJson.success) {
        setErrorMsg(importJson.error?.message ?? "导入失败");
        setAnalysisStep("error");
        return;
      }

      const sourceId = importJson.data.id;

      // Step 2: Trigger analysis
      setAnalysisStep("analyzing");
      const analyzeRes = await fetch(`/api/cases/${caseId}/sources/${sourceId}/analyze`, {
        method: "POST",
      });

      const analyzeJson = await analyzeRes.json();
      if (!analyzeJson.success) {
        setErrorMsg(analyzeJson.error?.message ?? "AI 分析失败");
        setAnalysisStep("error");
        return;
      }

      setResultCount(analyzeJson.data.resultsCount);
      setAnalysisStep("done");

      // Redirect after brief delay
      setTimeout(() => {
        router.push("/review");
      }, 1500);
    } catch {
      setErrorMsg("网络连接异常，请检查网络后重试");
      setAnalysisStep("error");
    }
  };

  const isAnalyzing = analysisStep === "importing" || analysisStep === "analyzing";

  return (
    <div className="p-lg max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="btn-ghost mb-md" disabled={isAnalyzing}>
        ← 返回案件
      </button>

      <h1 className="text-title text-primary mb-lg">导入素材</h1>

      {/* Import type tabs */}
      <div className="grid grid-cols-4 gap-sm mb-lg">
        {IMPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            disabled={isAnalyzing}
            className={`p-md rounded-lg border-2 text-center transition-all disabled:opacity-50 ${
              activeTab === tab.key
                ? "border-primary bg-primary-pale text-primary"
                : "border-[#E0E0E0] text-text-secondary hover:border-primary"
            }`}
          >
            <div className="text-2xl mb-xs">{tab.icon}</div>
            <div className="text-caption">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="card mb-lg">
        {activeTab === "text" && (
          <div>
            <label className="label">粘贴聊天记录或案情描述</label>
            <textarea
              className="input h-40 resize-none"
              placeholder={`直接粘贴微信聊天记录、短信内容、案情描述等...\n\n例如：\n张三 2024-03-01 10:30：李四，钱转过去了，10万，你看看\n李四 2024-03-01 10:31：收到了，谢谢！年底还你\n\n或者粘贴一段电话记录：\n刚和王女士电话，她说2024年8月入职，2026年5月30日被公司口头辞退...`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>
        )}

        {activeTab === "image" && (
          <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-2xl text-center">
            <div className="text-4xl mb-md">📸</div>
            <p className="text-body text-text-secondary mb-md">拖入截图文件或点击上传</p>
            <p className="text-caption text-text-hint mb-lg">支持 JPG、PNG 格式。MVP 版本请使用文本方式，截图功能将在后续版本实现</p>
            <button className="btn-secondary" disabled>
              选择文件（即将支持）
            </button>
          </div>
        )}

        {activeTab === "pdf" && (
          <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-2xl text-center">
            <div className="text-4xl mb-md">📄</div>
            <p className="text-body text-text-secondary mb-md">拖入 PDF 文件或点击上传</p>
            <p className="text-caption text-text-hint mb-lg">MVP 版本请使用文本方式，PDF 解析将在后续版本实现</p>
            <button className="btn-secondary" disabled>
              选择文件（即将支持）
            </button>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="text-center py-xl">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all mx-auto ${
                isRecording ? "bg-error text-white animate-pulse" : "bg-primary text-white hover:bg-primary-light"
              }`}
              disabled={isAnalyzing}
            >
              🎙
            </button>
            <p className="text-body text-text-secondary mt-md">
              {isRecording ? "正在录音...点击停止" : "点击开始口述案件记录"}
            </p>
            {isRecording && <p className="text-caption text-error mt-sm">录音中 · 00:{isRecording ? "12" : "00"}</p>}
            <p className="text-caption text-text-hint mt-md">MVP 版本请使用文本方式，语音识别将在后续版本实现</p>
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleImport}
        disabled={(activeTab === "text" && !textInput.trim()) || isAnalyzing}
        className="btn-primary w-full"
      >
        {analysisStep === "importing" ? "上传中..." : analysisStep === "analyzing" ? "AI 分析中..." : "提交分析"}
      </button>

      {/* Error */}
      {analysisStep === "error" && (
        <div className="card mt-lg border-l-2 border-error">
          <h3 className="text-heading text-error mb-sm">⚠ {errorMsg || "分析失败"}</h3>
          <button onClick={() => setAnalysisStep("idle")} className="btn-secondary text-caption">
            重试
          </button>
        </div>
      )}

      {/* Progress */}
      {analysisStep !== "idle" && analysisStep !== "error" && (
        <div className="card mt-lg">
          <h3 className="text-heading text-text-primary mb-md">
            {analysisStep === "importing" && "⏳ 正在提交素材..."}
            {analysisStep === "analyzing" && "🤖 AI 正在分析素材..."}
            {analysisStep === "done" && "✅ 分析完成！"}
          </h3>

          <div className="space-y-sm">
            <div className="flex items-center gap-sm">
              <span className={analysisStep !== "importing" ? "text-success" : "text-primary animate-pulse"}>
                {analysisStep !== "importing" ? "✓" : "⏳"}
              </span>
              <span className={`text-body ${analysisStep !== "importing" ? "text-success" : "text-primary font-medium"}`}>
                提交素材
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <span className={analysisStep === "done" ? "text-success" : analysisStep === "analyzing" ? "text-primary animate-pulse" : "text-text-hint"}>
                {analysisStep === "done" ? "✓" : analysisStep === "analyzing" ? "⏳" : "○"}
              </span>
              <span className={`text-body ${analysisStep === "done" ? "text-success" : analysisStep === "analyzing" ? "text-primary font-medium" : "text-text-hint"}`}>
                AI 分析（实体提取、事件识别、待办生成）
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <span className={analysisStep === "done" ? "text-success" : "text-text-hint"}>
                {analysisStep === "done" ? "✓" : "○"}
              </span>
              <span className={`text-body ${analysisStep === "done" ? "text-success" : "text-text-hint"}`}>
                生成审核结果
              </span>
            </div>
          </div>

          {analysisStep === "done" && (
            <p className="text-body text-success mt-md">
              已生成 {resultCount} 条 AI 结果，即将跳转到确认页面...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
