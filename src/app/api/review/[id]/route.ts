import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, content } = body;

    if (!["confirmed", "modified", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "无效的状态" } },
        { status: 400 }
      );
    }

    const existing = await prisma.aIResult.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "AI 结果不存在" } },
        { status: 404 }
      );
    }

    const result = await prisma.aIResult.update({
      where: { id },
      data: {
        status,
        ...(content && { content }),
        confirmedAt: new Date(),
      },
    });

    // If confirmed, create the actual entity based on type
    if (status === "confirmed" || status === "modified") {
      const caseId = existing.caseId;

      if (existing.type === "event") {
        // Parse jsonData for event details
        let eventData = { date: "", description: existing.title, amount: "", persons: "" };
        try {
          if (existing.jsonData) {
            eventData = { ...eventData, ...JSON.parse(existing.jsonData) };
          }
        } catch { /* ignore parse error */ }

        await prisma.event.create({
          data: {
            caseId,
            date: eventData.date || new Date().toISOString().split("T")[0],
            description: content || eventData.description,
            amount: eventData.amount || "",
            persons: eventData.persons || "",
            sourceIds: existing.sourceId,
            confidence: existing.confidence,
            isConfirmed: true,
          },
        });
      } else if (existing.type === "task") {
        await prisma.task.create({
          data: {
            caseId,
            title: existing.title,
            description: content || existing.content,
            priority: "medium",
            isAIGenerated: true,
          },
        });
      } else if (existing.type === "deadline") {
        await prisma.deadline.create({
          data: {
            caseId,
            title: existing.title,
            date: new Date().toISOString().split("T")[0],
            type: "other",
            isAIGenerated: true,
            isConfirmed: true,
          },
        });
      } else if (existing.type === "evidence") {
        await prisma.evidence.create({
          data: {
            caseId,
            name: existing.title,
            purpose: content || existing.content,
            source: `AI识别`,
            sourceIds: existing.sourceId,
            isAIGenerated: true,
            isConfirmed: true,
          },
        });
      }

      // Log audit
      await prisma.auditLog.create({
        data: {
          caseId,
          action: "confirm",
          target: "ai_result",
          targetId: id,
          detail: `${status === "confirmed" ? "确认" : "修改后确认"} AI 结果: ${existing.title}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PUT /api/review/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "更新审核结果失败" } },
      { status: 500 }
    );
  }
}
