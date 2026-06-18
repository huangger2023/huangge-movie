import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// 真实聚合统计：课程数 / 课时数 / 累计学员 / 平均评分 / 生成文案数 等
export async function GET() {
  try {
    const [courses, lessons, scripts, users, enrollments] = await Promise.all([
      db.course.findMany({
        where: { isPublished: true },
        select: {
          studentsCount: true,
          rating: true,
          ratingCount: true,
          totalDuration: true,
          lessonsCount: true,
        },
      }),
      db.lesson.count(),
      db.generatedScript.count(),
      db.user.count(),
      db.enrollment.count(),
    ]);

    const totalStudents = courses.reduce((s, c) => s + c.studentsCount, 0);
    const totalRatingCount = courses.reduce((s, c) => s + c.ratingCount, 0);
    const weightedRatingSum = courses.reduce(
      (s, c) => s + c.rating * c.ratingCount,
      0
    );
    const avgRating =
      totalRatingCount > 0 ? weightedRatingSum / totalRatingCount : 0;
    const totalDuration = courses.reduce((s, c) => s + c.totalDuration, 0);

    return NextResponse.json({
      courseCount: courses.length,
      lessonCount: lessons,
      totalStudents,
      avgRating: Number(avgRating.toFixed(1)),
      totalRatingCount,
      totalDurationMin: totalDuration,
      generatedScripts: scripts,
      userCount: users,
      enrollmentCount: enrollments,
    });
  } catch (e) {
    console.error("stats error", e);
    return NextResponse.json({ error: "统计失败" }, { status: 500 });
  }
}
