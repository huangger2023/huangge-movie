import { PrismaClient } from '@prisma/client'

/**
 * Vercel serverless 环境下 SQLite 数据库路径兜底。
 *
 * 问题背景：
 * - 数据库文件 db/custom.db 通过 outputFileTracingIncludes 打包进 lambda，
 *   运行时位于 /var/task/db/custom.db（诊断已确认存在）。
 * - Vercel 项目的 DATABASE_URL 环境变量在 Windows 用 echo 管道添加时
 *   会被 CRLF 污染（末尾带 \r\n），导致 Prasma 解析路径失败报 SQLITE_CANTOPEN。
 * - 这里在创建 PrismaClient 前确保 DATABASE_URL 指向干净的绝对路径。
 */
if (process.env.VERCEL) {
  const raw = process.env.DATABASE_URL ?? '';
  const trimmed = raw.trim();
  // 缺失、或经过 CRLF/空格污染后与干净值不符 → 用绝对路径覆盖
  if (!trimmed || trimmed !== raw || !trimmed.startsWith('file:')) {
    process.env.DATABASE_URL = 'file:/var/task/db/custom.db';
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
