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

## 2. 技术栈 (Tech Stack) 🛠️

### 后端 (Backend)

- **语言**: Go 1.25+（以 go.mod 的 go 指令为准）
- **Web 框架**: Echo v4
- **数据访问**: database/sql + sqlc（由 SQL 生成类型安全代码，无 ORM）
- **数据库**: SQLite/MySQL/PostgreSQL (多数据库支持)
- **身份认证**: Session
- **密码加密**: bcrypt
- **第三方登录**: Google OAuth2
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
- **表单处理**: 原生受控组件 + service 层校验（未引入表单库）
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
├── .trae/                 # Trae AI 配置
│   └── rules/             # 项目规约文档
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

### 3.2 目录职责说明

#### 后端目录

- **`pkg/`**: 核心业务代码，按功能模块组织
- **`api/`**: API 路由定义和文档
- **`configs/`**: 配置文件和环境变量管理
- **`scripts/`**: 构建、部署和维护脚本

#### 前端目录

- **`web/src/components/`**: 可复用的 UI 组件
- **`web/src/pages/`**: 页面级组件
- **`web/src/lib/`**: 工具函数和通用逻辑
- **`web/src/store/`**: 全局状态管理

#### 配置和文档

- **`docs/`**: 项目文档和使用指南
- **`.github/`**: GitHub Actions 和模板

## 4. 后端开发规约 (Backend Rules)

### 4.1 代码分层职责

#### 4.1.1 Handler 层 (pkg/handler/)

- **职责**：HTTP 请求解析、参数验证、响应格式化
- **原则**：
  - 不包含业务逻辑，只负责数据转换和验证
  - 使用 Echo 的绑定和验证功能
  - 统一错误处理和响应格式
  - 记录请求日志

```go
// 示例：用户注册处理器
func (h *UserHandler) Register(c echo.Context) error {
    var req model.UserRegisterRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]interface{}{
            "code":    1,
            "data":    nil,
            "message": "请求参数格式错误",
        })
    }

    user, err := h.userService.Register(&req)
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]interface{}{
            "code":    1,
            "data":    nil,
            "message": err.Error(),
        })
    }

    return c.JSON(http.StatusOK, map[string]interface{}{
        "code":    0,
        "data":    user,
        "message": "注册成功",
    })
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
  - `PUT`: 完整更新资源
  - `PATCH`: 部分更新资源
  - `DELETE`: 删除资源

#### 4.2.2 统一响应格式

项目采用统一的响应格式，所有 API 接口都应遵循以下规范：

```go
// 成功响应
{
    "code": 0,
    "data": {},
    "message": "操作成功"
}

// 错误响应
{
    "code": 1,
    "data": null,
    "message": "具体错误信息"
}

