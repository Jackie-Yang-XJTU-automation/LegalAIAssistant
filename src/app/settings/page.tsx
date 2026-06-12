"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const handleReseed = async () => {
    if (!confirm("重置数据库将清除所有数据并重新填充示例数据。确定继续？")) return;
    setMessage("正在重置...");
    try {
      const res = await fetch("/api/settings/reseed", { method: "POST" });
      const json = await res.json();
      setMessage(json.success ? "✅ 数据库已重置并重新填充示例数据" : "❌ 重置失败");
    } catch {
      setMessage("❌ 重置失败");
    }
  };

  return (
    <div className="p-lg max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="btn-ghost mb-md">
        ← 返回
      </button>

      <h1 className="text-title text-primary mb-lg">设置</h1>

      <div className="space-y-lg">
        {/* About */}
        <div className="card">
          <h2 className="text-heading text-text-primary mb-sm">关于律案助理</h2>
          <p className="text-body text-text-secondary mb-sm">
            律案助理 v1.0.0 — 律师私人案件助理
          </p>
          <p className="text-caption text-text-hint">
            帮助律师把散落在微信、短信、文书、语音里的案件信息，低摩擦导入后自动整理成案件时间线、待办清单、关键日期提醒和证据目录。
          </p>
        </div>

        {/* AI Settings */}
        <div className="card">
          <h2 className="text-heading text-text-primary mb-sm">AI 设置</h2>
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body text-text-primary">AI 分析模式</p>
                <p className="text-caption text-text-hint">当前使用模拟分析器（基于模式匹配），可接入 OpenAI/Anthropic API</p>
              </div>
              <span className="badge-warning badge-status">模拟模式</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-heading text-text-primary mb-sm">数据管理</h2>
          <div className="space-y-md">
            <div>
              <p className="text-body text-text-primary mb-xs">数据库位置</p>
              <p className="text-caption text-text-hint font-mono">prisma/dev.db (SQLite)</p>
            </div>
            <div>
              <p className="text-body text-text-primary mb-xs">示例数据</p>
              <button onClick={handleReseed} className="btn-secondary text-caption">
                重置数据库并填充示例数据
              </button>
              {message && <p className="text-caption mt-xs">{message}</p>}
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="card">
          <h2 className="text-heading text-text-primary mb-sm">隐私与安全</h2>
          <ul className="space-y-sm text-body text-text-secondary">
            <li>✅ 所有数据存储在本地 SQLite 数据库</li>
            <li>✅ 不收集、不上传任何用户数据</li>
            <li>✅ AI 分析在本地执行（模拟模式）</li>
            <li>✅ 不会将案件数据用于模型训练</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
