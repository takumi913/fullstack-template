## 1. 核心原则 ✨

### 1.1 设计哲学

**Less is More (少即是多)**

- **只做必要的事**：避免过度设计和过早优化。只引入当前功能所必需的依赖和抽象。
- **代码自解释**：优先通过清晰的命名（变量、函数、文件）和合理的代码结构来让代码不言自明，注释是必要的补充。
- **利用框架/库的优势**：充分使用 Echo、sqlc、React、TailwindCSS 等工具提供的原生能力，而不是在其上构建不必要的封装。

### 1.2 开发原则

- **一致性优于个性**：团队内保持代码风格、命名规范、文件结构的一致性。
- **可读性优于简洁性**：代码应该易于理解和维护，而不是追求极致的简洁。
- **渐进式重构**：持续改进代码质量，但避免大规模重写。
- **实用主义**：专注于功能实现和用户体验，避免过度工程化。

### 1.3 问题排查与修复原则

**先确认，再动手；先根因，再修复。**

- **先确认问题是否真实存在**：拿到任何问题描述（报错、疑似 bug、评审意见、"我感觉这里有问题"）后，第一步是验证而不是修改。通过复现步骤、日志、测试用例或通读实际代码路径来确认问题确实存在、触发条件是什么、影响范围有多大。无法确认的，先说明"未复现/未找到证据"，不要凭猜测改代码。
- **避免过度猜想导致矫枉过正**：只修已确认的问题。不要顺手"预防性"地改动那些看起来可疑但没有任何证据出错的代码，也不要为了一个具体问题引入通用框架式的抽象。基于猜测的改动会带来新的复杂度和新的 bug，这本身就是更大的问题。
- **先从架构角度找根因**：定位问题后，先判断它在架构上属于哪一层的职责缺失或边界破坏——是分层职责串了（handler 写了业务逻辑、service 直接拼 SQL），是状态归属错了，还是数据流方向反了。再回到实际业务场景，确认这个根因能否解释观察到的全部现象；解释不了，说明还没找到真正的根因。
- **禁止打补丁式修复**：不要用"加个 if 特判""包一层 try/catch 吞掉错误""在这个调用点单独兜底"这类手段绕开症状。修复必须落在根因所在的那一层，使同类问题在其它调用点也一并消失。如果发现同一根因在多处产生了相似的症状，一次性修掉，而不是逐个打补丁。
- **权衡要显式**：如果根因修复代价过大、超出当前改动范围，明确说明取舍和临时方案的边界，由人来决定，而不是默默留下一个补丁。
- **修复后验证**：说明如何验证（复现步骤是否消失、新增/已有测试、`make lint`、`bun run test`），并检查代码库中是否还有其它地方存在同一根因。

### 1.4 防御性编程与测试的边界

**克制是默认值：只在边界防御，只测核心。**

- **减少防御性编程**：校验只做在系统边界——HTTP 入参、外部 API 响应、配置读取、数据库返回。边界之内的函数信任已经校验过的数据，不要层层重复判空、重复包 try/catch。
- **不吞掉错误**：错误应当冒泡到真正能处理它的那一层，不要就地 catch 后返回默认值或空对象。被掩盖的错误会变成更难排查的问题。
- **不为不可能的分支写代码**：不给"理论上不会发生"的情况加兜底。这类分支无法验证、无法测试，只会让真正的 bug 静默通过。
- **测试只覆盖核心**：为核心业务规则、容易出错的边界条件、以及修复过的 bug 写测试。不给纯转发的 handler、getter/setter、框架自身的行为、显而易见的类型映射写测试。
- **严格控制测试文件数量**：优先在已有测试文件中追加用例，而不是新建文件；一个模块对应一个测试文件。大量零碎的测试文件会污染上下文、浪费大量 token，维护成本远高于它带来的信心。
- **测试要有信息量**：测试失败时应当能直接指出是哪条业务规则被破坏。断言具体行为，不要快照式地断言整个数据结构。

