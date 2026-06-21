import { defineConfig } from "prisma/config";

/**
 * Prisma CLI 配置（Prisma 6 方式）。
 * 给 prisma db push / generate 等 CLI 命令提供 Turso(libSQL) 的 datasource url。
 * 运行时由 src/lib/db.ts 通过 @prisma/adapter-libsql 连接，不依赖这里的配置。
 *
 * Turso 的 URL 形如 libsql://xxx.turso.io，token 通过 ?authToken= 拼接。
 */
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: tursoUrl
      ? `${tursoUrl}?authToken=${tursoToken}`
      : "file:./db/custom.db",
  },
});
