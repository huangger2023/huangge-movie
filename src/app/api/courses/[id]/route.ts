import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await db.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }
    const user = await getCurrentUser();
    let enrollment = null;
    if (user) {
      enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: id } },
      });
    }
    return NextResponse.json({ course, enrollment });
  } catch (e) {
    console.error("course detail error", e);
    return NextResponse.json({ error: "获取课程失败" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const course = await db.course.update({
      where: { id },
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        description: body.description,
        coverImage: body.coverImage,
        category: body.category,
        level: body.level,
        price: body.price,
        originalPrice: body.originalPrice ?? null,
        isFree: body.isFree,
        isFeatured: body.isFeatured,
        isPublished: body.isPublished ?? true,
        instructor: body.instructor,
        instructorBio: body.instructorBio,
        tags: JSON.stringify(body.tags ?? []),
        highlights: JSON.stringify(body.highlights ?? []),
      },
    });
    return NextResponse.json({ course });
  } catch (e) {
    console.error("course update error", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    const { id } = await params;
    await db.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("course delete error", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