// 分页响应
{
    "code": 0,
    "data": {
        "items": [],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 100,
            "pages": 10
        }
    },
    "message": "获取成功"
}
```

**响应字段说明：**

- `code`: 业务状态码，0 表示成功，非 0 表示失败
- `data`: 响应数据，成功时包含具体数据，失败时为 null
- `message`: 响应消息，提供用户友好的提示信息

#### 4.2.3 错误处理

- **使用标准 HTTP 状态码**
- **提供清晰的错误信息**
- **定义业务错误码**
- **记录错误日志**

### 4.3 安全性规范

#### 4.3.1 输入验证

- **所有用户输入必须验证**：使用结构体标签进行基础验证
- **防止 SQL 注入**：只通过 sqlc 生成的参数化查询访问数据库，禁止手工拼接 SQL
- **防止 XSS 攻击**：对用户输入进行适当的转义和过滤
- **文件上传安全**：限制文件类型、大小和存储位置

#### 4.3.2 身份认证与授权

- **SESSION 认证**：随机 token 存入 HttpOnly Cookie，服务端只保存其 SHA-256 哈希（`sessions` 表）
- **密码安全**：使用 `bcrypt` 进行密码哈希，成本因子设为默认值
- **Token 管理**：设置合理的过期时间（默认 24 小时），支持 token 刷新
- **第三方登录**：支持 Google OAuth2 登录，安全处理用户信息
- **中间件保护**：使用 SESSION 中间件保护需要认证的路由

### 4.4 性能优化

#### 4.4.1 数据库优化

- **索引策略**：在经常查询的字段上建立索引（如 email、username）
- **避免 N+1 查询**：在 `db/query/` 中用 JOIN 一次取回关联数据，不要在循环里查询
- **分页查询**：在 SQL 中使用 `LIMIT`/`OFFSET` 参数，由 sqlc 生成带参数的查询方法
- **软删除**：通过 `deleted_at` 列实现，查询需显式加上 `deleted_at IS NULL`
- **连接池**：合理配置数据库连接池参数（SQLite 限制为单连接）

```sql
-- db/query/sqlite/tenants.sql
-- name: ListTenants :many
SELECT t.* FROM tenants t
JOIN tenant_members m ON m.tenant_id = t.id
WHERE m.user_id = ? AND t.deleted_at IS NULL
ORDER BY t.created_at
LIMIT ? OFFSET ?;
```

#### 4.4.2 缓存策略

- **静态资源缓存**：前端静态资源使用浏览器缓存
- **API 响应缓存**：对不经常变化的数据进行适当缓存
- **数据库查询优化**：避免重复查询，合理使用事务

### 4.5 日志和监控

#### 4.5.1 日志规范

- **使用结构化日志**：统一使用 `log/slog`（与 echo 内部一致），避免混用 `log` 产生两种格式
- **记录关键操作**：记录用户登录、注册、重要业务操作
- **错误日志**：记录所有错误信息，便于问题排查
- **安全考虑**：不记录密码、token 等敏感信息
- **中间件日志**：使用 Echo 的 Logger 中间件记录 HTTP 请求

```go
// 日志记录示例
log.Printf("用户注册成功: %s", user.Email)
log.Printf("数据库连接失败: %v", err)
```

### 4.6 注释规范

- **公开函数**：必须有清晰的注释说明功能、参数和返回值
- **复杂逻辑**：对于复杂的业务逻辑，添加必要的行内注释
- **接口定义**：所有接口必须有详细的注释
- **常量和变量**：重要的常量和全局变量需要注释说明

## 5. 前端开发规约 (Frontend Rules)

### 5.1 组件开发规范

#### 5.1.1 组件分类和组织

- **页面组件** (`pages/`): 路由对应的页面级组件
- **布局组件** (`components/layout/`): 页面布局相关组件
- **业务组件** (`components/business/`): 特定业务逻辑组件
- **通用组件** (`components/`): 页面间复用的组件；`components/ui/` 保留给 shadcn 按需添加的组件
- **表单组件** (`components/form/`): 表单相关组件

#### 5.1.2 组件设计原则

- **单一职责**：每个组件只负责一个功能或展示一个 UI 片段
- **可复用性**：通用组件应该高度可配置和可复用
- **可访问性**：遵循 WCAG 无障碍访问标准

#### 5.1.3 组件命名规范

```typescript
// 组件文件命名：PascalCase
// UserProfile.tsx, LoginForm.tsx, DataTable.tsx

// 组件导出
export const UserProfile: React.FC<UserProfileProps> = ({ ... }) => {
  // 组件实现
};

// Props 类型定义
interface UserProfileProps {
  userId: string;
  onEdit?: (user: User) => void;
  className?: string;
}
```

#### 5.1.4 组件结构模板

```typescript
import React from "react";
import { cn } from "@/lib/utils";

// Props 接口定义
interface ComponentProps {
  // 必需属性
  title: string;
  // 可选属性
  description?: string;
  // 事件处理
  onClick?: () => void;
  // 样式相关
  className?: string;
  children?: React.ReactNode;
}