### 1.5 注释规范

注释解释「为什么」，代码本身表达「做什么」。复述代码的注释等于噪音。

- **公开 API**：Go 的导出函数、类型、接口需要注释说明用途与边界条件（golangci-lint 会检查）
- **非显然的决策**：绕过某个坑、选择某种权衡、与直觉相反的实现，必须写清原因
- **复杂业务规则**：说明规则来源和适用条件，而不是逐行翻译代码
- **不写**：getter/setter、参数含义已由命名表达、被注释掉的旧代码（交给 git）

## 2. 技术栈 (Tech Stack) 🛠️

### 后端 (Backend)

- **语言**: Go 1.25+（以 go.mod 的 go 指令为准）
- **Web 框架**: Echo v5（注意 handler 签名是 `*echo.Context` 指针，与 v4 不同）
- **数据访问**: database/sql + sqlc（由 SQL 生成类型安全代码，无 ORM）
- **数据库**: SQLite 与 PostgreSQL 双方言（`db/query/`、`db/migrations/` 各维护一套）
- **身份认证**: Session
- **密码加密**: bcrypt
- **配置管理**: godotenv
- **依赖管理**: Go Modules

### 前端 (Frontend)

- **语言**: TypeScript
- **框架**: React 19+
- **构建工具**: Vite
- **CSS**: TailwindCSS v4+
- **状态管理**: Zustand (支持持久化)
- **路由**: React Router DOM v7+
- **UI 组件**: 页面使用 `style.css` 中的 `.panel`/`.button-primary`/`.field` 等类；如需成品组件，用 `bunx shadcn@latest add <组件>` 按需引入
- **表单处理**: 原生受控组件 + `useAsyncAction`（未引入表单库），业务校验以后端 service 层为准
- **图标**: lucide-react（已在用，不要再引入第二个图标库）
- **HTTP 客户端**: Axios
- **国际化**: 暂未引入，文案直接写在组件中
- **主题切换**: 暂未引入
- **通知组件**: 暂未引入，错误以表单内联红字展示
- **包管理器**: Bun

## 3. 项目结构 (Project Structure) 📂

### 3.1 整体结构

```plaintext
.
├── .air.toml              # Air 热重载配置
├── .env.example           # 环境变量模板
├── .gitignore             # Git 忽略文件
├── .golangci.yml          # Go 代码检查配置
├── Dockerfile             # Docker 构建文件
├── Makefile               # 项目管理命令
├── README.md              # 项目说明文档
├── docker-compose.yml     # Docker Compose 配置
├── go.mod                 # Go 模块文件
├── go.sum                 # Go 依赖锁定文件
├── main.go                # 项目主入口
│
├── .github/               # GitHub 配置
│   └── workflows/         # CI/CD 工作流
│
├── api/                   # API 定义文件
│   └── routes.go          # 路由定义
│
├── assets/                # 静态资源
│   └── logo.svg           # 项目图标
│
├── configs/               # 配置管理
│   └── config.go          # 配置文件
│
├── db/                    # 数据库定义
│   ├── migrations/        # 迁移脚本
│   ├── query/             # 手写 SQL（sqlite/ 与 postgres/ 两套方言）
│   └── generated/         # sqlc 生成代码，禁止手改
│
├── docs/                  # 项目文档
│   ├── air.md             # Air 热重载文档
│   ├── configuration.md   # 配置说明
│   ├── docker.md          # Docker 部署文档
│   └── golangci-lint.md   # 代码检查文档
│
├── pkg/                   # 核心业务代码
│   ├── database/          # 数据库连接、初始化和迁移
│   ├── handler/           # HTTP 请求处理器 (Echo Handlers)
│   ├── middleware/        # 中间件
│   ├── model/             # 数据模型（普通 struct + JSON 标签）
│   ├── repo/              # 数据访问层
│   └── service/           # 业务逻辑层
│
├── scripts/               # 构建和部署脚本
│   ├── build.sh           # 完整构建脚本
│   └── lint.sh            # 代码检查脚本
│
└── web/                   # 前端 React 项目
    ├── public/            # 静态资源
    ├── src/               # 源代码
    │   ├── api/           # API 调用
    │   ├── assets/        # 前端资源
    │   ├── components/    # 可复用组件
    │   ├── lib/           # 工具函数
    │   ├── pages/         # 页面级组件
    │   ├── router/        # 路由配置
    │   ├── store/         # Zustand store
    │   └── style.css      # 全局样式和主题配置
    ├── components.json    # shadcn 配置（供 bunx shadcn add 按需引入组件）
    ├── package.json       # 前端依赖
    ├── tsconfig.json      # TypeScript 配置
    └── vite.config.ts     # Vite 构建配置
```

