// 更新课程封面路径
// 用法：node scripts/update-course-cover.js

const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");

// 与 src/lib/db.ts 一致：优先 Turso，否则本地 SQLite 文件
const tursoUrl = process.env.TURSO_DATABASE_URL;
const adapter = new PrismaLibSQL({
  url: tursoUrl || "file:./db/custom.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const courses = await prisma.course.findMany();

  for (const c of courses) {
    let newCover;
    if (c.category === "小白") newCover = "/covers/course-cover-beginner.svg";
    else if (c.category === "爆款") newCover = "/covers/course-cover-viral.svg";
    else if (c.category === "精选") newCover = "/covers/course-cover-premium.svg";
    else continue;

    await prisma.course.update({
      where: { id: c.id },
      data: { coverImage: newCover },
    });
    console.log(`${c.title}: ${c.coverImage} → ${newCover}`);
  }

  console.log("DONE");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
