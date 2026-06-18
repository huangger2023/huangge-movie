"use client";

import * as React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Sparkles,
  Film,
  Wand2,
  Copy,
  Heart,
  RefreshCw,
  Volume2,
  Loader2,
  Clapperboard,
  Lightbulb,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const GENRES = ["剧情", "悬疑", "科幻", "爱情", "动作", "恐怖", "喜剧", "犯罪", "动画", "纪录片"];
const STYLES = ["悬疑反转", "情感共鸣", "速看爽文", "深度解读", "搞笑吐槽"];
const DURATIONS = ["60秒", "90秒", "3分钟", "5分钟"];
const HOOK_TYPES = ["悬念提问", "反差冲击", "情感代入", "数据震撼", "故事引入"];
const TONES = ["犀利", "温暖", "幽默", "神秘", "激情"];

const SAMPLE_MOVIES = [
  { title: "消失的她", genre: "悬疑" },
  { title: "肖申克的救赎", genre: "剧情" },
  { title: "盗梦空间", genre: "科幻" },
  { title: "你好，李焕英", genre: "喜剧" },
  { title: "无间道", genre: "犯罪" },
];

interface FormState {
  movieTitle: string;
  genre: string;
  style: string;
  duration: string;
  hookType: string;
  tone: string;
  keywords: string;
  extraNotes: string;
}

const DEFAULT_FORM: FormState = {
  movieTitle: "",
  genre: "悬疑",
  style: "悬疑反转",
  duration: "90秒",
  hookType: "悬念提问",
  tone: "犀利",
  keywords: "",
  extraNotes: "",
};