## 4. 后端开发规约 (Backend Rules)

### 4.1 代码分层职责

#### 4.1.1 Handler 层 (pkg/handler/)

- **职责**：绑定入参、调用 service、返回统一响应，只做这三件事
- **原则**：
  - 不包含业务逻辑，业务规则与校验一律在 service 层
  - 响应必须走 `pkg/handler/response.go` 的 `success`/`failure`，不要自己拼 map
  - 不要把原始错误直接回传给客户端；`failure` 已统一处理 5xx 的脱敏与日志
  - 请求日志由中间件统一记录，handler 不重复记

```go
// pkg/handler/user_handler.go
func (h *UserHandler) Update(c *echo.Context) error {
	var req model.UpdateProfileRequest
	if e := c.Bind(&req); e != nil {
		return failure(c, 400, e)
	}
	v, e := h.service.Update(c.Request().Context(), middleware.UserID(c), req)
	if e != nil {
		return failure(c, 400, e)
	}
	return success(c, v, "更新成功")
}
```

#### 4.1.2 Service 层 (pkg/service/)

- **职责**：核心业务逻辑，处理复杂的业务规则和流程
- **原则**：
  - 包含所有业务规则和验证
  - 调用 Repository 层进行数据操作
  - 处理事务管理
  - 返回业务错误

#### 4.1.3 Repository 层 (pkg/repo/)

- **职责**：数据访问抽象，封装数据库操作
- **原则**：
  - 只负责数据的 CRUD 操作
  - 不包含业务逻辑
  - 调用 sqlc 生成的查询（`db/generated/{sqlite,postgres}`），在此层适配两种驱动
  - 修改查询时先改 `db/query/` 下的 SQL，再运行 `make sqlc-generate`；CI 会校验生成代码是否最新

#### 4.1.4 Model 层 (pkg/model/)

- **职责**：数据结构定义，包括数据库模型和 DTO
- **原则**：
  - 数据库模型为普通 struct，仅使用 JSON 标签（字段与列的映射由 sqlc 生成代码负责）
  - 请求/响应 DTO 使用 JSON 标签
  - 校验逻辑写在 service 层，不依赖标签

### 4.2 API 设计规范

#### 4.2.1 RESTful 设计

- **资源命名**：使用复数名词，如 `/api/v1/users`
- **HTTP 方法**：
  - `GET`: 获取资源
  - `POST`: 创建资源
  - `PATCH`: 更新资源（本项目统一用 PATCH，不使用 PUT）
  - `DELETE`: 删除资源

#### 4.2.2 统一响应格式

项目采用统一的响应格式，所有 API 接口都应遵循以下规范：

```jsonc
// 成功响应
{ "code": 0, "data": {}, "message": "操作成功" }

// 错误响应
{ "code": 1, "data": null, "message": "具体错误信息" }
```

**响应字段说明：**

- `code`: 业务状态码，0 表示成功，非 0 表示失败
- `data`: 响应数据，成功时包含具体数据，失败时为 null
- `message`: 响应消息，提供用户友好的提示信息

