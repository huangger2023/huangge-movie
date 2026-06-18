import { NextRequest } from "next/server";
import {
  searchMoviePlotStage1,
  searchMoviePlotStage2,
} from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * SSE 流式联网搜索电影真实剧情
 *
 * 推送事件序列：
 * 1. event: stage  data: {"stage":"search","status":"running"}
 * 2. event: sources  data: {"sources":[...],"snippets":"...","count":6}
 * 3. event: stage  data: {"stage":"read","status":"running","source":"百度百科"}
 * 4. event: fullplot  data: {"fullPlot":"...","readSource":{"name":"...","url":"..."}}
 * 5. event: done  data: {"combined":"...","savedPlotId":"..."}
 * （失败时）event: error  data: {"message":"..."}
 */
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // controller may already be closed
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      try {
        const { movieTitle, genre } = await req.json();
        if (!movieTitle?.trim()) {
          send("error", { message: "请填写电影名称" });
          close();
          return;
        }

        // === 阶段1：web_search ===
        send("stage", { stage: "search", status: "running", movieTitle });

        const stage1 = await searchMoviePlotStage1(movieTitle.trim(), genre);

        send("sources", {
          sources: stage1.sources,
          snippets: stage1.snippets,
          count: stage1.sources.length,
        });

        // === 阶段2：page_reader 深度读取 ===
        // 选最优先来源告知前端
        const hostPriority = [
          "baike.baidu",
          "zhuanlan.zhihu",
          "movie.douban",
          "douban",
          "zhihu",
        ];
        const ranked = [...stage1.rawResults].sort((a, b) => {
          const aIdx = hostPriority.findIndex((h) => a.host_name.includes(h));
          const bIdx = hostPriority.findIndex((h) => b.host_name.includes(h));
          return (aIdx >= 0 ? aIdx : 99) - (bIdx >= 0 ? bIdx : 99);
        });
        const readCandidate = ranked[0];
        send("stage", {
          stage: "read",
          status: "running",
          source: readCandidate?.name || "无可用来源",
          url: readCandidate?.url,
        });

        const stage2 = await searchMoviePlotStage2(stage1);

        send("fullplot", {
          fullPlot: stage2.fullPlot,
          readSource: stage2.readSource,
          skipped: !stage2.fullPlot,
        });

        // === 组合最终结果 ===
        const combined = [
          stage2.fullPlot ? `=== 深度读取全文 ===\n${stage2.fullPlot}` : "",
          `=== 搜索摘要 ===\n${stage1.snippets}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        // 自动保存为剧情文档（已登录用户）
        const user = await getCurrentUser();
        let savedPlotId: string | null = null;
        if (user && combined.length > 100) {
          const existing = await db.plotDocument.findFirst({
            where: {
              userId: user.id,
              movieTitle: movieTitle.trim(),
              source: "web",
            },
          });
          if (existing) {
            await db.plotDocument.update({
              where: { id: existing.id },
              data: {
                content: combined,
                wordCount: combined.length,
              },
            });
            savedPlotId = existing.id;
          } else {
            const doc = await db.plotDocument.create({
              data: {
                userId: user.id,
                movieTitle: movieTitle.trim(),
                content: combined,
                source: "web",
                wordCount: combined.length,
              },
            });
            savedPlotId = doc.id;
          }
        }

        send("done", {
          movieTitle,
          snippets: stage1.snippets,
          fullPlot: stage2.fullPlot,
          combined,
          sources: stage1.sources,
          savedPlotId,
          searchedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error("agent search stream error", e);
        send("error", {
          message: e instanceof Error ? e.message : "联网搜索剧情失败",
        });
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
