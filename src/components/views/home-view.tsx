"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Type,
  Zap,
  Mic,
  PlayCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  Users,
  Quote,
  CheckCircle2,
  Film,
  Brain,
  Target,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseCard, type CourseItem } from "@/components/site/course-card";
import { useAppStore } from "@/lib/store";

const STATS = [
  { icon: Users, value: "12,800+", label: "累计学员" },
  { icon: TrendingUp, value: "1,200+", label: "爆款案例" },
  { icon: Star, value: "4.9/5", label: "学员评分" },
  { icon: Award, value: "6年", label: "赛道沉淀" },
];

const AI_TOOLS = [
  {
    icon: Sparkles,
    title: "AI 独家文案生成",
    desc: "输入电影信息与风格参数，10分钟产出结构完整的爆款解说文案，黄金3秒开头+高密度反转+互动金句结尾。",
    color: "from-rose-500 to-pink-500",
    view: "script-generator" as const,
  },
  {
    icon: Type,
    title: "爆款标题生成器",
    desc: "六大爆款标题公式，批量产出悬念型/反差型/数字型标题，告别想标题想到头秃。",
    color: "from-amber-500 to-orange-500",
    view: "tools" as const,
  },
  {
    icon: Zap,
    title: "黄金3秒开头",
    desc: "前3秒决定生死。5种钩子类型专属生成，一句话把观众死死钉在屏幕上。",
    color: "from-fuchsia-500 to-rose-500",
    view: "tools" as const,
  },
  {
    icon: Wand2,
    title: "文案润色神器",
    desc: "把平淡文案改造成爆款，增强转折词、画面感、情绪张力，让AI文案有人味。",
    color: "from-emerald-500 to-teal-500",
    view: "tools" as const,
  },
];

const STEPS = [
  {
    icon: Target,
    step: "01",
    title: "定位赛道",
    desc: "用「人群×情绪×风格」三角定位法，找到你的差异化解说人设。",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI生成文案",
    desc: "调用平台AI工具，10分钟产出独家精选解说文案、爆款标题、黄金开头。",
  },
  {
    icon: Mic,
    step: "03",
    title: "配音剪辑",
    desc: "手机也能配出电影级声线，3分钟剪出节奏感，声画双修出质感。",
  },
  {
    icon: Rocket,
    step: "04",
    title: "发布变现",
    desc: "标题封面标签流量密码+多元变现路径，跑通商业闭环。",
  },
];

const TESTIMONIALS = [
  {
    name: "阿凯解说",
    role: "影视赛道 · 38万粉",
    content:
      "跟着老陈学了两周，第一条视频就跑了50万播放。AI文案工具太香了，现在一天能产出3条高质量解说，效率直接翻了5倍。",
    avatar: "凯",
  },
  {
    name: "电影夜话",
    role: "悬疑赛道 · 12万粉",
    content:
      "最值的是AI文案大师课。以前写一条文案要2小时，现在10分钟出初稿再人工微调，质量还更高。回本太快了。",
    avatar: "夜",
  },
  {
    name: "小鹿看片",
    role: "情感赛道 · 65万粉",
    content:
      "黄金开头工具简直是救星。我的爆款开头基本都来自这里，完播率从35%涨到了52%，推荐所有做解说的都来用。",
    avatar: "鹿",
  },
];

