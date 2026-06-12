# 律案助理 (Legal Case Assistant)

⚖️ 律师私人案件助理 — 把散落在微信、短信、文书、语音里的案件信息，低摩擦导入后自动整理成案件时间线、待办清单、关键日期提醒和证据目录。

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库并填充示例数据
npx prisma db push
npm run db:seed

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 功能

- 📊 **今日概览**：今日待办、即将到期、AI 新识别
- 📁 **案件管理**：创建、查看、编辑、删除案件
- 📝 **素材导入**：粘贴聊天记录、上传截图/PDF
- 🤖 **AI 分析**：自动提取时间、人物、金额、事件
- ⏱ **时间线**：按时间排列的案件事实
- ✅ **待办清单**：AI 自动生成的下一步工作
- 📋 **证据目录**：自动整理并标注证明目的
- ⚠ **风险提示**：缺失材料、法律风险识别
- 🔔 **期限提醒**：开庭、举证、上诉等关键日期

## 技术栈

- **前端**: Next.js 16 + React 19 + Tailwind CSS 4
- **后端**: Next.js API Routes
- **数据库**: SQLite (Prisma 5)
- **语言**: TypeScript
- **AI**: 模拟分析器（可接入 OpenAI/Anthropic）

## 项目结构

```
src/
  app/           # Next.js App Router 页面和 API
    api/         # RESTful API 路由
  components/    # React 组件
    ui/          # 通用 UI 组件
    layout/      # 布局组件
    cases/       # 案件相关组件
  lib/           # 工具库
    prisma.ts    # 数据库客户端
    utils.ts     # 工具函数
    ai/          # AI 分析模块
  types/         # TypeScript 类型
  data/          # Mock 数据（原型阶段）
docs/            # 产品和技术文档
prisma/          # 数据库 schema 和迁移
```

## 文档

- [PRD](docs/PRD.md) - 产品需求文档
- [MVP Scope](docs/MVP_SCOPE.md) - MVP 范围
- [UX Flow](docs/UX_FLOW.md) - 用户体验流程
- [Design System](docs/DESIGN_SYSTEM.md) - 设计系统
- [Tech Design](docs/TECH_DESIGN.md) - 技术设计
- [Data Model](docs/DATA_MODEL.md) - 数据模型
- [API Spec](docs/API_SPEC.md) - API 规范
- [Decisions](docs/DECISIONS.md) - 技术决策记录

## License

ISC
