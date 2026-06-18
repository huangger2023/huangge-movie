# Task 4-a · fullstack-developer (script-generator + course-detail)

## 目标
实现两个核心视图组件：
1. `src/components/views/script-generator-view.tsx` — AI 完整电影解说文案生成器（平台核心特色功能）
2. `src/components/views/course-detail-view.tsx` — 课程详情页（含报名/课时展开/进度）

## 上下文读取
- 已读 `worklog.md`：项目全貌、设计系统（玫瑰红 + 琥珀金，禁靛蓝/蓝）、API 契约
- 已读 `src/lib/store.ts`：useAppStore(view/user/openCourse/setView/selectedCourseId/setUser)
- 已读 `src/components/site/course-card.tsx`：CourseItem 类型
- 已读 `src/app/globals.css`：工具类 .bg-cinema-radial .bg-grid-faint .text-gradient-primary .glass-card .shadow-glow-primary .scrollbar-thin .animate-shimmer
- 已读 `src/lib/ai.ts`：generateNarrationScript 输入字段；TTS_VOICES 列表
- 已读 `prisma/schema.prisma`：Course/Lesson/Enrollment/GeneratedScript 字段
- 已读 API routes：
  - POST /api/ai/script → { output, savedId }
  - POST /api/ai/tts → audio/mpeg blob
  - GET /api/courses/[id] → { course(with lessons), enrollment }
  - POST /api/enrollments { courseId } → { enrollment } | { already: true }
  - PATCH /api/scripts { id, isFavorite } → { success: true }

## 关键决策
- 表单 8 字段：movieTitle(genre/style/duration/hookType/tone 通过 Select)/keywords/extraNotes
- 结果区用 react-markdown v10 渲染，自定义 h2/h3/p/ul/li/hr 组件套 Tailwind 类（项目未装 @tailwindcss/typography）
- TTS：blob URL + <audio controls>；文案超长截取前 800 字；用 ref 管理 URL 防泄漏
- 报名：未登录 → toast + setView('auth')；已登录 → POST；成功重新 fetch 刷新 isEnrolled
- 课时展开：内部 state expandedLessonId；非 preview 且未报名 → toast 提示
- 入场动画统一 framer-motion initial/whileInView
- 响应式：lg:grid 两栏，移动端堆叠
- sticky footer 已由 page.tsx 主壳保证

## 输出
- 两个视图文件（顶部 "use client"）
- worklog.md 追加 Task 4-a 段落
