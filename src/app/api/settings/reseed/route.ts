import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const { stderr } = await execAsync("npx tsx prisma/seed.ts", {
      cwd: process.cwd(),
    });
    if (stderr) console.error("Seed stderr:", stderr);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reseed error:", error);
    return NextResponse.json(
      { success: false, error: { code: "RESEED_FAILED", message: "重置失败" } },
      { status: 500 }
    );
  }
}
