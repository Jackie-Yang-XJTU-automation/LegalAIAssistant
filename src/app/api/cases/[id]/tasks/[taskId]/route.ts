import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/cases/[id]/tasks/[taskId] - update task status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    const body = await request.json();

    const existing = await prisma.task.findFirst({
      where: { id: taskId, caseId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "待办不存在" } },
        { status: 404 }
      );
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.priority && { priority: body.priority }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate }),
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: id,
        action: "update",
        target: "task",
        targetId: taskId,
        detail: `更新待办: ${task.title}`,
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("PUT /api/cases/[id]/tasks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "更新待办失败" } },
      { status: 500 }
    );
  }
}