项目当前没有分页接口；将来新增时，把 `items` 与 `pagination` 放进 `data`，不要另造顶层字段。

#### 4.2.3 错误处理

- **使用标准 HTTP 状态码**
- **提供清晰的错误信息**
- **定义业务错误码**
- **记录错误日志**

### 4.3 安全性规范

#### 4.3.1 输入验证

- **所有用户输入必须验证**：校验写在 service 层（与 4.1.4 一致），handler 只做绑定和格式检查
- **防止 SQL 注入**：只通过 sqlc 生成的参数化查询访问数据库，禁止手工拼接 SQL
- **防止 XSS 攻击**：对用户输入进行适当的转义和过滤

#### 4.3.2 身份认证与授权

- **SESSION 认证**：随机 token 存入 HttpOnly Cookie，服务端只保存其 SHA-256 哈希（`sessions` 表）
- **密码安全**：使用 `bcrypt` 进行密码哈希，成本因子设为默认值
- **会话有效期**：由 `SESSION_EXPIRE_HOUR` 控制（默认 24 小时），过期后需重新登录；没有刷新机制
- **中间件保护**：使用 SESSION 中间件保护需要认证的路由

#### 4.3.3 多租户与权限控制

租户内资源按角色授权，角色与权限的映射集中在 `pkg/model/permission.go`：

- **角色**：`Owner` / `Admin` / `Member`；权限用 `资源:动作` 常量表示（如 `tenant:update`）
- **路由必须挂权限**：租户作用域下的路由一律加 `middleware.Require(model.PermissionXxx)`，
  漏挂即越权。在 `api/routes.go` 新增路由时，先确定它需要哪个权限
- **新增权限**：在 `permission.go` 定义常量后，必须在 `RolePermissions` 里为三个角色都显式赋值，
  不要依赖 map 零值——漏写会静默变成"无权限"，且难以排查
- **授权只在中间件这一层**：不要在 service 或前端重复做权限判断，同一规则散落多处必然发散；
  前端按角色隐藏入口只是体验优化，不能当作授权手段
- **认证类路由限流**：登录、注册等接口挂 `authLimiter`

### 4.4 数据库与性能优化

- **索引策略**：在经常查询的字段上建立索引（如 email、username）
- **避免 N+1 查询**：在 `db/query/` 中用 JOIN 一次取回关联数据，不要在循环里查询
- **软删除**：通过 `deleted_at` 列实现，查询需显式加上 `deleted_at IS NULL`
- **连接池**：合理配置数据库连接池参数（SQLite 限制为单连接）

```sql
-- db/query/sqlite/tenants.sql
-- name: ListTenantsByUserID :many
SELECT t.* FROM tenants t
JOIN tenant_members tm ON tm.tenant_id = t.id
WHERE tm.user_id = ? AND t.deleted_at IS NULL
ORDER BY t.created_at ASC;
```

同一个查询要在 `db/query/sqlite/` 和 `db/query/postgres/` 各写一份（占位符分别是 `?` 和 `$1`），
两边的查询名必须一致，`pkg/repo/` 才能按驱动切换。

### 4.5 日志和监控

#### 4.5.1 日志规范

- **使用结构化日志**：统一使用 `log/slog`（与 echo 内部一致），避免混用 `log` 产生两种格式
- **记录关键操作**：记录用户登录、注册、重要业务操作
- **错误日志**：记录所有错误信息，便于问题排查
- **安全考虑**：不记录密码、token 等敏感信息
- **中间件日志**：HTTP 访问日志由 `main.go` 里的 `RequestLoggerWithConfig` 转发给 slog，
  不要改用 `middleware.Logger()`——那会引入第二种日志格式
- **请求关联**：`RequestID` 中间件生成的 id 会同时出现在访问日志和 `failure` 记录的错误日志里

