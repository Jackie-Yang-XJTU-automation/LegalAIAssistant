# Decision Log — 律案助理

## 2026-06-12: 技术栈选择

### Decision
使用 Next.js + Tailwind CSS + Prisma + SQLite 作为技术栈。

### Context
MVP 阶段需要快速开发、快速迭代。产品目标是桌面 Web 为主的律师案件管理工具。

### Options
方案 A：Next.js + Prisma + SQLite（全栈一体）
方案 B：前后端分离（React + Express + PostgreSQL）
方案 C：Django 单体应用

### Reason
选 A。Next.js 全栈方案开发速度最快，SQLite 零配置适合 MVP，如果后续需要升级到 PostgreSQL 只需改 Prisma 配置。Tailwind CSS 与 Next.js 集成良好。

### Trade-off
SQLite 不适合高并发，但 MVP 阶段单用户使用完全足够。

---

## 2026-06-12: Prisma 版本选择

### Decision
使用 Prisma 5.x 而非 Prisma 7。

### Context
Prisma 7 刚发布，配置方式有较大变化（移除 datasource url、引入 prisma.config.ts、需要 adapter），文档和社区支持尚不完善。

### Reason
Prisma 5 稳定且文档齐全，API 简洁（url 直接在 schema 中配置）。等 Prisma 7 生态成熟后再升级。

---

## 2026-06-12: AI 实现策略

### Decision
MVP 先用 mock analyzer（基于模式匹配的模拟 AI），预留真实 API 接口。

### Context
实际的 LLM API（OpenAI/Anthropic）需要 API Key 和费用。MVP 先验证产品交互流程，后续再接入真实 AI。

### Reason
- 模拟 AI 不依赖外部服务，开发和演示方便
- 真实 AI 接口在 `src/lib/ai/` 中结构已预留
- 切换时只需实现 analyzer 的新版本，替换 mockAnalyze 调用即可

### Follow-up
- 添加真实 OpenAI/Anthropic 集成时，注意数据脱敏
- 实现 API Key 配置界面
- 添加使用量统计

---

## 2026-06-12: 单用户 MVP 设计

### Decision
第一版不做用户系统、不实现认证。

### Context
产品目前为律师个人使用，安装在自己电脑上。

### Reason
- 缩短开发周期
- 避免过早引入复杂认证体系
- 数据存储在本地 SQLite，天然隔离

### Follow-up
后续如需多用户，可引入 NextAuth.js + PostgreSQL。
