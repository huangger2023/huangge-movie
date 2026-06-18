"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Film,
  Mail,
  User,
  Lock,
  Loader2,
  Sparkles,
  GraduationCap,
  Wand2,
  Users,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI 独家文案生成",
    desc: "10 分钟产出结构完整的爆款解说文案",
  },
  {
    icon: BookOpen,
    title: "系统实战课程",
    desc: "从选片定位到发布变现的全链路教学",
  },
  {
    icon: Wand2,
    title: "6 大创作工具",
    desc: "标题 / 开头 / 润色 / 配音全工具链",
  },
  {
    icon: Users,
    title: "活跃学员社群",
    desc: "导师答疑 + 同侪点评 + 资源共享",
  },
];

export function AuthView() {
  const { user, setUser, setView } = useAppStore();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const fillDemo = (kind: "student" | "admin") => {
    if (kind === "student") {
      setEmail("demo@yingshu.com");
      setPassword("123456");
    } else {
      setEmail("admin@yingshu.com");
      setPassword("admin123");
    }
    setName("");
    setMode("login");
    toast.info(`已填入${kind === "student" ? "体验学员" : "管理员"}账号`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("请输入邮箱");
      return;
    }
    if (mode === "register" && !name.trim()) {
      toast.error("注册时请填写昵称");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "登录失败");
        return;
      }
      setUser(data.user);
      toast.success(`欢迎${mode === "register" ? "加入" : "回来"}，${data.user.name}！`);
      setView("home");
    } catch {
      toast.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 已登录状态
  if (user) {
    return (
      <div className="relative min-h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-cinema-radial" />
        <div className="relative mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-glow-primary">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </div>
          </motion.div>
          <Card className="w-full glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">已登录</CardTitle>
              <CardDescription>
                你当前已登录账号，可前往控制台继续学习
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
                  {user.name.slice(0, 1)}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <Badge
                  className={
                    user.role === "ADMIN"
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                >
                  {user.role === "ADMIN" ? "管理员" : "学员"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setView("dashboard")}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  进入控制台
                </Button>
                <Button variant="outline" onClick={() => setView("home")}>
                  返回首页
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-cinema-radial" />
      <div className="absolute inset-0 bg-grid-faint opacity-30" />
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        {/* Left brand intro (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow-primary">
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">影述学院</div>
              <div className="text-xs text-muted-foreground">
                抖音电影解说创作平台
              </div>
            </div>
          </div>
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight">
            用 <span className="text-gradient-primary">AI 生成独家精选文案</span>
            <br />
            做出百万播放的电影解说
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            专注抖音电影解说创作教学。系统课程 + AI
            智能工具链，让每一位创作者都能跑通属于自己的爆款路径。
          </p>
          <div className="mt-8 grid gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3 backdrop-blur"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card shadow-glow-primary">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow">
                  <Film className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">影述学院</span>
              </div>
              <div className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    mode === "login"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    mode === "register"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  注册
                </button>
              </div>
              <CardTitle className="text-xl">
                {mode === "login" ? "欢迎回来" : "免费注册"}
              </CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "登录账号继续你的创作之旅"
                  : "输入邮箱即可一键注册，开启 AI 创作之旅"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    姓名
                    {mode === "register" && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={
                        mode === "register"
                          ? "你的昵称"
                          : "可选，新用户将作为昵称"
                      }
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="默认 123456"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    新邮箱将自动注册，老邮箱需校验密码。
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      处理中…
                    </>
                  ) : (
                    <>
                      {mode === "login" ? "登录" : "注册并登录"}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5">
                <div className="relative mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-[11px] text-muted-foreground">
                      快捷体验账号
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo("student")}
                    className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-medium">体验学员</span>
                      <span className="text-[10px] text-muted-foreground">
                        demo@yingshu.com
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("admin")}
                    className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-medium">管理员</span>
                      <span className="text-[10px] text-muted-foreground">
                        admin@yingshu.com
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
