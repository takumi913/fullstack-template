# 生产镜像只有 Go 二进制和静态文件，不运行 Node。
# Bun 镜像标签必须与 web/package.json 的 packageManager 一致。
# Go 镜像标签必须与 go.mod 的 go 指令一致。
FROM --platform=$BUILDPLATFORM oven/bun:1.3.14-alpine AS bun-runtime

FROM --platform=$BUILDPLATFORM node:26.12.1-alpine AS frontend-builder

COPY --from=bun-runtime /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY web/package.json web/bun.lock ./
RUN bun install --frozen-lockfile

COPY web/ ./
RUN bun run build

FROM --platform=$BUILDPLATFORM golang:1.26.0-alpine AS backend-builder

WORKDIR /app

ARG GOPROXY=https://proxy.golang.org,direct
ENV GOPROXY=$GOPROXY

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -trimpath -ldflags="-s -w" -o server main.go

FROM alpine:3.24

WORKDIR /app

RUN addgroup -g 1000 app && adduser -D -u 1000 -G app app \
    && mkdir -p /app/data && chown app:app /app/data

COPY --from=backend-builder /app/server /app/server
COPY --from=frontend-builder /app/dist/client /app/static

USER app

ENV DB_PATH=/app/data/app.db

EXPOSE 1323

CMD ["/app/server"]
