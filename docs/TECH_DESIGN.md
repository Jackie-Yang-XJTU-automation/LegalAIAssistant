# Technical Design — 律案助理

## 技术栈

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: Tailwind CSS 4 (utility-first)
- **State**: React useState/useEffect (MVP 阶段不引入状态管理库)
- **Routing**: Next.js App Router (文件系统路由)
- **Form**: 原生 HTML 表单 + 受控组件
- **Test**: Vitest + React Testing Library (待配置)

### Backend

- **Runtime**: Node.js (via Next.js)
- **Framework**: Next.js API Routes
- **API style**: RESTful JSON
- **Auth**: 暂不实现（MVP 单用户本地使用）
- **File storage**: 本地文件系统 (public/uploads)
- **AI Pipeline**: 模拟实现（后续接入 OpenAI/Anthropic API）

### Database

- **Database**: SQLite (via Prisma 5)
- **ORM**: Prisma Client
- **Migration**: Prisma Migrate (db push for MVP)

### AI

- **Model**: 待接入（结构预留）
- **Input**: 文本/图片/PDF/音频
- **Output**: 结构化 JSON (事件/待办/证据/风险)
- **Retry**: 自动重试 2 次
- **Human confirmation**: 必须（所有 AI 结果标记 isAIGenerated/isConfirmed）
- **Logging**: AuditLog 表

---

## 架构原则

- 前端展示与业务逻辑分离
- API 契约简单稳定
- 数据模型清晰
- AI 输出可追踪
- 重要操作可审计
- MVP 阶段避免过度架构

---

## 模块划分

```
src/
  app/          # Next.js App Router 页面
    api/        # API Routes
  components/   # React 组件
    ui/         # 通用 UI 组件
    layout/     # 布局组件
    cases/      # 案件相关组件
  lib/          # 工具库
    prisma.ts   # 数据库客户端
    utils.ts    # 工具函数
    ai/         # AI 相关逻辑
  types/        # TypeScript 类型定义
  data/         # Mock 数据
prisma/
  schema.prisma # 数据模型
  dev.db        # SQLite 数据库
```

## 核心模块

### UI Module
- 页面展示：Dashboard, CaseList, CaseDetail, CaseCreate, SourceImport, AIReview
- 用户输入：表单、文件上传、文本粘贴
- 状态反馈：Loading/Empty/Error/Success 四态完整

### Business Module
- 业务规则：案件状态转换、AI 结果确认流程
- 校验逻辑：表单必填校验、日期合法性

### Data Module
- API 请求：fetch from /api/*
- 数据转换：AI JSON 到 UI 展示格式

### AI Module (待实现)
- 构造 prompt
- 调用模型
- 解析结果
- 处理失败
- 输出置信度
