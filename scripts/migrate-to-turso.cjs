/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * 把本地 SQLite (db/custom.db) 的 schema + 数据迁移到 Turso(libSQL)。
 *
 * 背景：Prisma CLI 的 db push 不认 libsql:// 协议（强制 file:），
 * 所以用 @libsql/client 直接在 Turso 建表 + 灌数据，绕过 CLI 限制。
 *
 * 流程：
 * 1. 用本地 PrismaClient（连本地 custom.db）读出所有表的数据
 * 2. 用 @libsql/client 连 Turso，执行建表 DDL（匹配 Prisma schema）
 * 3. 批量插入数据
 *
 * 用法：
 *   set TURSO_DATABASE_URL=libsql://...
 *   set TURSO_AUTH_TOKEN=...
 *   node scripts/migrate-to-turso.cjs
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const { createClient } = require("@libsql/client");

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("缺少 TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN");
  process.exit(1);
}

// 本地 Prisma（连本地 SQLite 文件，通过 libSQL adapter）
const local = new PrismaClient({
  adapter: new PrismaLibSQL({ url: "file:./db/custom.db" }),
});

// Turso 远程 client
const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// 建表 DDL（与 prisma/schema.prisma 一致，libSQL 语法）
const DDL = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '123456',
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "avatar" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,

  `CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "originalPrice" REAL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "instructor" TEXT NOT NULL,
    "instructorBio" TEXT,
    "instructorAvatar" TEXT,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "studentsCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "Lesson" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Lesson_courseId_idx" ON "Lesson"("courseId")`,

  `CREATE TABLE IF NOT EXISTS "LessonCompletion" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LessonCompletion_userId_lessonId_key" ON "LessonCompletion"("userId","lessonId")`,
  `CREATE INDEX IF NOT EXISTS "LessonCompletion_userId_courseId_idx" ON "LessonCompletion"("userId","courseId")`,

  `CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "lastLessonId" TEXT,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_userId_courseId_key" ON "Enrollment"("userId","courseId")`,

  `CREATE TABLE IF NOT EXISTS "GeneratedScript" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "genre" TEXT,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "meta" TEXT NOT NULL DEFAULT '{}',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "GeneratedScript_userId_type_idx" ON "GeneratedScript"("userId","type")`,
  `CREATE INDEX IF NOT EXISTS "GeneratedScript_userId_createdAt_idx" ON "GeneratedScript"("userId","createdAt")`,

  `CREATE TABLE IF NOT EXISTS "ToolUsage" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "toolType" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ToolUsage_userId_toolType_key" ON "ToolUsage"("userId","toolType")`,

  `CREATE TABLE IF NOT EXISTS "PlotDocument" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "PlotDocument_userId_movieTitle_idx" ON "PlotDocument"("userId","movieTitle")`,
  `CREATE INDEX IF NOT EXISTS "PlotDocument_userId_createdAt_idx" ON "PlotDocument"("userId","createdAt")`,

  `CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "ChatMessage_userId_lessonId_createdAt_idx" ON "ChatMessage"("userId","lessonId","createdAt")`,

  `CREATE TABLE IF NOT EXISTS "Workspace" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "genre" TEXT NOT NULL DEFAULT '剧情',
    "coverColor" TEXT NOT NULL DEFAULT 'rose',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "script" TEXT,
    "titles" TEXT,
    "hooks" TEXT,
    "storyboard" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Workspace_userId_updatedAt_idx" ON "Workspace"("userId","updatedAt")`,
  `CREATE INDEX IF NOT EXISTS "Workspace_userId_status_idx" ON "Workspace"("userId","status")`,

  `CREATE TABLE IF NOT EXISTS "AiModel" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
];

// 表名 → 读取与插入配置（按外键依赖顺序）
const TABLES = [
  "User",
  "Course",
  "Lesson",
  "LessonCompletion",
  "Enrollment",
  "GeneratedScript",
  "ToolUsage",
  "PlotDocument",
  "ChatMessage",
  "Workspace",
  "AiModel",
];

function escapeVal(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (typeof v === "number") return String(v);
  // 字符串：转义单引号
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function migrate() {
  console.log("→ 在 Turso 建表...");
  for (const ddl of DDL) {
    await turso.execute(ddl);
  }
  console.log("✅ 建表完成");

  let totalRows = 0;
  for (const table of TABLES) {
    const rows = await local[table.charAt(0).toLowerCase() + table.slice(1)].findMany();
    if (rows.length === 0) {
      console.log(`  ${table}: 0 行,跳过`);
      continue;
    }
    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    // 用 batch 插入（每批 50 行）；传 SQL 字符串数组，避免 args 缺失报错
    const stmts = rows.map(
      (r) =>
        `INSERT OR IGNORE INTO "${table}" (${colList}) VALUES (${cols
          .map((c) => escapeVal(r[c]))
          .join(", ")})`
    );
    for (let i = 0; i < stmts.length; i += 50) {
      await turso.batch(stmts.slice(i, i + 50), "write");
    }
    totalRows += rows.length;
    console.log(`  ${table}: ${rows.length} 行已导入`);
  }
  console.log(`✅ 迁移完成,共 ${totalRows} 行`);
}

migrate()
  .catch((e) => {
    console.error("迁移失败:", e);
    process.exit(1);
  })
  .finally(() => local.$disconnect());
