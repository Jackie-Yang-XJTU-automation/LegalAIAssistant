import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Active cases
    const activeCases = await prisma.case.findMany({
      where: { status: "active" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: {
            tasks: { where: { status: { not: "completed" } } },
            deadlines: { where: { isConfirmed: true } },
          },
        },
      },
    });

    // Today's deadlines
    const todayDeadlines = await prisma.deadline.findMany({
      where: {
        date: todayStr,
      },
      include: { case: { select: { id: true, name: true } } },
    });

    // Urgent deadlines (within 7 days)
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    const weekStr = weekLater.toISOString().split("T")[0];

    const upcomingDeadlines = await prisma.deadline.findMany({
      where: {
        date: { gte: todayStr, lte: weekStr },
      },
      include: { case: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    });

    // Pending AI results
    const pendingAIResults = await prisma.aIResult.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const recentCases = activeCases.map((c) => ({
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

    const pendingConfirmations = pendingAIResults;

    return NextResponse.json({
      success: true,
      data: {
        todayMeetings: todayDeadlines.map(d => ({
          id: d.id,
          title: `「${d.case.name}」${d.title}`,
          date: d.date,
          type: "deadline",
          isAIGenerated: d.isAIGenerated,
          isConfirmed: d.isConfirmed,
        })),
        todayDeadlines: upcomingDeadlines.map(d => ({
          id: d.id,
          title: `「${d.case.name}」${d.title}`,
          date: d.date,
          type: d.type,
          isAIGenerated: d.isAIGenerated,
          isConfirmed: d.isConfirmed,
        })),
        newAIResults: pendingAIResults.map(r => ({
          id: r.id,
          caseId: r.caseId,
          sourceId: r.sourceId,
          type: r.type,
          title: r.title,
          content: r.content,
          confidence: r.confidence,
          status: r.status,
        })),
        pendingConfirmations,
        recentCases,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取概览数据失败" } },
      { status: 500 }
    );
  }
}
