import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/** 获取学员列表（仅管理员） */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const courseId = searchParams.get("courseId") || "";

    // 简化查询：先查学员
    const where: { role: string; AND?: unknown[] } = { role: "STUDENT" };
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        },
      ];
    }

    // 如果按课程筛选，先查该课程的 enrollments 拿 userIds
    let enrollMap = new Map<string, { progress: number; enrolledAt: string; completedAt: string | null; lastActiveAt: string }>();
    let userIds: string[] | null = null;
    if (courseId) {
      const enrollments = await db.enrollment.findMany({
        where: { courseId },
        select: {
          userId: true,
          progress: true,
          enrolledAt: true,
          completedAt: true,
          lastActiveAt: true,
        },
      });
      userIds = enrollments.map((e) => e.userId);
      enrollMap = new Map(
        enrollments.map((e) => [
          e.userId,
          {
            progress: e.progress,
            enrolledAt: e.enrolledAt.toISOString(),
            completedAt: e.completedAt ? e.completedAt.toISOString() : null,
            lastActiveAt: e.lastActiveAt.toISOString(),
          },
        ])
      );
    }

    const students = await db.user.findMany({
      where: userIds ? { id: { in: userIds }, role: "STUDENT" } : where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            scripts: true,
            lessonCompletions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // 把 enrollment 信息合并进去
    const studentsWithEnroll = courseId
      ? students.map((s) => ({
          ...s,
          enrollment: enrollMap.get(s.id),
        }))
      : students;

    // 统计
    const totalStudents = await db.user.count({ where: { role: "STUDENT" } });
    const totalEnrollments = await db.enrollment.count();
    const totalCompletions = await db.lessonCompletion.count();

    return NextResponse.json({
      students: studentsWithEnroll,
      stats: {
        totalStudents,
        totalEnrollments,
        totalCompletions,
        activeToday: 0, // 简化：避免复杂聚合查询
      },
    });
  } catch (e) {
    console.error("students list error", e);
    return NextResponse.json({ error: "获取学员列表失败" }, { status: 500 });
  }
}