```go
// 日志记录示例：统一走 log/slog，用结构化字段而不是拼接字符串
slog.Info("用户注册成功", "user_id", user.ID)
slog.Error("数据库连接失败", "err", err)
```

## 5. 前端开发规约 (Frontend Rules)

### 5.1 组件开发规范

#### 5.1.1 组件分类和组织

- **页面组件** (`pages/`): 路由对应的页面级组件
- **布局组件** (`components/layout/`): 页面骨架，如 `Layout`、`Header`、`Footer`
- **复用组件** (`components/`): 跨页面复用的组件，`components/ui/` 留给 shadcn 按需引入的成品组件

组件先写在使用它的页面里，出现第二个使用者时再提取到 `components/`。
不预先创建空的分类目录。

#### 5.1.2 组件设计原则

- **单一职责**：每个组件只负责一个功能或展示一个 UI 片段
- **可复用性**：通用组件应该高度可配置和可复用
- **可访问性**：输入框有关联的 `label`，交互元素可键盘到达，焦点样式沿用 `style.css` 的 `:focus-visible`

#### 5.1.3 命名与导出

- 组件文件名用 PascalCase，与组件同名：`LoginPage.tsx`、`Header.tsx`
- 具名导出，不用默认导出；对外暴露的目录用 `index.ts` 汇总
- Props 接口命名为 `<组件名>Props`，与组件放在同一文件
- 对外可定制样式的组件接收 `className`，用 `cn()` 与内部样式合并

#### 5.1.4 视觉风格

视觉风格以 `src/style.css` 的 `@theme` 变量和其中的语义化类（`.shell`、`.panel`、`.button-primary`、`.button-secondary`、`.field`）为唯一事实来源。新组件复用这些变量和类，不在组件里写死颜色、圆角、字体；需要新增设计变量时，加到 `@theme` 再引用。

#### 5.1.5 按需引入成品组件

下拉菜单、对话框这类交互复杂的组件用 shadcn 按需引入，它会把源码直接写进
`src/components/ui/` 并补齐依赖：

```bash
bunx shadcn@latest add dropdown-menu
```

项目保留 `components.json` 供该命令使用，但不预装任何未被使用的组件。

### 5.2 状态管理规范 (Zustand)

#### 5.2.1 Store 设计原则

- **按功能模块分割**：每个业务模块一个 store
- **状态扁平化**：避免深层嵌套的状态结构
- **不可变更新**：使用展开运算符创建新对象，不要就地修改 state

#### 5.2.2 Store 编写规则

以 `src/store/authStore.ts` 为参照，不要把 store 源码复制进文档或其它 store：

- 状态与操作定义在同一个接口里，`create<T>()(...)` 显式标注类型
- 需要跨刷新保留的用 `persist` 中间件，并显式指定 `name`
- 只持久化可安全落盘的数据；凭据是 HttpOnly Cookie，前端不持久化任何 token
- 副作用（调接口）写在 store 的 action 里，组件只调用 action，不在组件里编排多步状态变更

#### 5.2.3 状态使用规范

- **选择性订阅**：只订阅组件需要的状态片段
- **避免过度渲染**：使用 shallow 比较或选择器函数

```typescript
// 好的做法：选择性订阅
const { user, loading } = useUserStore((state) => ({
  user: state.user,
  loading: state.loading,
}));

// 避免：订阅整个 store
const userStore = useUserStore(); // 会导致不必要的重渲染
```

### 5.3 路由管理规范 (React Router DOM)

路由集中配置在 `src/router/index.tsx`，守卫组件在 `src/router/RouteGuards.tsx`：

- **ProtectedRoute**：需要登录的页面，未登录重定向到 `/login`
- **PublicRoute**：登录/注册页，已登录重定向到已认证首页
- 守卫只读 `authStore` 的认证状态，不自己发请求
- 新增页面时在 `router/index.tsx` 注册，并按需要套用对应守卫；不要在页面组件内部自己做跳转判断

