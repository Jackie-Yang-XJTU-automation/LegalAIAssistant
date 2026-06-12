import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/cases/[id]/tasks - create a task manually
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "待办标题不能为空" } },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        caseId: id,
        title: body.title.trim(),
        description: body.description || "",
        dueDate: body.dueDate || "",
        priority: body.priority || "medium",
        status: "pending",
        isAIGenerated: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: id,
        action: "create",
        target: "task",
        targetId: task.id,
        detail: `手动创建待办: ${task.title}`,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cases/[id]/tasks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "创建待办失败" } },
      { status: 500 }
    );
  }
}
