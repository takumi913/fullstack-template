# 目录

一个仓库，前后端分开。Go 模块在根目录，前端只在 `web/`。不要把前端依赖装到仓库根。

```text
.
├── main.go                 # 启动、优雅退出、静态文件
├── Makefile
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── sqlc.yaml
├── api/                    # 路由注册与接口测试
├── configs/                # 环境变量
├── db/migrations/sqlite/
├── db/migrations/postgres/
├── db/query/sqlite/
├── db/query/postgres/
├── db/generated/           # sqlc 生成，禁止手改
├── pkg/database/
├── pkg/handler/
├── pkg/middleware/
├── pkg/model/
├── pkg/repo/
├── pkg/service/
├── scripts/build.sh
└── web/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/            # 请求类型与调用放在一起
        ├── components/     # 第二个使用者出现后再提取
        ├── i18n/
        ├── lib/
        ├── pages/
        ├── routes/         # 页面路由模块
        ├── router/         # 守卫
        ├── store/
        ├── routes.tsx
        └── style.css
```

不要建 `types/`、空的分类目录，或 `web/src/seo`、`web/src/content`、`web/src/tools`。那些是已删除的工具站，不是这套栈的一部分。

## 分层

- handler：绑定入参、调 service、用统一的 `success` / `failure` 返回。不写业务规则，不把原始错误回给客户端。
- service：业务规则、校验、事务。
- repo：只做数据访问，在这里切换 sqlc 的 sqlite / postgres 生成包。
- model：普通 struct 加 JSON 标签。校验不靠标签。

前端页面先写在使用它的页面里。路由表只在 `src/routes.tsx`。登录页套 `PublicRoute`，后台页套 `ProtectedRoute`，包在 layout 上，不要每个页面再包一次。

## 静态资源

开发时 Vite 把 `/api` 代理到 `http://localhost:1323`。生产构建产物是 `web/dist/client`，复制为进程旁的 `static/`。Go 托管这个目录和 API，不另起前端服务。

未知路径返回真实 HTTP 404。只有实际存在的页面路径才回退到 `index.html`。`/api` 缺失不能落到 HTML。
