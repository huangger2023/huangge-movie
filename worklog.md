# 影述学院 · 抖音电影解说知识付费平台 — 工作日志

> 本项目是一个专注抖音电影解说创作教学的知识付费网站，核心特色是 AI 生成独家精选文案 + 自研辅助创作工具链（爆款标题、黄金开头、文案润色、语音试听）。

## 技术栈
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- Prisma (SQLite) + z-ai-web-dev-sdk (LLM / TTS / image-generation / web-search)
- Zustand (客户端 SPA 视图状态) + Framer Motion 动画
- 单 `/` 路由，通过 Zustand store 切换视图 (home/courses/course-detail/script-generator/tools/dashboard/admin/auth)

## 设计系统
- 主题：电影感深色为主，玫瑰红 (primary) + 琥珀金 (accent)，禁用靛蓝/蓝
- globals.css 已定义 `.bg-cinema-radial` `.bg-grid-faint` `.text-gradient-primary` `.glass-card` `.shadow-glow-primary` 等工具类
- 默认 dark 主题，支持 light 切换 (next-themes)

## 数据库 Schema (prisma/schema.prisma)
- User (role: STUDENT|ADMIN), Course, Lesson, Enrollment, GeneratedScript, ToolUsage
- 已 seed：1 admin (admin@yingshu.com / admin123)、1 demo 学生 (demo@yingshu.com / 123456)、6 门课程 + 课时、demo 生成历史

## 已完成 (Task 1-3, 主控 Agent)
- Prisma schema + seed 数据
- 设计系统 globals.css (玫瑰/琥珀电影感)
- layout.tsx (ThemeProvider + Sonner + Toaster)
- Zustand store (src/lib/store.ts): view 切换 / openCourse / user
- AI lib (src/lib/ai.ts): generateNarrationScript / generateTitles / generateHook / polishScript / generateTTS + TTS_VOICES
- auth lib (src/lib/auth.ts): cookie session getCurrentUser/setSession/clearSession
- API 路由:
  - /api/ai/script | title | hook | polish | tts (POST)
  - /api/courses (GET list, POST create) / /api/courses/[id] (GET, PUT, DELETE)
  - /api/scripts (GET 历史, PATCH 收藏, DELETE)
  - /api/auth (GET me, POST 登录注册, DELETE 登出)
  - /api/enrollments (POST 报名, PATCH 进度)
- 7 张 AI 生成电影感封面图 (public/covers/)
- 共享组件: header (导航+用户菜单+移动端Sheet) / footer / theme-toggle / course-card
- 主页 home-view 已完整实现 (Hero + 数据 + AI工具 + 精选课程 + 学习路径 + 为什么选我们 + 学员证言 + CTA)
- page.tsx 主壳: 用户 session 同步 + 视图路由 + Header/Footer + sticky footer (min-h-screen flex flex-col)

## 视图路由约定
所有视图组件位于 `src/components/views/<name>-view.tsx`，导出命名组件，**无 props**，通过 `useAppStore` 读取 view/user/openCourse/setView。视图自行 fetch API。
page.tsx 已用 switch 渲染各视图，并包了 Suspense。

## 共享 UI / 工具
- shadcn/ui 全套在 `src/components/ui/`（button/card/badge/dialog/sheet/tabs/select/input/textarea/progress/tabs/dropdown-menu/sonner 等）
- `src/components/site/course-card.tsx` 导出 `CourseCard` 与 `CourseItem` 类型
- `src/lib/utils.ts` 提供 `cn`
- `useAppStore` 来自 `@/lib/store`，提供 view/setView/user/setUser/openCourse/selectedCourseId/selectTool/logout
- 提示用 `sonner` 的 `toast`（已配 SonnerToaster）
- 视图文件必须 `"use client"` 顶部声明

## 待办视图 (将分配给 subagent)
- script-generator-view (核心: AI 完整解说文案生成器) — Task 4-a
- course-detail-view (课程详情 + 报名 + 课时播放) — Task 4-a
- tools-view (爆款标题 / 黄金开头 / 文案润色 / 语音试听 4合一) — Task 4-b
- courses-view (课程中心筛选列表) — Task 4-b
- dashboard-view (我的学习 + 生成历史 + 工具用量) — Task 4-c
- admin-view (管理员课程上传/管理) — Task 4-c
- auth-view (登录/注册) — Task 4-c

