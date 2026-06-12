import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/cases/[id]/events - create a timeline event manually
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.description?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "事件描述不能为空" } },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        caseId: id,
        date: body.date || new Date().toISOString().split("T")[0],
        description: body.description.trim(),
        amount: body.amount || "",
        persons: body.persons || "",
        tags: body.tags || "",
        confidence: "high",
        isConfirmed: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: id,
        action: "create",
        target: "event",
        targetId: event.id,
        detail: `手动添加事件: ${event.description.substring(0, 30)}`,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cases/[id]/events error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "创建事件失败" } },
      { status: 500 }
    );
  }
}