// 组件实现
export const Component: React.FC<ComponentProps> = ({
  title,
  description,
  onClick,
  className,
  children,
}) => {
  return (
    <div className={cn("default-styles", className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
};

// 默认导出（如果需要）
export default Component;
```

#### 5.1.5 组件设计风格

- 整体风格：

  - 这是一种在大面积浅色背景下，使用渐变、模糊、动态流光、极细描边、微噪点、外发光以及庄重的无衬线字体，外加流畅克制的微动效来组织和修饰界面元素的网页设计风格。
  - 背景颜色：橙色系小清新渐变色
  - 文字颜色：与背景颜色对比度高的字体颜色，禁止使用蓝紫色
  - 字体：无衬线字体
  - 动态效果：按钮的背景颜色要随着鼠标悬停而变化，文字颜色要随着鼠标悬停而变化，按钮的圆角要随着鼠标悬停而变化，以避免视觉上的干扰。
  - 禁止使用蓝紫色渐变

- 导航栏：
  - 采用扁平化设计风格：按钮的背景颜色和文字颜色之间的对比度要高，同时按钮的圆角要小，以避免视觉上的干扰。
  - 采用动态效果：按钮的背景颜色要随着鼠标悬停而变化，文字颜色要随着鼠标悬停而变化，按钮的圆角要随着鼠标悬停而变化，以避免视觉上的干扰。
- 按钮：
  - 采用扁平化设计风格：按钮的背景颜色和文字颜色之间的对比度要高，同时按钮的圆角要小，以避免视觉上的干扰。
  - 不要使用渐变，按钮与背景颜色有一定对比度的颜色
- 表单元素：
  - 输入框：
    - 采用扁平化设计风格：输入框的背景颜色和文字颜色之间的对比度要高，同时输入框的圆角要小，以避免视觉上的干扰。
    - 输入框下方的下划线：
      - 采用动态效果：下划线的颜色要与输入框的文字颜色保持一致，下划线的宽度要与输入框的文字宽度保持一致，下划线的位置要与输入框的文字位置保持一致。
  - 下拉选择框：
    - 采用扁平化设计风格：下拉选择框的背景颜色和文字颜色之间的对比度要高，同时下拉选择框的圆角要小，以避免视觉上的干扰。
  - 复选框：
    - 采用扁平化设计风格：复选框的背景颜色和文字颜色之间的对比度要高，同时复选框的圆角要小，以避免视觉上的干扰。
- 页脚：
  - 采用扁平化设计风格：页脚的背景颜色和文字颜色之间的对比度要高，同时页脚的圆角要小，以避免视觉上的干扰。

### 5.2 状态管理规范 (Zustand)

#### 5.2.1 Store 设计原则

- **按功能模块分割**：每个业务模块一个 store
- **状态扁平化**：避免深层嵌套的状态结构
- **不可变更新**：使用展开运算符创建新对象，不要就地修改 state

#### 5.2.2 Store 结构模板

基于项目实际使用的认证状态管理示例：

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { userApi } from "@/api";
import type { User } from "@/api";

// 认证状态接口
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// 创建认证状态store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // 登录
      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      // 登出
      logout: async () => {
        try {
          await userApi.logout();
        } catch (error) {
          console.error("注销请求失败:", error);
        } finally {
          localStorage.removeItem("token");
          set({ user: null, isAuthenticated: false });
        }
      },

      // 设置用户信息
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      // 清除认证状态
      clearAuth: () => {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage", // 持久化存储的key
    }
  )
);
```

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

#### 5.3.1 路由配置

项目使用 React Router DOM v7+ 进行路由管理，支持嵌套路由和路由守卫：

```typescript
// router/index.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout, SimpleLayout } from "../components/layout";
import { useAuthStore } from "../store/authStore";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 公开路由组件（已登录用户重定向到仪表板）
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// 路由配置
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <SimpleLayout>
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </SimpleLayout>
    ),
  },
  {
    path: "/register",
    element: (
      <SimpleLayout>
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      </SimpleLayout>
    ),
  },
]);
```

#### 5.3.2 路由守卫

项目实现了两种路由守卫：

- **ProtectedRoute**: 保护需要登录的页面，未登录用户重定向到登录页
- **PublicRoute**: 保护登录/注册页面，已登录用户重定向到仪表板

路由守卫的实现已在上面的路由配置中展示，通过 Zustand 状态管理获取用户认证状态。

### 5.4 样式开发规范 (TailwindCSS)

#### 5.4.1 样式组织

- **原子化优先**：优先使用 Tailwind 工具类
- **组件样式**：复杂样式使用 `@apply` 或 CSS-in-JS
- **主题定制**：TailwindCSS v4+ 使用 CSS 变量进行主题定制，无需配置文件
- **设计变量**：颜色、圆角等集中定义在 `style.css` 的 `@theme` 中，不在组件里写死

#### 5.4.2 响应式设计

```typescript
// 移动优先的响应式设计
<div
  className="
  w-full p-4
  sm:w-1/2 sm:p-6
  md:w-1/3 md:p-8
  lg:w-1/4 lg:p-10
"
>
  响应式内容
</div>
```

#### 5.4.3 样式复用

```typescript
// lib/styles.ts - 样式工具函数
export const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

export const getButtonClasses = (variant: keyof typeof buttonVariants) => {
  return cn(
    "px-4 py-2 rounded-md font-medium transition-colors",
    buttonVariants[variant]
  );
};
```

#### 5.4.4 主题系统规范

项目目前只提供明亮主题，未引入主题切换库。颜色与圆角等设计变量集中定义在
`src/style.css` 的 `@theme` 中，页面通过 `.panel`、`.button-primary`、`.field`
等语义化类复用样式。

如需暗黑模式，再引入 `next-themes` 并按 TailwindCSS 的 `dark:` 变体扩展，
不要在未使用前预先安装依赖。

### 5.5 组件开发规范

#### 5.5.1 组件结构

页面组件放在 `src/pages/`，跨页面复用的组件放在 `src/components/`。
样式优先使用 `style.css` 中已有的语义化类，而不是在每个组件里堆砌原子类：

```tsx
// src/components/layout/Layout.tsx —— 复用 .shell 控制页面宽度
export function Layout() {
  return (
    <div className="shell">
      <Outlet />
    </div>
  );
}
```

若需要下拉菜单、对话框这类交互复杂的成品组件，用 shadcn 按需引入，
它会把源码直接写进 `src/components/ui/` 并自动补齐所需依赖：

```bash
bunx shadcn@latest add dropdown-menu
```

项目保留了 `components.json` 供该命令使用，但不预装任何未被使用的组件。

### 5.6 移动端适配规范 📱

#### 5.6.1 响应式设计原则

- **移动优先 (Mobile First)**：从最小屏幕开始设计，逐步增强到大屏幕
- **断点策略**：使用 TailwindCSS 标准断点
  - `xs`: < 640px (手机竖屏)
  - `sm`: ≥ 640px (手机横屏/小平板)
  - `md`: ≥ 768px (平板)
  - `lg`: ≥ 1024px (桌面)
  - `xl`: ≥ 1280px (大桌面)
  - `2xl`: ≥ 1536px (超大桌面)

```typescript
// 响应式布局示例
<div
  className="
  // 移动端：单列布局，小间距
  flex flex-col gap-4 p-4
  // 平板：两列布局，中等间距
  md:grid md:grid-cols-2 md:gap-6 md:p-6
  // 桌面：三列布局，大间距
  lg:grid-cols-3 lg:gap-8 lg:p-8
"
>
  {items.map((item) => (
    <Card
      key={item.id}
      className="
      // 移动端：全宽卡片
      w-full
      // 桌面：固定最大宽度
      lg:max-w-sm
    "
    >
      {item.content}
    </Card>
  ))}
</div>
```

#### 5.5.2 触摸交互优化

- **触摸目标尺寸**：最小 44px × 44px (iOS) 或 48dp × 48dp (Android)
- **触摸反馈**：提供清晰的视觉和触觉反馈
- **手势支持**：支持常见手势操作

```typescript
// 触摸友好的按钮组件
export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  variant = "primary",
  size = "default",
  ...props
}) => {
  const sizeClasses = {
    small: "min-h-[44px] px-4 py-2 text-sm",
    default: "min-h-[48px] px-6 py-3 text-base",
    large: "min-h-[56px] px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        // 基础样式
        "relative overflow-hidden rounded-lg font-medium transition-all duration-200",
        // 触摸反馈
        "active:scale-95 active:brightness-90",
        // 焦点样式
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        // 尺寸
        sizeClasses[size],
        // 变体样式
        buttonVariants[variant]
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### 5.5.3 移动端导航设计

- **底部导航栏**：主要导航使用底部标签栏
- **汉堡菜单**：次要功能使用侧边抽屉
- **面包屑导航**：深层页面提供返回路径

```typescript
// 移动端底部导航组件
export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: HomeIcon, label: "首页" },
    { path: "/explore", icon: SearchIcon, label: "发现" },
    { path: "/notifications", icon: BellIcon, label: "通知" },
    { path: "/profile", icon: UserIcon, label: "我的" },
  ];

  return (
    <nav
      className="
      // 固定在底部
      fixed bottom-0 left-0 right-0 z-50
      // 背景和边框
      bg-white/95 backdrop-blur-sm border-t border-gray-200
      // 安全区域适配
      pb-safe
      // 桌面端隐藏
      lg:hidden
    "
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-h-[56px] px-3 py-1 rounded-lg",
                "transition-colors duration-200",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
```

#### 5.5.4 移动端表单优化

- **输入类型优化**：使用正确的 input type 触发合适的键盘
- **标签和占位符**：提供清晰的输入指导
- **验证反馈**：实时验证和错误提示

```typescript
// 移动端优化的输入组件
export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  type = "text",
  error,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          // 基础样式
          "w-full px-4 py-3 text-base rounded-lg border",
          // 移动端优化：更大的触摸区域
          "min-h-[48px]",
          // 焦点样式
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          // 错误状态
          error ? "border-red-300 bg-red-50" : "border-gray-300 bg-white",
          // 禁用缩放（防止iOS Safari缩放）
          "text-[16px] sm:text-sm"
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <ExclamationCircleIcon className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};
```

#### 5.5.5 移动端性能优化

- **图片优化**：使用 WebP 格式，实现懒加载
- **代码分割**：按路由和功能分割代码
- **预加载策略**：预加载关键资源
- **缓存策略**：合理使用浏览器缓存

```typescript
// 移动端图片组件
export const MobileImage: React.FC<MobileImageProps> = ({
  src,
  alt,
  className,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 懒加载实现
  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = src;
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [src, priority]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={priority ? src : undefined}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <PhotoIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};
```

#### 5.5.6 移动端手势支持

- **滑动手势**：支持左右滑动导航
- **下拉刷新**：实现下拉刷新功能
- **无限滚动**：长列表使用无限滚动

```typescript
// 滑动手势 Hook
export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: SwipeGestureOptions) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
```

#### 5.5.7 移动端安全区域适配

- **安全区域**：适配 iPhone 刘海屏和底部指示器
- **状态栏**：考虑状态栏高度
- **虚拟键盘**：处理虚拟键盘弹出时的布局调整

```css
/* 安全区域 CSS 变量 */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

/* TailwindCSS 自定义类 */
@layer utilities {
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .pl-safe {
    padding-left: env(safe-area-inset-left);
  }
  .pr-safe {
    padding-right: env(safe-area-inset-right);
  }
}
```

### 5.6 API 调用规范

#### 5.6.1 API 客户端

```typescript
// lib/client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

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

### 5.7 性能优化

#### 5.7.1 代码分割

- **路由级分割**：使用 `React.lazy` 分割页面组件
- **组件级分割**：大型组件使用动态导入
- **第三方库分割**：大型依赖库单独打包

#### 5.7.2 渲染优化

- **使用 React.memo**：防止不必要的重渲染
- **使用 useMemo/useCallback**：缓存计算结果和函数
- **虚拟滚动**：长列表使用虚拟滚动

### 5.8 类型定义规范

#### 5.8.1 接口定义

```typescript
// api/user.ts

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
}
```

#### 5.8.1 类型定义

```typescript
// types/user.d.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 5.9 注释规范

- **组件注释**：复杂组件需要说明其用途和主要功能
- **业务逻辑注释**：对于复杂的业务逻辑，添加必要的注释说明
- **类型注释**：复杂类型定义需要注释说明
- **API 注释**：API 调用需要注释说明用途和参数

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

## 8. 项目特定规约

### 8.1 代码规范

- 记住，代码是写给人看的，只是机器恰好可以运行而已！
- 保持代码简洁、可读、可维护，遵循项目约定，让团队协作更加高效。
