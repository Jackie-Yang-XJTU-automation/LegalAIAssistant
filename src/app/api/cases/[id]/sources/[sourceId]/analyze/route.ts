import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockAnalyze } from "@/lib/ai/mock-analyzer";

// POST /api/cases/[id]/sources/[sourceId]/analyze - trigger AI analysis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  try {
    const { id, sourceId } = await params;

    // Verify source exists and belongs to case
    const source = await prisma.source.findFirst({
      where: { id: sourceId, caseId: id },
      include: { case: true },
    });

    if (!source) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "素材不存在" } },
        { status: 404 }
      );
    }

    // Update source status
    await prisma.source.update({
      where: { id: sourceId },
      data: { status: "processing" },
    });

    try {
      // Run mock analysis (replace with real AI API call later)
      const analysis = mockAnalyze(source.content);

      // Create AI results from analysis
      const aiResults: Array<{ data: Record<string, unknown> }> = [];

      // Events
      for (const event of analysis.events) {
        aiResults.push({
          data: {
            caseId: id,
            sourceId,
            type: "event",
            title: `时间事件：${event.date} ${event.description.substring(0, 50)}`,
            content: event.description,
            jsonData: JSON.stringify(event),
            confidence: event.confidence || "medium",
            status: "pending",
          },
        });
      }

      // Deadlines
      for (const deadline of analysis.deadlines) {
        aiResults.push({
          data: {
            caseId: id,
            sourceId,
            type: "deadline",
            title: deadline.title,
            content: `日期: ${deadline.date}, 类型: ${deadline.type}`,
            jsonData: JSON.stringify(deadline),
            confidence: deadline.confidence || "low",
            status: "pending",
          },
        });
      }

      // Evidences
      for (const evidence of analysis.evidences) {
        aiResults.push({
          data: {
            caseId: id,
            sourceId,
            type: "evidence",
            title: evidence.name,
            content: evidence.purpose,
            jsonData: JSON.stringify(evidence),
            confidence: evidence.confidence || "medium",
            status: "pending",
          },
        });
      }

      // Tasks
      for (const task of analysis.tasks) {
        aiResults.push({
          data: {
            caseId: id,
            sourceId,
            type: "task",
            title: task.title,
            content: task.description,
            jsonData: JSON.stringify(task),
            confidence: task.confidence || "medium",
            status: "pending",
          },
        });
      }

      // Summary
      if (analysis.summary) {
        aiResults.push({
          data: {
            caseId: id,
            sourceId,
            type: "summary",
            title: "AI 案情摘要",
            content: analysis.summary,
            jsonData: JSON.stringify({ caseType: analysis.caseType, summary: analysis.summary }),
            confidence: "medium",
            status: "pending",
          },
        });
      }

      // Risks
      for (const risk of analysis.risks) {
        aiResults.push({
          data: {
            caseId: id,
            sourceId,
            type: "risk",
            title: "风险提示",
            content: risk,
            confidence: "medium",
            status: "pending",
          },
        });
      }

      // Missing info
      for (const missing of analysis.missingInfo) {
        aiResults.push({
          data: {
            caseId: id,
            sourceId,
            type: "missing",
            title: "待补材料",
            content: missing,
            confidence: "medium",
            status: "pending",
          },
        });
      }

      // Create all AI results in batch
      if (aiResults.length > 0) {
        await prisma.aIResult.createMany({ data: aiResults.map((r) => r.data) as any });
      }

      // Update case type if detected
      if (analysis.caseType && source.case.caseType === "other") {
        await prisma.case.update({
          where: { id },
          data: { caseType: analysis.caseType },
        });
      }

      // Update source status
      await prisma.source.update({
        where: { id: sourceId },
        data: { status: "completed" },
      });

      return NextResponse.json({
        success: true,
        data: {
          resultsCount: aiResults.length,
          caseType: analysis.caseType,
        },
      });
    } catch (analysisError) {
      // Mark source as failed
      await prisma.source.update({
        where: { id: sourceId },
        data: { status: "failed" },
      });

      console.error("AI analysis error:", analysisError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "AI_ANALYSIS_FAILED", message: "AI 分析失败，请重试" },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("POST /api/analyze error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "操作失败" } },
      { status: 500 }
    );
  }
}