---
Task ID: 1-3
Agent: 主控 Agent (Z.ai Code)
Task: 搭建知识付费平台地基 (DB/设计/API/共享组件/主页/路由壳)

Work Log:
- 设计并 push Prisma schema，运行 seed 脚本写入 6 门课程 + 课时 + 2 用户 + demo 历史
- 编写电影感设计系统 globals.css (玫瑰/琥珀/玻璃态/渐变文字/光晕阴影)
- 创建 Zustand store 实现 SPA 视图切换
- 编写 src/lib/ai.ts 封装 LLM 文案生成 / TTS，所有 AI 调用走后端
- 编写 11 个 API 路由覆盖 AI 工具 / 课程 CRUD / 报名 / 鉴权 / 历史
- 生成 7 张电影感封面图 (1 hero + 6 课程封面)
- 实现 header(响应式导航+用户菜单+移动端抽屉) / footer(四栏链接+版权) / theme-toggle
- 实现 course-card 共享组件 (封面+评分+学员数+标签+价格+已报名状态)
- 完整实现 home-view (Hero/数据/AI工具/精选课程/学习路径/为什么选我们/证言/CTA)
- page.tsx 主壳含 session 同步 + 视图路由 + sticky footer

Stage Summary:
- 地基完成，主页可正常访问，API 全部联通
- 已为 7 个待开发视图创建占位组件，page.tsx 可编译运行
- 下一步由 3 个 subagent 并行开发剩余视图

---
Task ID: 4-a
Agent: full-stack-developer (script-generator + course-detail)
Task: 实现 AI 文案生成器视图 + 课程详情视图

Work Log:
- 读取 worklog.md / store.ts / course-card.tsx / globals.css / ai.ts / prisma schema / 全部相关 API 路由，确认契约与设计系统
- 创建 /agent-ctx/4-a-fullstack-developer.md 记录上下文与关键决策
- 实现 src/components/views/script-generator-view.tsx：
  - 顶部标题区（渐变文字标题 + 平台核心特色 badge + 副标题）
  - 左栏表单（lg:col-span-2）：电影名称/类型/解说风格/视频时长/黄金3秒钩子/解说语气/关键词/补充要求，渐变生成按钮带 loading spinner
  - 右栏结果区（lg:col-span-3）：空状态（5 个示例电影快捷按钮 + 3 特色卡）/ 骨架屏 + animate-shimmer / react-markdown 渲染（自定义 h2/h3/p/ul/li/strong/blockquote/code 组件，玫瑰色左边线卡片）
  - 工具栏：复制全文 / 收藏（未登录 toast 提示去登录，已登录 PATCH /api/scripts）/ 重新生成 / 试听语音（POST /api/ai/tts 取前800字，blob URL + audio 播放，useRef 管理 URL 防泄漏）
  - framer-motion 入场动画 + 玻璃态卡片 + 响应式两栏
- 实现 src/components/views/course-detail-view.tsx：
  - 读取 selectedCourseId，空则提示并返回课程中心
  - useEffect fetch GET /api/courses/{id}，loading 显示骨架
  - 返回按钮 setView('courses')
  - 左栏（lg:col-span-2）：大封面 + 渐变遮罩 + 标题叠加 / 讲师信息卡 / 课程介绍 / 课程亮点（highlights JSON 渲染带勾列表）/ 课程目录（lessons 可展开，试看 badge + 锁图标，未报名点击 toast 提示报名，已报名可看全部 content + videoUrl）
  - 右栏 sticky（lg:col-span-1）：报名卡（价格/原价划线/立即报名/已报名+进度条+继续学习）/ 课程信息（评分/学员/课时/时长/难度）/ 标签 / 收藏+分享（装饰）/ 学习保障
  - 报名逻辑：未登录 toast + setView('auth')；已登录 POST /api/enrollments，成功重新 fetch 刷新 isEnrolled