export function ScriptGeneratorView() {
  const user = useAppStore((s) => s.user);
  const setView = useAppStore((s) => s.setView);

  const [form, setForm] = React.useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [isFav, setIsFav] = React.useState(false);
  const [ttsLoading, setTtsLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioUrlRef = React.useRef<string | null>(null);

  // 清理 blob URL 防内存泄漏
  React.useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.movieTitle.trim()) {
      toast.error("请先填写电影名称");
      return;
    }
    setLoading(true);
    setResult(null);
    setSavedId(null);
    setIsFav(false);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
      setAudioUrl(null);
    }
    try {
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieTitle: form.movieTitle.trim(),
          genre: form.genre,
          style: form.style,
          duration: form.duration,
          hookType: form.hookType,
          tone: form.tone,
          keywords: form.keywords.trim() || undefined,
          extraNotes: form.extraNotes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "生成失败");
      }
      const data = (await res.json()) as { output: string; savedId: string | null };
      setResult(data.output);
      setSavedId(data.savedId);
      toast.success("文案生成成功！", {
        description: data.savedId ? "已自动保存到你的创作历史" : "登录后可保存到历史",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败，请手动选择文本");
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.info("请先登录后再收藏", {
        description: "登录后可永久保存文案到创作历史",
        action: { label: "去登录", onClick: () => setView("auth") },
      });
      return;
    }
    if (!savedId) {
      toast.info("该文案未保存，无法收藏");
      return;
    }
    const next = !isFav;
    try {
      const res = await fetch("/api/scripts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId, isFavorite: next }),
      });
      if (!res.ok) throw new Error("操作失败");
      setIsFav(next);
      toast.success(next ? "已收藏" : "已取消收藏");
    } catch {
      toast.error("操作失败，请重试");
    }
  };

  const handleTTS = async () => {
    if (!result) return;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
      setAudioUrl(null);
    }
    setTtsLoading(true);
    try {
      const text = result.replace(/[#*>`\-]/g, "").replace(/\s+/g, " ").trim().slice(0, 800);
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "tongtong", speed: 1.0 }),
      });
      if (!res.ok) throw new Error("语音合成失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      setAudioUrl(url);
      toast.success("语音已生成，可播放试听");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "语音合成失败");
    } finally {
      setTtsLoading(false);
    }
  };

  const fillSample = (title: string, genre: string) => {
    setForm((p) => ({ ...p, movieTitle: title, genre }));
    toast.success(`已填入《${title}》`, { description: "可点击生成按钮立即创作" });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 bg-cinema-radial" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* 顶部标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Badge className="gap-1.5 border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              平台核心特色
            </Badge>
          </div>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-gradient-primary">AI 独家文案生成器</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            输入电影信息与创作参数，AI 依据千万播放操盘经验，10
            分钟产出结构完整的爆款解说文案——黄金3秒开头、高密度反转、互动金句结尾一站式搞定。
          </p>
        </motion.div>

        {/* 主体两栏 */}
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          {/* 左：表单区 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card overflow-hidden p-6">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clapperboard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">创作参数</h2>
                  <p className="text-xs text-muted-foreground">填写后点击生成，AI 即刻创作</p>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="电影名称" required>
                  <Input
                    value={form.movieTitle}
                    onChange={(e) => updateField("movieTitle", e.target.value)}
                    placeholder="例如：消失的她"
                    className="h-10"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="电影类型">
                    <SelectField
                      value={form.genre}
                      onChange={(v) => updateField("genre", v)}
                      options={GENRES}
                    />
                  </Field>
                  <Field label="解说风格">
                    <SelectField
                      value={form.style}
                      onChange={(v) => updateField("style", v)}
                      options={STYLES}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="视频时长">
                    <SelectField
                      value={form.duration}
                      onChange={(v) => updateField("duration", v)}
                      options={DURATIONS}
                    />
                  </Field>
                  <Field label="黄金3秒钩子">
                    <SelectField
                      value={form.hookType}
                      onChange={(v) => updateField("hookType", v)}
                      options={HOOK_TYPES}
                    />
                  </Field>
                </div>

                <Field label="解说语气">
                  <SelectField
                    value={form.tone}
                    onChange={(v) => updateField("tone", v)}
                    options={TONES}
                  />
                </Field>

                <Field label="关键词" hint="可选，多个用空格分隔">
                  <Input
                    value={form.keywords}
                    onChange={(e) => updateField("keywords", e.target.value)}
                    placeholder="例如：反转 亲情 真相"
                    className="h-10"
                  />
                </Field>

                <Field label="补充要求" hint="可选">
                  <Textarea
                    value={form.extraNotes}
                    onChange={(e) => updateField("extraNotes", e.target.value)}
                    placeholder="例如：突出男主的心理变化，结尾留开放式悬念…"
                    className="min-h-[80px] resize-none"
                  />
                </Field>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  size="lg"
                  className={cn(
                    "h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-accent",
                    "text-base font-semibold text-primary-foreground shadow-glow-primary",
                    "transition-all hover:opacity-95 active:scale-[0.99]"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      AI 创作中…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      生成独家精选文案
                    </>
                  )}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  {user ? `当前账号：${user.name}` : "未登录也可体验，登录后可保存历史"}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* 右：结果区 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="glass-card flex min-h-[600px] flex-col overflow-hidden">
              {loading ? (
                <ResultSkeleton />
              ) : result ? (
                <ResultPanel
                  result={result}
                  isFav={isFav}
                  savedId={savedId}
                  ttsLoading={ttsLoading}
                  audioUrl={audioUrl}
                  isLoggedIn={!!user}
                  onCopy={handleCopy}
                  onFavorite={handleFavorite}
                  onRegenerate={handleGenerate}
                  onTTS={handleTTS}
                />
              ) : (
                <EmptyState onPick={fillSample} />
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 子组件 ---------- */

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-medium text-foreground/80">
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({ onPick }: { onPick: (title: string, genre: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
      >
        <Film className="h-10 w-10 text-primary" />
      </motion.div>
      <h3 className="text-lg font-semibold">还没有生成文案</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        在左侧填写电影信息与创作参数，点击「生成独家精选文案」即可。也可以试试这些经典影片：
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {SAMPLE_MOVIES.map((m) => (
          <button
            key={m.title}
            onClick={() => onPick(m.title, m.genre)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Star className="h-3 w-3 text-accent" />
            {m.title}
          </button>
        ))}
      </div>
      <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-3">
        {[
          { icon: Lightbulb, label: "黄金3秒开头" },
          { icon: Wand2, label: "高密度反转" },
          { icon: Sparkles, label: "互动金句结尾" },
        ].map((f) => (
          <div key={f.label} className="rounded-lg border border-border/40 bg-muted/30 p-3">
            <f.icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
            <p className="text-[10px] leading-tight text-muted-foreground">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        AI 正在精心创作，请稍候…
      </div>
      <div className="relative space-y-4 overflow-hidden">
        <Skeleton className="relative h-7 w-2/5 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
        <Skeleton className="relative h-4 w-full overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
        <Skeleton className="relative h-4 w-11/12 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
        <Skeleton className="relative h-4 w-full overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
        <Skeleton className="relative h-7 w-1/3 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
        <Skeleton className="relative h-4 w-full overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
        <Skeleton className="relative h-4 w-10/12 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
        <Skeleton className="relative h-4 w-full overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </Skeleton>
      </div>
    </div>
  );
}

function ResultPanel({
  result,
  isFav,
  savedId,
  ttsLoading,
  audioUrl,
  isLoggedIn,
  onCopy,
  onFavorite,
  onRegenerate,
  onTTS,
}: {
  result: string;
  isFav: boolean;
  savedId: string | null;
  ttsLoading: boolean;
  audioUrl: string | null;
  isLoggedIn: boolean;
  onCopy: () => void;
  onFavorite: () => void;
  onRegenerate: () => void;
  onTTS: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-card/40 p-3">
        <div className="mr-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          创作完成
        </div>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2.5" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">复制全文</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={cn("h-8 gap-1.5 px-2.5", isFav && "text-primary")}
          onClick={onFavorite}
          disabled={!savedId && isLoggedIn}
          title={isLoggedIn ? (isFav ? "取消收藏" : "收藏") : "登录后可收藏"}
        >
          <Heart className={cn("h-3.5 w-3.5", isFav && "fill-primary")} />
          <span className="hidden sm:inline">{isFav ? "已收藏" : "收藏"}</span>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2.5" onClick={onTTS} disabled={ttsLoading}>
          {ttsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{ttsLoading ? "合成中" : "试听语音"}</span>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2.5" onClick={onRegenerate}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">重新生成</span>
        </Button>
      </div>

      {/* 试听播放器 */}
      {audioUrl && (
        <div className="border-b border-border/60 bg-primary/5 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Volume2 className="h-3.5 w-3.5" />
            语音试听（前800字）
          </div>
          { }
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      {/* Markdown 文案 */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-5 sm:p-6">
        <div className="rounded-xl border-l-2 border-primary bg-card/40 p-5">
          <Markdown content={result} />
        </div>
      </div>
    </div>
  );
}

function Markdown({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed text-foreground/90">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 flex items-center gap-2 border-b border-border/50 pb-2 text-base font-bold text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-sm font-semibold text-primary">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-3 leading-7 text-foreground/85">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-7 text-foreground/85">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-accent pl-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-border/50" />,
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
