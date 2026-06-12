# API Spec — 律案助理

## API Principles

- 统一响应格式
- 错误信息清晰
- 输入校验完整
- 不暴露内部错误
- API 契约稳定

---

## Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Endpoints

### GET /api/cases

List all cases.

**Query params**: status (optional), search (optional)

**Response**: `{ success: true, data: Case[] }`

---

### GET /api/cases/:id

Get case detail with all related data.

**Response**: `{ success: true, data: CaseDetail }`

---

### POST /api/cases

Create a new case.

**Request body**:
```json
{
  "name": "string",
  "clientName": "string",
  "caseType": "string?",
  "summary": "string"
}
```

**Response**: `{ success: true, data: Case }`

**Errors**: VALIDATION_ERROR, INVALID_INPUT

---

### PUT /api/cases/:id

Update case info.

**Request body**: `{ name?, clientName?, caseType?, summary?, status?, stage?, riskLevel? }`

**Response**: `{ success: true, data: Case }`

---

### DELETE /api/cases/:id

Delete a case and all related data.

**Response**: `{ success: true }`

---

### GET /api/cases/:id/events

List timeline events for a case.

**Response**: `{ success: true, data: Event[] }`

---

### POST /api/cases/:id/events

Create or confirm a timeline event.

**Response**: `{ success: true, data: Event }`

---

### GET /api/cases/:id/tasks

List tasks for a case.

**Response**: `{ success: true, data: Task[] }`

---

### POST /api/cases/:id/tasks

Create a task.

**Response**: `{ success: true, data: Task }`

---

### PUT /api/cases/:id/tasks/:taskId

Update task (status, priority, etc).

**Response**: `{ success: true, data: Task }`

---

### GET /api/cases/:id/evidences

List evidences for a case.

**Response**: `{ success: true, data: Evidence[] }`

---

### POST /api/cases/:id/sources

Import a new source material.

**Request**: FormData with file or JSON body with text.

**Response**: `{ success: true, data: Source }`

---

### POST /api/cases/:id/sources/:sourceId/analyze

Trigger AI analysis on a source.

**Response**: `{ success: true, data: { aiResultId: string, status: "processing" } }`

---

### GET /api/review

List pending AI results across all cases.

**Response**: `{ success: true, data: AIResult[] }`

---

### PUT /api/review/:id

Confirm/modify/reject an AI result.

**Request body**: `{ status: "confirmed"|"modified"|"rejected", content?: string }`

**Response**: `{ success: true, data: AIResult }`
```

---

### GET /api/dashboard

Get dashboard data (today's overview).

**Response**: `{ success: true, data: DashboardData }`