export function HomeView() {
  const { setView } = useAppStore();
  const [courses, setCourses] = React.useState<CourseItem[]>([]);

  React.useEffect(() => {
    fetch("/api/courses?featured=1&limit=4")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cinema-radial" />
        <div className="absolute inset-0 bg-grid-faint opacity-40" />
        {/* Hero bg image */}
        <div className="pointer-events-none absolute inset-0">
          { }
          <img
            src="/covers/hero-bg.png"
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-5 gap-1.5 border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI 驱动 · 抖音电影解说创作平台
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl"
            >
              用 <span className="text-gradient-primary">AI 生成独家精选文案</span>
              <br />
              做出百万播放的电影解说
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              专注抖音电影解说创作教学。系统课程 + AI
              智能文案工具链，从选片定位到发布变现，让每一位创作者都能跑通属于自己的爆款路径。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button
                size="lg"
                onClick={() => setView("script-generator")}
                className="group h-12 rounded-full bg-gradient-to-r from-primary to-accent px-7 text-base text-primary-foreground shadow-glow-primary"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                立即体验 AI 文案生成
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView("courses")}
                className="h-12 rounded-full px-7 text-base"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                浏览全部课程
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 text-xs text-muted-foreground"
            >
              免费体验 AI 工具 · 300+ 学员已产出爆款 · 无需信用卡
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-2xl border border-border/60 p-5 text-center"
              >
                <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <div className="text-2xl font-bold tracking-tight">
                  {s.value}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI TOOLS SHOWCASE */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="核心特色"
          icon={Sparkles}
          title="AI 创作工具箱"
          subtitle="自己开发的辅助创作工具链，把单条文案产出时间从 2 小时压到 10 分钟"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AI_TOOLS.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card
                onClick={() => setView(tool.view)}
                className="group h-full cursor-pointer overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-primary"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} shadow-lg`}
                >
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">{tool.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tool.desc}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  立即使用
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="relative bg-card/30 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="精选课程"
              icon={Film}
              title="从入门到高阶的系统课"
              subtitle="每节课都源自真实操盘经验，学完就能直接落地"
              align="left"
            />
            <Button
              variant="ghost"
              onClick={() => setView("courses")}
              className="hidden shrink-0 sm:inline-flex"
            >
              查看全部
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.length > 0 ? (
              courses.map((c) => <CourseCard key={c.id} course={c} />)
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] animate-pulse rounded-xl bg-muted/40"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="学习路径"
          icon={Target}
          title="四步跑通爆款闭环"
          subtitle="清晰的成长路径，每一步都有对应课程和工具支撑"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative"
            >
              <Card className="h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold text-muted/40">
                    {s.step}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </Card>
              {i < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted/40 lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="relative bg-card/30 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="为什么选择我们"
              icon={Award}
              title="不止教方法，更给你工具"
              subtitle="市面上教电影解说的很多，但很少有平台同时提供 AI 创作工具链"
              align="left"
            />
            <ul className="mt-8 space-y-4">
              {[
                "AI 工具自主研发，持续迭代，永久免费给学员使用",
                "课程内容源自真实千万播放操盘经验，非纸上谈兵",
                "6大创作工具覆盖文案、标题、开头、润色、配音全链路",
                "社群答疑 + 1对1点评，确保每个学员都能出爆款",
                "多元变现路径指导，把内容能力转化为真金白银",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              onClick={() => setView("courses")}
              className="mt-8 h-12 rounded-full bg-gradient-to-r from-primary to-accent px-7 text-primary-foreground"
            >
              开始系统学习
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-5">
                <Quote className="mb-3 h-6 w-6 text-primary/30" />
                <p className="text-sm leading-relaxed text-foreground/90">
                  {t.content}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-accent text-accent"
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-cinema-radial" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            现在就开始你的{" "}
            <span className="text-gradient-primary">第一个百万播放</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            免费体验 AI 文案生成工具，感受 10 分钟产出爆款解说文案的效率革命。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => setView("auth")}
              className="h-12 rounded-full bg-gradient-to-r from-primary to-accent px-8 text-base text-primary-foreground shadow-glow-primary"
            >
              免费注册开始
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("tools")}
              className="h-12 rounded-full px-8 text-base"
            >
              探索创作工具
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div
        className={
          align === "center"
            ? "mb-3 flex items-center justify-center gap-2"
            : "mb-3 flex items-center gap-2"
        }
      >
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">{eyebrow}</span>
      </div>
      <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
    </div>
  );
}
