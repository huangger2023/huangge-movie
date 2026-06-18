# Task 4-c · full-stack-developer (dashboard + admin + auth)

## 任务范围
实现三个视图组件文件（覆盖 SPA 视图切换中的 auth / dashboard / admin 三态）：
- `src/components/views/auth-view.tsx` — 登录/注册页
- `src/components/views/dashboard-view.tsx` — 我的学习控制台
- `src/components/views/admin-view.tsx` — 管理员课程管理后台

## 关键决策

### 1. auth-view：单表单 + 自动注册
后端 `POST /api/auth` 已实现"邮箱不存在则注册、存在则校验密码"逻辑，因此前端不区分两套表单，仅用一个登录/注册 tab 切换控制文案与"姓名是否必填"提示，提交统一走 `/api/auth`。这样减少状态复杂度，同时保留视觉上的双模式体验。

### 2. dashboard-view：双 Tab + recharts 饼图
- "我的课程"：直接复用 `CourseCard`，前端 filter `isEnrolled===true`，无需新建 API。
- "生成历史"：右侧 sticky 侧栏放 recharts `PieChart`（环形）按 SCRIPT/TITLE/HOOK/POLISH/OUTLINE 类型统计调用次数，左侧类型筛选 chips + 卡片列表（展开全文/复制/删除/收藏切换）。
- 收藏切换用 optimistic update，失败回滚。
- 删除用单个 AlertDialog（受控 `deleteId`），避免每条记录各自挂一个 Dialog。

### 3. admin-view：表单 13 字段全量 CRUD
- 表单状态用单一 `CourseFormState` 对象 + `setForm` 函数式更新。
- 标签字段用逗号分隔字符串，亮点用换行分隔字符串，提交前 `formToBody` 转 array，编辑回填时 `courseToForm` 用 `JSON.parse` 还原。
- 封面图：6 个 `/covers/course-{1..6}.png` 预设缩略图 radio + 自定义 URL 输入双轨。
- 删除走 AlertDialog 二次确认，含"会同时删除课时与报名记录"的提示文案。

### 4. 权限与未登录态
- admin-view：`user?.role !== 'ADMIN'` 即渲染无权限卡（含返回首页 / 去登录）。
- dashboard-view：`!user` 渲染引导登录卡。
- auth-view：`user` 已存在时渲染"已登录"卡（进入控制台 / 返回首页），避免重复登录。

### 5. 视觉一致性
- 全部使用 `bg-cinema-radial` + `glass-card` + `shadow-glow-primary` + `bg-gradient-to-r from-primary to-accent`，与主页 home-view 一致。
- framer-motion 入场动画（opacity + y 位移 + 阶梯 delay）。
- 颜色严格遵循玫瑰红 (primary) + 琥珀金 (accent)，未使用靛蓝/蓝。

## API 调用清单
| 视图 | 方法 | 路径 | 用途 |
|------|------|------|------|
| auth-view | POST | /api/auth | 登录/注册（邮箱不存在自动注册） |
| dashboard-view | GET | /api/courses?limit=100 | 拉取课程列表（含 isEnrolled） |
| dashboard-view | GET | /api/scripts | 拉取当前用户生成历史 |
| dashboard-view | PATCH | /api/scripts | 切换收藏 {id, isFavorite} |
| dashboard-view | DELETE | /api/scripts?id=xxx | 删除单条记录 |
| admin-view | GET | /api/courses?limit=100 | 拉取全部课程 |
| admin-view | POST | /api/courses | 新建课程 |
| admin-view | PUT | /api/courses/[id] | 编辑课程 |
| admin-view | DELETE | /api/courses/[id] | 删除课程 |

## 验证
- `bun run lint`：3 个新文件 0 error 0 warning（剩余 6 warning 均在其他 agent 文件中，与本任务无关）
- dev server 编译通过，GET / 200
- 已移除 admin-view 中 2 处冗余 `eslint-disable` 注释、dashboard-view 中未使用的 `Star` 导入

## 后续可优化点（非本任务范围）
- `/api/courses` 默认只返回 `isPublished=true`，admin 后台如需管理未发布课程需加 `?all=1` 参数（当前已发布课程足够展示）
- 报名进度无独立 GET 接口，dashboard 暂用 CourseCard 自带的"已报名"badge；如需进度条可扩展 `/api/enrollments` GET 接口
- 工具使用次数 = scripts.length（每条记录 = 1 次调用）；若 TTS 等非文本工具也需统计，需扩展 ToolUsage 模型与接口
