import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cases/[id] - get case detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const case_ = await prisma.case.findUnique({
      where: { id },
      include: {
        parties: true,
        events: { orderBy: { date: "desc" } },
        tasks: {
          orderBy: [
            { status: "asc" },
            { priority: "asc" },
          ],
        },
        deadlines: { orderBy: { date: "asc" } },
        evidences: true,
      },
    });

    if (!case_) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "案件不存在" } },
        { status: 404 }
      );
    }

    // Count tasks
    const taskCount = case_.tasks.filter(t => t.status !== "completed").length;
    const pendingDeadlineCount = case_.deadlines.filter(d => !d.isConfirmed).length;

    const data = {
      ...case_,
      updatedAt: case_.updatedAt.toISOString(),
      createdAt: case_.createdAt.toISOString(),
      taskCount,
      pendingDeadlineCount,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/cases/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取案件详情失败" } },
      { status: 500 }
    );
  }
}

// PUT /api/cases/[id] - update case
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "案件不存在" } },
        { status: 404 }
      );
    }

    const case_ = await prisma.case.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.clientName && { clientName: body.clientName }),
        ...(body.caseType && { caseType: body.caseType }),
        ...(body.summary && { summary: body.summary }),
        ...(body.status && { status: body.status }),
        ...(body.stage && { stage: body.stage }),
        ...(body.riskLevel && { riskLevel: body.riskLevel }),
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: id,
        action: "update",
        target: "case",
        targetId: id,
        detail: `更新案件信息`,
      },
    });

    return NextResponse.json({ success: true, data: case_ });
  } catch (error) {
    console.error("PUT /api/cases/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "更新案件失败" } },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[id] - delete case
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "案件不存在" } },
        { status: 404 }
      );
    }

    await prisma.case.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cases/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "删除案件失败" } },
      { status: 500 }
    );
  }
}
