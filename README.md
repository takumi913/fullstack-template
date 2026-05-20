# Go + React 全栈项目模板

<div align="center">
  <img src="./assets/logo.svg" alt="Go + React 全栈项目模板" width="200" height="200">
</div>

<div align="center">
  <h3>🚀 现代化全栈开发模板</h3>
  <p>使用 Go (Echo) + React + TypeScript 构建的高性能 Web 应用模板</p>
</div>

---

一个现代化的全栈 Web 应用模板，使用 Go (Echo) 作为后端，React + TypeScript 作为前端，集成了完整的开发工具链和最佳实践。

## ✨ 特性

### 后端 (Go)

- 🚀 **Echo** - 高性能 Web 框架
- 🗄️ **GORM** - ORM 库，支持 SQLite/PostgreSQL/MySQL
- 🔐 **SESSION** - 身份认证
- 📝 **结构化日志** - 使用 logrus
- 🔍 **代码质量检查** - golangci-lint 集成
- 🐳 **Docker** - 容器化部署

### 前端 (React)

- ⚛️ **React 19** - 最新版本
- 📘 **TypeScript** - 类型安全
- 🎨 **Tailwind CSS** - 现代化样式框架
- 🔧 **Vite** - 快速构建工具
- 📦 **Bun** - 高性能 JavaScript 运行时和包管理器
- 🧩 **组件库** - Radix UI + shadcn/ui

### 开发工具

- 🔍 **golangci-lint** - Go 代码质量检查
- 🔧 **ESLint** - 前端代码检查
- 🚀 **热重载** - 开发时自动重载
- 📋 **Makefile** - 统一的项目管理
- 🔄 **GitHub Actions** - CI/CD 流水线

## 🚀 快速开始

### 环境要求

- **Go** >= 1.24
- **Bun**
- **golangci-lint** (可选，用于代码检查)

### 安装依赖

```bash
# 克隆项目
git clone <your-repo-url>
cd go-react-template

# 安装所有依赖
make install

# 或手动安装
go mod download
cd web && bun install --frozen-lockfile
```

### 开发模式

```bash
# 启动前端开发服务器 (http://localhost:5173)
make dev

# 启动后端服务器 (http://localhost:1323)
make dev-go

# 或分别启动
cd web && bun run dev     # 前端
air                      # 后端（热重载）
go run main.go           # 后端（传统方式）
```

### 生产构建

```bash
# 完整构建（前端 + 后端）
make build

# 运行构建后的程序
make run
# 或直接运行
./server
```

## 🔍 代码质量检查

本项目集成了 golangci-lint 进行 Go 代码质量检查。

### 安装 golangci-lint

```bash
# 方式 1: Go install
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# 方式 2: Homebrew (macOS)
brew install golangci-lint

# 方式 3: 使用项目脚本
make install-tools
```

### 运行代码检查

```bash
# 检查所有代码
make lint

# 只检查 Go 代码
make lint-go
./scripts/lint.sh

# 只检查前端代码
make lint-web
```

### 配置说明

- **配置文件**: `.golangci.yml`
- **CI/CD 集成**: `.github/workflows/ci.yml`
- **详细文档**: [docs/golangci-lint.md](docs/golangci-lint.md)

## 🐳 Docker 部署

### 构建和运行

```bash
# 构建 Docker 镜像
make docker-build

# 运行 Docker 容器
make docker-run

# 使用 docker-compose
make docker-compose-up
```

### 环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
vim .env
```

主要环境变量：

| 变量名           | 默认值            | 说明             |
| ---------------- | ----------------- | ---------------- |
| `SERVER_ADDRESS` | `:1323`           | 服务器监听地址   |
| `DATABASE_URL`   | `./data.db`       | 数据库连接字符串 |
| `SESSION_SECRET` | `your-secret-key` | SESSION 签名密钥     |
| `LOG_LEVEL`      | `info`            | 日志级别         |


## 🛠️ 开发工具

### Makefile 命令

```bash
# 查看所有可用命令
make help

# 安装开发工具（包括 golangci-lint 和 air）
make install-tools

# 代码质量检查
make lint           # 检查所有代码
make lint-go        # 只检查 Go 代码
make lint-web       # 只检查前端代码

# 构建项目
make build          # 构建完整项目
make build-go       # 只构建后端
make build-web      # 只构建前端

# 开发模式（热重载）
make dev-web        # 启动前端开发服务器
make dev-go         # 启动后端开发服务器（使用 air 热重载）

# Docker 相关
make docker-build   # 构建 Docker 镜像
make docker-run     # 运行 Docker 容器
make docker-up      # 使用 docker-compose 启动
make docker-down    # 使用 docker-compose 停止
```


## 🚀 部署

### 生产环境部署

1. **构建项目**

   ```bash
   make build
   ```

2. **配置环境变量**

   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   ```

3. **运行服务**
   ```bash
   ./server
   ```

### Docker 部署

1. **使用 docker-compose**

   ```bash
   docker-compose up -d
   ```

2. **手动 Docker 部署**

   ```bash
   # 构建镜像
   docker build -t go-react-template .

   # 运行容器
   docker run -d -p 1323:1323 \
     -e DATABASE_URL="/app/data/data.db" \
     -e SESSION_SECRET="your-secret-key" \
     -v $(pwd)/data:/app/data \
     go-react-template
   ```

## 📚 文档

- [代码质量检查 (golangci-lint)](./docs/golangci-lint.md)
- [热重载开发 (Air)](./docs/air.md)
- [API 文档](./docs/api.md)
- [部署指南](./docs/deployment.md)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

### 代码规范

- 所有 Go 代码必须通过 `golangci-lint` 检查
- 前端代码必须通过 ESLint 检查
- 提交前请运行 `make lint` 确保代码质量
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Echo](https://echo.labstack.com/) - 高性能 Go Web 框架
- [React](https://reactjs.org/) - 用户界面库
- [golangci-lint](https://golangci-lint.run/) - Go 代码检查工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Vite](https://vitejs.dev/) - 前端构建工具