- 运行 bun run lint：0 errors，仅 6 个 unused eslint-disable 警告（与既有 home-view/course-card 一致的项目约定，保留）
- 检查 dev.log：项目编译通过（✓ Compiled in 282ms），未见与本任务相关错误（tools-view 的 z-ai-web-dev-sdk 客户端导入错误属 Task 4-b 范畴）

Stage Summary:
- 两个核心视图组件完整交付，ESLint 0 errors，编译通过
- AI 文案生成器作为平台核心特色做得精致：8 字段表单 + 渐变按钮 + shimmer 骨架 + markdown 渲染 + TTS 试听 + 收藏/复制/重新生成全工具链
- 课程详情页丰富有质感：封面遮罩 + sticky 报名卡 + 课时展开/锁定 + 进度条 + 继续学习，完整覆盖报名→学习闭环
- 完全遵循设计系统（玫瑰红/琥珀金/玻璃态/光晕/渐变文字）、响应式两栏、framer-motion 动画、sonner toast、lucide 图标
- 未触碰其他视图文件与路由，仅交付 4-a 范围内两个文件

---
Task ID: 4-b
Agent: full-stack-developer (tools + courses)
Task: 实现创作工具箱视图 + 课程中心视图

Work Log:
- 阅读 worklog.md / store.ts / course-card.tsx / globals.css / ai.ts / 各 API 路由，确认契约与设计系统
- 实现 tools-view.tsx：标题区 + 4 张入口卡片网格 + Tabs 切换（初始 tab 读 useAppStore.selectedTool，默认 title，切换时同步 selectTool）
- 4 个工具子组件，各自独立 state：
  - TitleTool：电影名/类型/数量(3-12, 默认8) → POST /api/ai/title，结果渲染编号列表卡片，每条带复制按钮 + 整体复制
  - HookTool：电影名/类型/钩子类型(5种)/数量(3-10, 默认5) → POST /api/ai/hook，每条开头独立卡片+序号 badge+复制按钮
  - PolishTool：电影名(可选)/润色目标(5种)/待润色文案(Textarea 必填) → POST /api/ai/polish，左右对比原文 vs 润色后(桌面两栏/移动堆叠)，润色后带复制
  - TtsTool：文案(Textarea, 截断1000字)/7 音色卡片网格选择/语速(0.5-2.0 步长0.1, 默认1.0) → POST /api/ai/tts，blob→URL.createObjectURL，audio 播放器 + 下载按钮，useEffect 清理 revoke 旧 URL
- 用 Radix Tabs forceMount + hidden/data-[state=active]:block 模式保留各工具 state（切换 tab 不丢结果）
- 共享辅助组件：CopyButton / ToolShell(表单左 sticky + 结果右) / ResultPlaceholder / Field / GeneratingSkeleton / parseNumberedItems
- 实现 courses-view.tsx：标题区 + 学习路径横幅(引导去 script-generator) + 分类 chips(6) + 难度 chips(4) + 搜索框(debounce 300ms) + 结果计数 + 课程网格(3/2/1 列)
- fetch GET /api/courses?category=&level=&search=，筛选变化重新 fetch，loading 显示骨架卡片，空状态显示插画式空状态，hasActiveFilters 时显示"清除筛选"
- 复用 CourseCard 渲染，framer-motion 入场动画，电影感工具类(bg-cinema-radial / bg-grid-faint / text-gradient-primary / shadow-glow-primary / scrollbar-thin)
- 修复关键问题：tools-view 原本 import TTS_VOICES from @/lib/ai 导致客户端引入 server-only 的 z-ai-web-dev-sdk(用 fs/promises) 编译报错；改为在视图内本地镜像 TTS_VOICES 常量
- bun run lint：两个视图文件 0 error 0 warning；dev server 编译通过 GET / 200

