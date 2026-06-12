import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const results = await prisma.aIResult.findMany({
      where: {},
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("GET /api/review error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取审核列表失败" } },
      { status: 500 }
    );
  }
}
