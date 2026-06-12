import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/cases/[id]/sources - import source material
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify case exists
    const case_ = await prisma.case.findUnique({ where: { id } });
    if (!case_) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "案件不存在" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, title, content } = body;

    if (!type || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "素材类型和内容不能为空" } },
        { status: 400 }
      );
    }

    const source = await prisma.source.create({
      data: {
        caseId: id,
        type,
        title: title || `素材导入 ${new Date().toLocaleString("zh-CN")}`,
        content: content.trim(),
        status: "pending",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        caseId: id,
        action: "import",
        target: "source",
        targetId: source.id,
        detail: `导入${type === "text" ? "文本" : type === "image" ? "截图" : type === "pdf" ? "PDF" : "音频"}素材`,
      },
    });

    return NextResponse.json({ success: true, data: source }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cases/[id]/sources error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "导入素材失败" } },
      { status: 500 }
    );
  }
}