Stage Summary:
- 产出 2 个视图文件：tools-view.tsx(4 合 1 创作工具箱) + courses-view.tsx(课程中心筛选列表)
- 关键决策 1：用 Tabs forceMount 保留各工具 state，切换不丢结果
- 关键决策 2：TTS_VOICES 在视图内本地镜像，避免客户端引入 server-only 模块（提示文档建议从 @/lib/ai import，但因 ai.ts 顶部有 "server-only" 且依赖 z-ai-web-dev-sdk 的 fs/path/os，客户端无法引入，故本地镜像）
- 关键决策 3：ToolShell 采用表单左 sticky + 结果右的两栏布局(桌面)，移动端堆叠，TTS blob URL 用 useEffect 清理避免内存泄漏
- 所有 API 调用走相对路径 fetch，loading 显示骨架/spinner，错误用 toast，成功用 toast，全部中文界面，响应式，通过 ESLint

---
Task ID: 4-c
Agent: full-stack-developer (dashboard + admin + auth)
Task: 实现登录注册视图 + 我的学习控制台 + 管理员后台

Work Log:
- 阅读 worklog / store / globals.css / course-card / API 路由 (/api/auth, /api/scripts, /api/courses, /api/courses/[id], /api/enrollments) 确认契约与设计系统
- 实现 auth-view.tsx：左右双栏布局（桌面端品牌介绍 + 表单卡，移动端只显表单），邮箱/姓名/密码三字段，登录/注册 tab 切换，POST /api/auth 自动注册逻辑，体验学员与管理员快捷填入按钮，已登录态展示用户卡 + 进入控制台/返回首页按钮，framer-motion 入场动画，.bg-cinema-radial + .glass-card + .shadow-glow-primary 电影感视觉
- 实现 dashboard-view.tsx：未登录引导卡；已登录后渲染欢迎条（首字母头像 + 姓名 + 邮箱 + 角色 badge + 三个快捷入口按钮），4 张数据卡（报名数 / 学习时长估算 / 生成文案数 / 工具使用次数 + 收藏数），Tabs 切换「我的课程」(filter isEnrolled===true 复用 CourseCard 网格 + 空状态) 与「生成历史」(类型筛选 chips + 卡片列表 + 展开/复制/删除/收藏切换 + 右侧 recharts 环形饼图按类型统计 + 图例)，AlertDialog 控制删除确认，optimistic update 收藏切换，scrollbar-thin 友好长列表
- 实现 admin-view.tsx：非管理员显示无权限卡 + 返回首页/去登录；管理员视图含顶部标题区 + 新建按钮 + 3 张统计卡（课程总数 / 累计学员 / 收入估算 sum price*students），Table 渲染课程列表（封面缩略 / 标题 / 分类 / 难度 badge / 价格 / 学员 / 精选 Crown / 编辑删除操作），Dialog 表单含 13 个字段（标题/副标题/描述/封面 6 预设缩略图 radio+自定义 URL/分类 Select/难度 Select/价格/原价/免费 Switch/精选 Switch/讲师/讲师简介/标签逗号分隔/亮点换行分隔），新建 POST /api/courses，编辑 PUT /api/courses/[id]，AlertDialog 二次确认后 DELETE
- 移除 admin-view 中 2 处冗余 eslint-disable 注释；移除 dashboard-view 未使用的 Star 导入
- 通过 bun run lint：3 个新文件 0 error 0 warning（剩余 6 warning 均在其他 agent 文件中）

Stage Summary:
- 3 个视图文件全部完成，覆盖登录注册全流程、学员个人中心、管理员课程 CRUD
- 统一使用电影感设计系统（玫瑰红 + 琥珀金渐变 / glass-card / shadow-glow-primary / bg-cinema-radial），与主页保持视觉一致
- 全部走 API 接口（POST /api/auth, GET /api/courses, GET /api/scripts, PATCH/DELETE /api/scripts, POST/PUT/DELETE /api/courses/[id]），无 server action
- 响应式：移动端单栏堆叠，桌面端多栏网格；表格 overflow-x-auto 横向滚动
- 交互完整：loading spinner、空状态引导、toast 反馈、optimistic 收藏切换、删除二次确认、framer-motion 入场动画
- ESLint 0 error，与已有组件/路由契约一致，可直接在 SPA 视图切换中调用
