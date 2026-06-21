/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const { courseCatalog } = require("./course-catalog.cjs");

// 与 src/lib/db.ts 一致：优先 Turso 远程库，否则本地 SQLite 文件
function createAdapter() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    return new PrismaLibSQL({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  return new PrismaLibSQL({ url: process.env.DATABASE_URL || "file:../db/custom.db" });
}

const prisma = new PrismaClient({
  log: ["error", "warn"],
  adapter: createAdapter(),
});

const STAGE_FALLBACKS = {
  小白: ["入门", "0到1", "破冰", "小白"],
  爆款: ["选片", "拆片", "文案", "AI", "爆款"],
  精选: ["精选", "配音", "剪辑", "分发", "规则", "运营"],
};

const STATUS_PRIORITY = {
  approved: 3,
  pending: 2,
  rejected: 1,
};

function toCourseLookupTitle(course) {
  return [course.title, ...(course.legacyTitles || [])]
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function pickStageByTitle(title) {
  for (const course of courseCatalog) {
    if (toCourseLookupTitle(course).includes(title)) {
      return course.title;
    }
  }

  for (const course of courseCatalog) {
    const stageKeywords = STAGE_FALLBACKS[course.category] || [];
    if (stageKeywords.some((keyword) => title.includes(keyword))) {
      return course.title;
    }
  }

  return null;
}

function pickMergedStatus(currentStatus, nextStatus) {
  const currentScore = STATUS_PRIORITY[currentStatus] || 0;
  const nextScore = STATUS_PRIORITY[nextStatus] || 0;
  return nextScore > currentScore ? nextStatus : currentStatus;
}

async function upsertStageCourse(nextCourse, orderIndex) {
  const existing = await prisma.course.findFirst({
    where: {
      OR: toCourseLookupTitle(nextCourse).map((title) => ({ title })),
    },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  const totalDuration = nextCourse.lessons.reduce(
    (sum, lesson) => sum + lesson.duration,
    0,
  );

  if (!existing) {
    return prisma.course.create({
      data: {
        title: nextCourse.title,
        subtitle: nextCourse.subtitle,
        description: nextCourse.description,
        coverImage: nextCourse.coverImage,
        category: nextCourse.category,
        level: nextCourse.level,
        price: nextCourse.price,
        originalPrice: nextCourse.originalPrice,
        isFree: nextCourse.isFree,
        isFeatured: nextCourse.isFeatured,
        isPublished: true,
        instructor: nextCourse.instructor,
        instructorBio: nextCourse.instructorBio,
        rating: nextCourse.rating,
        ratingCount: nextCourse.ratingCount,
        studentsCount: nextCourse.studentsCount,
        totalDuration,
        lessonsCount: nextCourse.lessons.length,
        tags: JSON.stringify(nextCourse.tags),
        highlights: JSON.stringify(nextCourse.highlights),
        createdAt: new Date(Date.now() + orderIndex),
      },
      include: { lessons: { orderBy: { order: "asc" } } },
    });
  }

  return prisma.course.update({
    where: { id: existing.id },
    data: {
      title: nextCourse.title,
      subtitle: nextCourse.subtitle,
      description: nextCourse.description,
      coverImage: nextCourse.coverImage,
      category: nextCourse.category,
      level: nextCourse.level,
      price: nextCourse.price,
      originalPrice: nextCourse.originalPrice,
      isFree: nextCourse.isFree,
      isFeatured: nextCourse.isFeatured,
      isPublished: true,
      instructor: nextCourse.instructor,
      instructorBio: nextCourse.instructorBio,
      totalDuration,
      lessonsCount: nextCourse.lessons.length,
      tags: JSON.stringify(nextCourse.tags),
      highlights: JSON.stringify(nextCourse.highlights),
    },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
}

async function syncLessons(courseRecord, nextCourse) {
  for (const [lessonIndex, nextLesson] of nextCourse.lessons.entries()) {
    const currentLesson = courseRecord.lessons[lessonIndex];

    if (currentLesson) {
      await prisma.lesson.update({
        where: { id: currentLesson.id },
        data: {
          title: nextLesson.title,
          content: nextLesson.content,
          duration: nextLesson.duration,
          isPreview: Boolean(nextLesson.isPreview),
          order: lessonIndex + 1,
        },
      });
      continue;
    }

    await prisma.lesson.create({
      data: {
        courseId: courseRecord.id,
        title: nextLesson.title,
        content: nextLesson.content,
        duration: nextLesson.duration,
        isPreview: Boolean(nextLesson.isPreview),
        order: lessonIndex + 1,
      },
    });
  }

  if (courseRecord.lessons.length > nextCourse.lessons.length) {
    const extraLessonIds = courseRecord.lessons
      .slice(nextCourse.lessons.length)
      .map((lesson) => lesson.id);

    if (extraLessonIds.length > 0) {
      await prisma.lesson.deleteMany({
        where: { id: { in: extraLessonIds } },
      });
    }
  }
}

async function migrateEnrollments(stageCourseIds) {
  const allCourses = await prisma.course.findMany({
    include: {
      enrollments: true,
      lessonCompletions: true,
    },
  });

  const targetIds = new Set(Object.values(stageCourseIds));
  const legacyCourses = allCourses.filter((course) => !targetIds.has(course.id));
  const grouped = new Map();

  for (const legacyCourse of legacyCourses) {
    const targetTitle = pickStageByTitle(legacyCourse.title);
    if (!targetTitle) continue;
    const targetCourseId = stageCourseIds[targetTitle];
    if (!targetCourseId) continue;

    for (const enrollment of legacyCourse.enrollments) {
      const key = `${enrollment.userId}:${targetCourseId}`;
      const current = grouped.get(key);
      const next = {
        userId: enrollment.userId,
        courseId: targetCourseId,
        status: enrollment.status,
        progress: enrollment.progress,
        lastLessonId: null,
        enrolledAt: current?.enrolledAt && current.enrolledAt < enrollment.enrolledAt
          ? current.enrolledAt
          : enrollment.enrolledAt,
        completedAt: current?.completedAt || enrollment.completedAt || null,
        lastActiveAt:
          current?.lastActiveAt && current.lastActiveAt > enrollment.lastActiveAt
            ? current.lastActiveAt
            : enrollment.lastActiveAt,
      };

      if (current) {
        next.status = pickMergedStatus(current.status, enrollment.status);
        next.progress = Math.max(current.progress, enrollment.progress);
        next.completedAt = current.completedAt || enrollment.completedAt || null;
      }

      grouped.set(key, next);
    }
  }

  for (const item of grouped.values()) {
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: item.userId,
          courseId: item.courseId,
        },
      },
    });

    if (!existing) {
      await prisma.enrollment.create({ data: item });
      continue;
    }

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: item.userId,
          courseId: item.courseId,
        },
      },
      data: {
        status: pickMergedStatus(existing.status, item.status),
        progress: Math.max(existing.progress, item.progress),
        completedAt: existing.completedAt || item.completedAt,
        lastActiveAt:
          existing.lastActiveAt > item.lastActiveAt
            ? existing.lastActiveAt
            : item.lastActiveAt,
      },
    });
  }
}

async function cleanupLegacyCourses(stageCourseIds) {
  const keepIds = Object.values(stageCourseIds);
  await prisma.course.deleteMany({
    where: {
      id: { notIn: keepIds },
    },
  });
}

async function main() {
  console.log("Syncing 3-stage course system...");

  const stageCourseIds = {};

  for (const [index, nextCourse] of courseCatalog.entries()) {
    const courseRecord = await upsertStageCourse(nextCourse, index);
    await syncLessons(courseRecord, nextCourse);
    stageCourseIds[nextCourse.title] = courseRecord.id;
    console.log(`Synced course: ${nextCourse.title}`);
  }

  await migrateEnrollments(stageCourseIds);
  await cleanupLegacyCourses(stageCourseIds);

  console.log("3-stage courses synced. Legacy courses removed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
