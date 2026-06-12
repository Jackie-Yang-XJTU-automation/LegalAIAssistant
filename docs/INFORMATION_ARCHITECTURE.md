# Information Architecture — 律师私人案件助理

## 核心对象

- **Case**：案件
- **Party**：当事人
- **Source**：原始素材（文本/图片/PDF/音频）
- **Event**：时间线事件
- **Task**：待办事项
- **Deadline**：关键日期提醒
- **Evidence**：证据
- **Document**：文书草稿
- **AIResult**：AI 分析结果（待确认）

## 对象关系

```
Case（案件）
  ├── Party（当事人）
  ├── Source（素材）
  │     └── AIResult（AI 分析结果）
  ├── Event（时间线事件）
  ├── Task（待办）
  ├── Deadline（期限提醒）
  ├── Evidence（证据）
  └── Document（文书草稿）
```

## 页面结构

```
App
  ├── Dashboard（今日概览首页）
  ├── CaseList（案件列表）
  ├── CaseDetail（案件详情）
  │     ├── Overview Tab（概览）
  │     ├── Timeline Tab（时间线）
  │     ├── Tasks Tab（待办）
  │     ├── Evidence Tab（证据）
  │     ├── Communication Tab（沟通记录）
  │     └── AI Tab（AI 建议）
  ├── CaseCreate（新建案件）
  ├── SourceImport（导入素材）
  ├── AIReview（AI 结果确认）
  └── Settings（设置）
```

## 导航结构

### 一级导航

- 首页（今日概览）
- 案件列表
- 待确认（AI 结果）
- 设置

### 二级导航（案件详情内）

- 概览
- 时间线
- 待办
- 证据
- 沟通记录
- AI 建议

## 页面职责

### Dashboard（今日概览首页）

用于：
- 今日开庭 / 会见 / 会议
- 今日到期事项
- AI 新识别的案件进展
- 需要律师确认的 AI 结果
- 快速进入案件

### CaseList（案件列表）

用于：
- 浏览所有案件
- 按状态筛选（进行中 / 已结案 / 已归档）
- 搜索案件
- 创建新案件

### CaseDetail（案件详情）

用于：
- 查看案件完整信息
- 切换不同 Tab 查看时间线、待办、证据等
- 导入新素材
- 查看 AI 建议

### CaseCreate（新建案件）

用于：
- 创建新案件
- 输入基本信息

### SourceImport（导入素材）

用于：
- 粘贴文本
- 上传图片/PDF
- 语音录入

### AIReview（AI 结果确认）

用于：
- 逐条审核 AI 提取结果
- 确认 / 修改 / 删除
- 批量确认
