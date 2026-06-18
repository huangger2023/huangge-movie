import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = Number(searchParams.get("limit") ?? 0);

    const where: Record<string, unknown> = { isPublished: true };
    if (category && category !== "全部") where.category = category;
    if (level && level !== "全部") where.level = level;
    if (featured === "1") where.isFeatured = true;
    if (search?.trim()) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { instructor: { contains: search } },
      ];
    }

    let query = db.course.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { lessons: true, enrollments: true } } },
    });
    let courses = await query;
    if (limit > 0) courses = courses.slice(0, limit);

    const user = await getCurrentUser();
    let enrolledIds = new Set<string>();
    if (user) {
      const enrolls = await db.enrollment.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      });
      enrolledIds = new Set(enrolls.map((e) => e.courseId));
    }

    return NextResponse.json({
      courses: courses.map((c) => ({
        ...c,
        isEnrolled: enrolledIds.has(c.id),
      })),
    });
  } catch (e) {
    console.error("courses list error", e);
    return NextResponse.json({ error: "获取课程失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    const body = await req.json();
    const course = await db.course.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        description: body.description,
        coverImage: body.coverImage || "",
        category: body.category || "实战",
        level: body.level || "中级",
        price: body.price ?? 0,
        originalPrice: body.originalPrice ?? null,
        isFree: body.isFree ?? false,
        isFeatured: body.isFeatured ?? false,
        instructor: body.instructor || user.name,
        instructorBio: body.instructorBio || null,
        tags: JSON.stringify(body.tags ?? []),
        highlights: JSON.stringify(body.highlights ?? []),
      },
    });
    return NextResponse.json({ course });
  } catch (e) {
    console.error("course create error", e);
    return NextResponse.json({ error: "创建课程失败" }, { status: 500 });
  }
}
