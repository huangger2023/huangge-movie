import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// 学员创作展示墙：取最近的 AI 生成文案，展示真实创作成果
export async function GET() {
  try {
    const scripts = await db.generatedScript.findMany({
      where: {
        type: { in: ["SCRIPT", "TITLE", "HOOK"] },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        type: true,
        movieTitle: true,
        genre: true,
        output: true,
        createdAt: true,
        isFavorite: true,
        user: {
          select: { name: true },
        },
      },
    });

    // 脱敏：只返回摘要 + 类型 + 电影名 + 作者名首字
    const items = scripts.map((s) => {
      const out = s.output || "";
      // 提取第一段有意义的文案作为摘要
      let excerpt = "";
      const lines = out.split("\n").filter((l) => l.trim() && !/^#{1,6}\s/.test(l) && !/^#/.test(l));
      if (s.type === "SCRIPT") {
        // 取黄金3秒开头那一段的实际内容（跳过标题行）
        const allLines = out.split("\n");
        const hookLineIdx = allLines.findIndex((l) => /黄金3秒|黄金.*开头/.test(l));
        if (hookLineIdx >= 0) {
          // 找标题行之后的第一个非空非标题行
          for (let j = hookLineIdx + 1; j < allLines.length; j++) {
            const l = allLines[j].trim();
            if (l && !/^#{1,6}\s/.test(l) && !/^#/.test(l)) {
              excerpt = l.replace(/^[🎬📖💬🏷️📌\s]*/, "").slice(0, 80);
              break;
            }
          }
        }
        if (!excerpt) excerpt = (lines[0] || "").slice(0, 80);
      } else if (s.type === "TITLE") {
        // 取第一条标题
        const m = out.match(/\d+\.\s*(.+)/);
        excerpt = m ? m[1].slice(0, 60) : (lines[0] || "").slice(0, 60);
      } else {
        excerpt = (lines[0] || "").slice(0, 60);
      }
      return {
        id: s.id,
        type: s.type,
        movieTitle: s.movieTitle,
        genre: s.genre,
        excerpt: excerpt || "（内容预览）",
        createdAt: s.createdAt,
        author: s.user?.name ? s.user.name.slice(0, 1) + "**" : "匿名",
        isFavorite: s.isFavorite,
      };
    });

    return NextResponse.json({ items, total: items.length });
  } catch (e) {
    console.error("showcase error", e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
