"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Sparkles,
  ArrowRight,
  Film,
  BookOpen,
  GraduationCap,
  Compass,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard, type CourseItem } from "@/components/site/course-card";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const CATEGORIES = ["全部", "入门", "进阶", "实战", "高阶", "运营"];
const LEVELS = ["全部", "初级", "中级", "高级"];

export function CoursesView() {
  const setView = useAppStore((s) => s.setView);
  const [category, setCategory] = React.useState("全部");
  const [level, setLevel] = React.useState("全部");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Debounce search input -> search query
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch courses when filters change
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "全部") params.set("category", category);
    if (level !== "全部") params.set("level", level);
    if (search) params.set("search", search);
    fetch(`/api/courses?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setCourses(Array.isArray(d.courses) ? d.courses : []);
      })
      .catch(() => {
        if (cancelled) return;
        setCourses([]);
        toast.error("课程加载失败，请稍后重试");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, level, search]);

  const hasActiveFilters =
    category !== "全部" || level !== "全部" || search !== "";

  const clearFilters = () => {
    setCategory("全部");
    setLevel("全部");
    setSearchInput("");
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-cinema-radial" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge
            variant="outline"
            className="mb-4 gap-1.5 border-primary/30 bg-primary/10 px-3 py-1 text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            系统课程 · 真实操盘
          </Badge>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            课程<span className="text-gradient-primary">中心</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            从零基础入门到高阶运营变现，覆盖电影解说创作全链路的系统课程
          </p>
        </motion.div>

        {/* Learning path banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-8"
        >
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5">
            <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-primary">
                <Compass className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold">
                  不知道从哪里开始？
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  试试 AI 文案生成器，10 分钟产出你的第一条爆款解说文案，边练边学更快上手。
                </p>
              </div>
              <Button
                onClick={() => setView("script-generator")}
                className="shrink-0 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" />
                立即体验
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-8 space-y-4"
        >
          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              分类
            </span>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </Chip>
            ))}
          </div>

          {/* Level chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              难度
            </span>
            {LEVELS.map((l) => (
              <Chip
                key={l}
                active={level === l}
                onClick={() => setLevel(l)}
              >
                {l}
              </Chip>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索课程名称、讲师…"
                className="pl-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="清除搜索"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 gap-1.5 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
                清除筛选
              </Button>
            )}
          </div>
        </motion.div>

        {/* Count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              "加载中…"
            ) : (
              <>
                共 <span className="font-semibold text-foreground">{courses.length}</span>{" "}
                门课程
              </>
            )}
          </p>
        </div>

        {/* Grid */}
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))
          ) : courses.length === 0 ? (
            <div className="col-span-full">
              <Card className="flex flex-col items-center justify-center gap-4 border-dashed px-6 py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
                  <Film className="h-9 w-9 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-semibold">
                    没有找到相关课程
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {hasActiveFilters
                      ? "试试调整筛选条件，或换个关键词搜索"
                      : "敬请期待，新课程正在筹备中"}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-1 gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    清除全部筛选
                  </Button>
                )}
              </Card>
            </div>
          ) : (
            courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.4) }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
