# Task 4-b — full-stack-developer (tools + courses)

## 任务
实现创作工具箱视图 (tools-view.tsx) + 课程中心视图 (courses-view.tsx)。

## 产出文件
- `/home/z/my-project/src/components/views/tools-view.tsx`
- `/home/z/my-project/src/components/views/courses-view.tsx`

## 关键决策
1. **Tabs forceMount 保留 state**：Radix Tabs 默认切走 unmount 会丢结果，用 `forceMount` + `className="hidden data-[state=active]:block"` 让 4 个工具常驻 DOM，切换 tab 不丢各自结果。
2. **TTS_VOICES 本地镜像**：提示说可从 `@/lib/ai` import TTS_VOICES，但 ai.ts 顶部有 `import "server-only"` 且依赖 z-ai-web-dev-sdk(用 fs/promises/path/os)，客户端组件引入会编译报错 Module not found。改为在 tools-view 内本地镜像 TTS_VOICES 常量数组。
3. **ToolShell 两栏布局**：表单左 `lg:sticky lg:top-20`，结果右，移动端堆叠。TTS blob URL 用 `useEffect` cleanup `URL.revokeObjectURL` 避免泄漏。
4. **parseNumberedItems**：用正则 `^\s*\d+\s*[.、)]\s*` 剥离编号前缀，把 LLM 编号列表拆成数组，逐条渲染复制按钮。

## API 调用契约
- POST `/api/ai/title` `{ movieTitle, genre, count }` → `{ output, savedId }`
- POST `/api/ai/hook` `{ movieTitle, genre, hookType, count }` → `{ output, savedId }`
- POST `/api/ai/polish` `{ movieTitle?, content, goal }` → `{ output, savedId }`
- POST `/api/ai/tts` `{ text, voice, speed }` → audio/mpeg blob（错误时返回 JSON `{ error }`，需先判 res.ok）
- GET `/api/courses?category=&level=&search=` → `{ courses: CourseItem[] }`（"全部" 不传参）

## 已验证
- `bun run lint`：两个视图文件 0 error 0 warning（其余 6 warning 来自其他 agent 的文件）
- dev server：编译通过，GET / 200，无 Module not found 错误
- page.tsx 已 wire：view === "tools" → ToolsView，view === "courses" → CoursesView

## 给后续 agent 的提示
- TTS_VOICES / GENRES / HOOK_TYPES / POLISH_GOALS 常量定义在 tools-view.tsx 顶部，若其他视图(如 dashboard)需要可考虑后续抽到共享 client-safe 常量文件。
- CourseItem 类型从 `@/components/site/course-card` 导出，可直接 import。
- courses API 返回的 course 已带 `isEnrolled` 字段，CourseCard 自动显示"已报名" badge。