### 5.4 样式开发规范 (TailwindCSS)

#### 5.4.1 样式组织

- **原子化优先**：优先使用 Tailwind 工具类
- **组件样式**：复杂样式使用 `@apply` 或 CSS-in-JS
- **主题定制**：TailwindCSS v4+ 使用 CSS 变量进行主题定制，无需配置文件
- **设计变量**：颜色、圆角等集中定义在 `style.css` 的 `@theme` 中，不在组件里写死

#### 5.4.2 样式复用

重复出现的样式先沉淀为 `style.css` 里的语义化类，再在组件中用 `cn()` 组合，
颜色一律引用 `@theme` 变量，不要写死具体色值：

```typescript
// 复用 style.css 中的 .button-primary，只在此处叠加位置相关的原子类
<button className={cn("button-primary", "w-full sm:w-auto", className)}>
  提交
</button>
```

#### 5.4.3 主题系统规范

项目目前只提供明亮主题，未引入主题切换库。颜色与圆角等设计变量集中定义在
`src/style.css` 的 `@theme` 中，页面通过 `.panel`、`.button-primary`、`.field`
等语义化类复用样式。

如需暗黑模式，再引入 `next-themes` 并按 TailwindCSS 的 `dark:` 变体扩展，
不要在未使用前预先安装依赖。

### 5.5 移动端适配规范 📱

#### 5.5.1 响应式设计原则

- **移动优先 (Mobile First)**：从最小屏幕开始设计，逐步增强到大屏幕
- **断点策略**：使用 TailwindCSS 标准断点
  - 默认（无前缀）: < 640px (手机竖屏)
  - `sm`: ≥ 640px (手机横屏/小平板)
  - `md`: ≥ 768px (平板)
  - `lg`: ≥ 1024px (桌面)
  - `xl`: ≥ 1280px (大桌面)
  - `2xl`: ≥ 1536px (超大桌面)

#### 5.5.2 触摸交互优化

- **触摸目标尺寸**：可点击元素最小 44px × 44px
- **触摸反馈**：hover/active 状态要有明确的视觉变化
- **禁用 iOS 输入框缩放**：输入框字号不小于 16px

#### 5.5.3 移动端表单优化

- **输入类型优化**：使用正确的 `type`（`email`/`tel`/`number`）触发合适的键盘
- **标签和占位符**：每个输入框都有可访问的 label
- **验证反馈**：错误以内联文案展示在对应字段下方

#### 5.5.4 移动端资源优化

- **图片**：优先 WebP，非首屏图片用原生 `loading="lazy"`（其余性能规约见 5.7）

> 底部导航、滑动手势、下拉刷新、虚拟滚动这类交互，等到确有页面需要时再实现，
> 不要预先在项目里放置无人使用的组件和 Hook。

#### 5.5.5 移动端安全区域适配

固定在屏幕边缘的元素（吸底栏、全屏浮层）用 `env(safe-area-inset-*)` 留出安全区，
避开刘海屏和底部指示器。工具类等到确有元素需要时再加到 `style.css`。

### 5.6 API 调用规范

#### 5.6.1 API 客户端

统一使用 `src/lib/client.ts` 中的 axios 实例，不要在页面里另建实例：

- **凭据**：`withCredentials: true`，会话靠 HttpOnly Cookie 携带，前端不接触也不存储 token
- **错误**：响应拦截器把失败统一包装成 `ApiError`（保留 `status` 与业务 `code`），调用方按状态码分支处理，而不是只拿到一句文案
- **401**：拦截器触发 `triggerUnauthorized()` 事件，由 `authStore` 统一清理状态并跳转，拦截器里不直接操作 `window.location`

#### 5.6.2 API 服务层

