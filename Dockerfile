# 第一阶段：前端构建阶段
# Bun 负责依赖安装与 scripts；React Router/Vite 的 prerender/server build 需要
# Node 专用的 react-dom/server API。纯 Bun runtime 会按 "bun" condition 解析到
# server.bun.js（没有 renderToPipeableStream），因此构建镜像必须同时提供 Node。
FROM --platform=$BUILDPLATFORM oven/bun:1.3.14-alpine AS bun-runtime

FROM --platform=$BUILDPLATFORM node:22.22.0-alpine AS frontend-builder

# 两个基础镜像都是 Alpine/musl，直接复用固定版本 Bun 二进制，避免 curl 安装和版本漂移。
COPY --from=bun-runtime /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# 复制前端依赖清单
COPY web/package.json web/bun.lock ./

# 安装前端依赖
RUN bun install --frozen-lockfile

# SEO 元数据在构建期写入静态 HTML。
# 品牌类 ARG 默认留空：resolveSiteConfig() 会回退到 web/src/config/site-config.ts，
# 只有同一份代码需要按部署环境覆盖品牌时才传这些 build args。
ARG VITE_SITE_URL
ARG VITE_SITE_NAME
ARG VITE_SITE_SHORT_NAME
ARG VITE_SITE_MARK
ARG VITE_SITE_FAVICON
ARG VITE_SITE_LOCALE
ARG VITE_SITE_PRIMARY_KEYWORD
ARG VITE_SITE_TITLE
ARG VITE_SITE_DESCRIPTION
ARG VITE_SITE_IMAGE
ARG VITE_HOME_PRIMARY_TOOL_SLUG
ARG SEO_STRICT=false
ARG SEO_ALLOW_TEMPLATE_EXAMPLES=false
ARG SEO_ALLOW_SVG_SOCIAL_IMAGE=false
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_SITE_NAME=$VITE_SITE_NAME \
    VITE_SITE_SHORT_NAME=$VITE_SITE_SHORT_NAME \
    VITE_SITE_MARK=$VITE_SITE_MARK \
    VITE_SITE_FAVICON=$VITE_SITE_FAVICON \
    VITE_SITE_LOCALE=$VITE_SITE_LOCALE \
    VITE_SITE_PRIMARY_KEYWORD=$VITE_SITE_PRIMARY_KEYWORD \
    VITE_SITE_TITLE=$VITE_SITE_TITLE \
    VITE_SITE_DESCRIPTION=$VITE_SITE_DESCRIPTION \
    VITE_SITE_IMAGE=$VITE_SITE_IMAGE \
    VITE_HOME_PRIMARY_TOOL_SLUG=$VITE_HOME_PRIMARY_TOOL_SLUG \
    SEO_STRICT=$SEO_STRICT \
    SEO_ALLOW_TEMPLATE_EXAMPLES=$SEO_ALLOW_TEMPLATE_EXAMPLES \
    SEO_ALLOW_SVG_SOCIAL_IMAGE=$SEO_ALLOW_SVG_SOCIAL_IMAGE

# 复制前端源码并构建
COPY web/ ./
RUN bun run build

# 第二阶段：后端构建阶段
# 同样固定在宿主架构上运行，通过 GOOS/GOARCH 交叉编译出目标架构的二进制
FROM --platform=$BUILDPLATFORM golang:1.26.0-alpine AS backend-builder

WORKDIR /app

# 默认使用官方模块代理；国内本地构建可覆盖：
#   docker build --build-arg GOPROXY=https://goproxy.cn,direct .
ARG GOPROXY=https://proxy.golang.org,direct
ENV GOPROXY=$GOPROXY

# 复制 Go 模块文件并下载依赖
COPY go.mod go.sum ./
RUN go mod download

# 复制后端源码
COPY . .

# 构建后端：
# - modernc.org/sqlite 为纯 Go 实现，无需 CGO，可直接交叉编译
# - TARGETOS/TARGETARCH 由 buildx 按 --platform 自动注入
# - -trimpath -ldflags="-s -w" 去掉本机路径与调试符号，减小体积
ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -trimpath -ldflags="-s -w" -o server main.go

# 第三阶段：运行阶段
# 固定版本而非 latest：既保证可重现，dependabot 也才能跟踪升级
FROM alpine:3.24

WORKDIR /app

# 以非 root 用户运行；uid/gid 固定为 1000，方便宿主机为挂载卷设置权限。
# /app/data 是 SQLite 数据卷挂载点（见 docker-compose.yml）
RUN addgroup -g 1000 app && adduser -D -u 1000 -G app app \
    && mkdir -p /app/data && chown app:app /app/data

# 二进制与静态文件保持 root 属主（app 用户只读、可执行），无需 chmod：
# COPY 会保留构建阶段的可执行权限位
COPY --from=backend-builder /app/server /app/server
COPY --from=frontend-builder /app/dist/client /app/static

USER app

# 配置默认值 DB_PATH=app.db 是相对路径，会落在 root 属主的 /app 下，
# 非 root 用户无法创建；镜像里显式指向 app 属主的数据目录，
# 让不带任何环境变量的 docker run 也能启动（compose 设置的是同一个值）
ENV DB_PATH=/app/data/app.db

# 暴露端口
EXPOSE 1323

# 启动应用
CMD ["/app/server"]
