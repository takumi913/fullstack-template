# 第一阶段：前端构建阶段
FROM oven/bun:1.3.2-alpine AS frontend-builder

# 设置工作目录
WORKDIR /app

# 复制前端项目文件
COPY web/package.json .

# 安装前端依赖
RUN bun install --frozen-lockfile

# 复制前端源码
COPY web/ ./

# 构建前端
RUN bun run build

# 第二阶段：后端构建阶段
FROM golang:1.24-alpine AS backend-builder

# 安装构建依赖（gcc 和 musl-dev 是 CGO 必需的）
RUN apk add --no-cache git make bash gcc musl-dev

# 设置工作目录
WORKDIR /app

# 复制 Go 模块文件
COPY go.mod go.sum ./

# 下载 Go 依赖
RUN go env -w GO111MODULE=on &&  go env -w GOPROXY=https://goproxy.cn,direct && go mod download

# 复制后端源码
COPY . .

# 从前端构建阶段复制构建结果
COPY --from=frontend-builder /app/dist ./web/dist

# 复制前端静态文件到后端静态目录
RUN mkdir -p static && cp -r web/dist/* static/

# 构建后端（go-sqlite3 需要 CGO 支持）
RUN CGO_ENABLED=1 go build -o server main.go

# 第三阶段：运行阶段
FROM alpine:latest

# 设置工作目录
WORKDIR /app

# 从后端构建阶段复制二进制程序和静态文件
COPY --from=backend-builder /app/server /app/server
COPY --from=backend-builder /app/static /app/static

# 设置二进制程序的执行权限
RUN chmod +x /app/server

# 暴露端口
EXPOSE 1323

# 启动应用
CMD ["/app/server"]
