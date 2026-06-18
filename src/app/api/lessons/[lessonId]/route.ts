import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/** 更新课时（仅管理员） */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("id");
    if (!lessonId) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }
    const body = await req.json();
    const allowed: Record<string, unknown> = {};
    for (const k of ["title", "content", "videoUrl", "duration", "order", "isPreview"]) {
      if (k in body) allowed[k] = body[k];
    }
    if (allowed.title !== undefined && !String(allowed.title).trim()) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    const lesson = await db.lesson.update({
      where: { id: lessonId },
      data: allowed,
    });
    return NextResponse.json({ lesson });
  } catch (e) {
    console.error("lesson update error", e);
    return NextResponse.json({ error: "更新课时失败" }, { status: 500 });
  }
}

/** 删除课时（仅管理员） */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("id");
    if (!lessonId) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }
    await db.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("lesson delete error", e);
    return NextResponse.json({ error: "删除课时失败" }, { status: 500 });
  }
}
