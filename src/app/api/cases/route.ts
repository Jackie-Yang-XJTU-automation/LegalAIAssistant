import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cases - list all cases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { clientName: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const cases = await prisma.case.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            tasks: { where: { status: { not: "completed" } } },
            deadlines: { where: { isConfirmed: true } },
          },
        },
      },
    });

    const data = cases.map((c) => ({
      id: c.id,
      name: c.name,
      clientName: c.clientName,
      caseType: c.caseType,
      status: c.status,
      riskLevel: c.riskLevel,
      stage: c.stage,
      summary: c.summary,
      taskCount: c._count.tasks,
      pendingDeadlineCount: c._count.deadlines,
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/cases error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取案件列表失败" } },
      { status: 500 }
    );
  }
}

// POST /api/cases - create a new case
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, clientName, caseType, summary } = body;

    if (!name?.trim() || !clientName?.trim() || !summary?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "案件名称、客户姓名和案情描述为必填项" } },
        { status: 400 }
      );
    }

    const case_ = await prisma.case.create({
      data: {
        name: name.trim(),
        clientName: clientName.trim(),
        caseType: caseType || "other",
        summary: summary.trim(),
        status: "active",
        riskLevel: "low",
        stage: "新建",
      },
    });

    // Create default plaintiff party
    await prisma.party.create({
      data: {
        caseId: case_.id,
        name: clientName.trim(),
        role: "plaintiff",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        caseId: case_.id,
        action: "create",
        target: "case",
        targetId: case_.id,
        detail: `创建案件: ${name}`,
      },
    });

    return NextResponse.json({ success: true, data: case_ }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cases error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "创建案件失败" } },
      { status: 500 }
    );
  }
}
