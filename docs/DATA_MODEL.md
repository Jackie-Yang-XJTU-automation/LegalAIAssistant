# Data Model — 律案助理

## Entity: Case (案件)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| name | string | yes | 案件名称 |
| clientName | string | yes | 客户姓名 |
| caseType | string | yes | 案件类型 (lending/labor/family/other) |
| summary | string | no | 一句话案情 |
| status | string | yes | 状态 (active/closed/archived) |
| riskLevel | string | yes | 风险等级 (low/medium/high) |
| stage | string | no | 当前阶段 |
| createdAt | datetime | yes | 创建时间 |
| updatedAt | datetime | yes | 更新时间 |

Relations: has many Party, Source, Event, Task, Deadline, Evidence, DocumentDraft, AIResult, AuditLog

---

## Entity: Party (当事人)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| name | string | yes | 姓名 |
| role | string | yes | 角色 (plaintiff/defendant/third_party/other) |
| phone | string | no | 电话 |
| idNumber | string | no | 身份证号 |
| address | string | no | 地址 |
| notes | string | no | 备注 |

---

## Entity: Source (原始素材)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| type | string | yes | 类型 (text/image/pdf/audio) |
| title | string | no | 标题 |
| content | string | no | 文本内容 |
| filePath | string | no | 文件路径 |
| ocrText | string | no | OCR 提取文本 |
| status | string | yes | 处理状态 (pending/processing/completed/failed) |

---

## Entity: Event (时间线事件)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| date | string | yes | 事件日期 |
| description | string | yes | 事件描述 |
| amount | string | no | 金额 |
| persons | string | no | 相关人物 |
| sourceIds | string | no | 来源素材 ID（逗号分隔） |
| confidence | string | yes | AI 置信度 (high/medium/low) |
| isConfirmed | boolean | yes | 律师已确认 |
| tags | string | no | 标签（逗号分隔） |

---

## Entity: Task (待办)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| title | string | yes | 待办标题 |
| description | string | no | 详情 |
| dueDate | string | no | 截止日期 |
| priority | string | yes | 优先级 (high/medium/low) |
| status | string | yes | 状态 (pending/in_progress/completed) |
| isAIGenerated | boolean | yes | AI 生成 |

---

## Entity: Deadline (期限提醒)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| title | string | yes | 提醒标题 |
| date | string | yes | 日期 |
| type | string | no | 类型 (court/filing/appeal/evidence/payment/other) |
| isAIGenerated | boolean | yes | AI 生成 |
| isConfirmed | boolean | yes | 律师已确认 |

---

## Entity: Evidence (证据)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| name | string | yes | 证据名称 |
| type | string | no | 类型 (document/photo/audio/video/other) |
| purpose | string | no | 证明目的 |
| source | string | no | 来源描述 |
| sourceIds | string | no | 关联素材 ID |
| isAIGenerated | boolean | yes | AI 生成 |
| isConfirmed | boolean | yes | 律师已确认 |

---

## Entity: AIResult (AI 分析结果)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| sourceId | string | yes | 来源素材 |
| type | string | yes | 类型 (event/task/deadline/evidence/summary/risk/missing) |
| title | string | yes | 标题 |
| content | string | no | 内容 |
| jsonData | string | no | 结构化 JSON |
| confidence | string | yes | 置信度 |
| status | string | yes | 状态 (pending/confirmed/modified/rejected) |

---

## Entity: AuditLog (操作日志)

| Field | Type | Required | Description |
|---|---|---|---|
| id | string (cuid) | yes | 唯一标识 |
| caseId | string | yes | 所属案件 |
| action | string | yes | 操作 (create/update/delete/confirm/modify/reject/import) |
| target | string | yes | 操作对象 |
| targetId | string | no | 对象 ID |
| detail | string | no | 详情 |
| createdAt | datetime | yes | 时间 |
