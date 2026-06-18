import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/** 获取课程的所有课时列表 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessons = await db.lesson.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ lessons });
  } catch (e) {
    console.error("lessons list error", e);
    return NextResponse.json({ error: "获取课时列表失败" }, { status: 500 });
  }
}

/** 新建课时（仅管理员） */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    const { id: courseId } = await params;
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "请填写课时标题" }, { status: 400 });
    }
    // 获取当前最大 order
    const maxOrder = await db.lesson.aggregate({
      where: { courseId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;
    const lesson = await db.lesson.create({
      data: {
        courseId,
        title: body.title.trim(),
        content: body.content || "",
        videoUrl: body.videoUrl || null,
        duration: Number(body.duration) || 0,
        order: body.order ?? nextOrder,
        isPreview: Boolean(body.isPreview),
      },
    });
    return NextResponse.json({ lesson });
  } catch (e) {
    console.error("lesson create error", e);
    return NextResponse.json({ error: "创建课时失败" }, { status: 500 });
  }
}
