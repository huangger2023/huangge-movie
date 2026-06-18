"use client";

import * as React from "react";
import { toast } from "sonner";

export interface SSESource {
  name: string;
  url: string;
  host: string;
  snippet: string;
}

export interface SSESearchResult {
  sources: SSESource[];
  snippets: string;
  fullPlot: string;
  combined: string;
  readSource: { name: string; url: string } | null;
  savedPlotId: string | null;
  searchedAt: string;
}

export interface SSEStage {
  stage: "search" | "read" | "done";
  status: "running" | "done";
  source?: string;
  url?: string;
  movieTitle?: string;
}

interface UseSSEAgentSearchReturn {
  searching: boolean;
  result: SSESearchResult | null;
  sources: SSESource[];
  stage: SSEStage | null;
  error: string | null;
  search: (movieTitle: string, genre?: string) => Promise<SSESearchResult | null>;
  reset: () => void;
}

/**
 * SSE 流式联网搜索真实剧情 hook
 * 用于 script-generator 和 tools-view 的 Agent 协作模式
 */
export function useSSEAgentSearch(): UseSSEAgentSearchReturn {
  const [searching, setSearching] = React.useState(false);
  const [result, setResult] = React.useState<SSESearchResult | null>(null);
  const [sources, setSources] = React.useState<SSESource[]>([]);
  const [stage, setStage] = React.useState<SSEStage | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const search = React.useCallback(
    async (movieTitle: string, genre?: string): Promise<SSESearchResult | null> => {
      if (!movieTitle.trim()) {
        toast.error("请先填写电影名称");
        return null;
      }
      setSearching(true);
      setError(null);
      setResult(null);
      setSources([]);
      setStage({ stage: "search", status: "running", movieTitle });

      return new Promise<SSESearchResult | null>((resolve) => {
        try {
          const es = new EventSource(
            `/api/agent/search/stream?movieTitle=${encodeURIComponent(movieTitle)}&genre=${encodeURIComponent(genre || "")}`,
            { withCredentials: true }
          );

          // 注意：EventSource 只支持 GET，但我们的 API 是 POST。
          // 改用 fetch + ReadableStream 解析 SSE
          es.close(); // 立即关闭，改用 fetch

          fetch("/api/agent/search/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieTitle: movieTitle.trim(), genre }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "搜索失败");
              }
              const reader = res.body?.getReader();
              if (!reader) throw new Error("无法读取流");
              const decoder = new TextDecoder();
              let buffer = "";
              let finalResult: SSESearchResult | null = null;

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                // 按双换行分割事件
                const events = buffer.split("\n\n");
                buffer = events.pop() || "";
                for (const evtStr of events) {
                  if (!evtStr.trim()) continue;
                  let eventType = "message";
                  let dataStr = "";
                  for (const line of evtStr.split("\n")) {
                    if (line.startsWith("event: ")) eventType = line.slice(7).trim();
                    else if (line.startsWith("data: ")) dataStr += line.slice(6);
                  }
                  if (!dataStr) continue;
                  let data: unknown;
                  try {
                    data = JSON.parse(dataStr);
                  } catch {
                    continue;
                  }
                  // 处理事件
                  if (eventType === "stage") {
                    const s = data as SSEStage;
                    setStage(s);
                  } else if (eventType === "sources") {
                    const d = data as { sources: SSESource[]; snippets: string; count: number };
                    setSources(d.sources);
                    setStage({ stage: "read", status: "running" });
                    toast.success(`已搜索到 ${d.count} 个真实剧情来源`, {
                      description: "正在深度读取最优先来源…",
                    });
                  } else if (eventType === "fullplot") {
                    const d = data as {
                      fullPlot: string;
                      readSource: { name: string; url: string } | null;
                      skipped: boolean;
                    };
                    if (d.skipped) {
                      toast.info("深度读取失败，使用搜索摘要作为剧情参考");
                    } else if (d.readSource) {
                      toast.success(`已深度读取《${d.readSource.name}》`, {
                        description: `${d.fullPlot.length} 字真实剧情`,
                      });
                    }
                  } else if (eventType === "done") {
                    finalResult = data as SSESearchResult;
                    setResult(finalResult);
                    setStage({ stage: "done", status: "done" });
                    toast.success("Agent 联网搜索完成", {
                      description: `${finalResult.sources.length} 来源 · ${finalResult.combined.length} 字真实剧情`,
                    });
                  } else if (eventType === "error") {
                    const d = data as { message: string };
                    setError(d.message);
                    toast.error(d.message);
                  }
                }
              }
              resolve(finalResult);
            })
            .catch((e) => {
              const msg = e instanceof Error ? e.message : "联网搜索失败";
              setError(msg);
              toast.error(msg);
              resolve(null);
            });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "联网搜索失败";
          setError(msg);
          toast.error(msg);
          resolve(null);
        }
      }).finally(() => {
        setSearching(false);
      });
    },
    []
  );

  const reset = React.useCallback(() => {
    setResult(null);
    setSources([]);
    setStage(null);
    setError(null);
  }, []);

  return { searching, result, sources, stage, error, search, reset };
}