```typescript
// api/user.ts
export const userApi = {
  getUser: (id: string): Promise<User> => apiClient.get(`/v1/users/${id}`),

  createUser: (userData: CreateUserRequest): Promise<User> =>
    apiClient.post("/v1/users", userData),

  updateUser: (id: string, userData: UpdateUserRequest): Promise<User> =>
    apiClient.put(`/v1/users/${id}`, userData),

  deleteUser: (id: string): Promise<void> =>
    apiClient.delete(`/v1/users/${id}`),
};
```

#### 5.6.3 表单提交与异步状态

表单提交统一用 `src/lib/useAsyncAction.ts`，不要在页面里自己写 try/catch + loading：

```tsx
const { error, pending, run } = useAsyncAction();

const onSubmit = async () => {
  const ok = await run(() => userApi.update(form));
  if (ok) navigate("/dashboard");
};
```

- 它一并处理了三件事：捕获错误文案、暴露 `pending`、用 ref 防重复提交
- 提交中必须用 `pending` 禁用按钮；仅靠状态判断挡不住同一轮事件里的双击
- 错误以内联红字展示在表单内，不弹全局提示（项目未引入通知组件）

### 5.7 性能优化

先测量再优化。没有实测到卡顿之前，不要预先加 `React.memo`/`useMemo`/`useCallback`——
它们本身有成本，且会掩盖真正的性能问题。

- **路由级代码分割**：页面组件用 `React.lazy` 分割，这是唯一默认就该做的优化
- **列表渲染**：`key` 用稳定的业务 id，不要用数组下标
- **其余优化**：定位到具体瓶颈后再针对性处理，并在注释里说明测量结论

### 5.8 类型定义规范

请求/响应类型与调用它们的接口写在同一个 `src/api/*.ts` 中，由 `src/api/index.ts` 统一导出，
不单独建 `types/` 目录——类型和用它的代码放在一起才不会失同步。

```typescript
// api/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}
```

## 6. 国际化 (i18n) 规范 🌍

项目当前未引入国际化方案，界面文案直接以中文写在组件中。

若确实需要多语言，再安装 `i18next` 与 `react-i18next`，并遵循：

- **按功能模块分组**：相关文案放在同一命名空间下，通用文案（如按钮文字）放入 `common`
- **命名空间层级不超过 3 层**
- **保持各语言文件的键同步**，避免某种语言缺失键位导致回退

在引入之前不要预先安装依赖——未使用的依赖会带来安装成本、
锁文件变动和依赖升级噪音，却不产生任何价值。

## 7. 开发工具和环境 🛠️

### 7.1 必需工具

#### 7.1.1 后端开发工具

- **Go**: 版本以 `go.mod` 的 go 指令为准（当前 1.25.8）
- **Air**: 热重载工具，`make tools` 安装
- **golangci-lint**: 代码检查，版本必须与 CI 一致，`make tools` 安装
- **Docker**: 容器化部署
- **Make**: 项目管理和构建工具

#### 7.1.2 前端开发工具

- **Bun**: 运行时与包管理器，版本固定在 `package.json` 的 `packageManager`
  （前端全程由 bun 执行，不依赖单独安装的 Node）
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 构建工具
- **Vitest**: 单元测试，`bun run test`
- **ESLint**: 代码检查，`bun run lint`
- **Prettier**: 代码格式化，`bun run format`（CI 会校验格式）

## 8. 常用命令

| 命令                 | 用途                                        |
| -------------------- | ------------------------------------------- |
| `make dev`           | 同时启动后端与前端开发环境                  |
| `make lint`          | 前后端全部检查，提交前必跑                  |
| `make test`          | 运行前后端测试                              |
| `make sqlc-generate` | 改完 `db/query/` 下的 SQL 后重新生成查询代码 |
| `make sqlc-verify`   | 校验生成代码是否最新（CI 会跑同样的检查）   |
| `make build`         | 构建前端并打包进 Go 二进制                  |
| `make tools`         | 安装 air、golangci-lint 等开发工具          |
