# 前端

Solid 2 的配套版本见 [stack.md](stack.md)。不要混用上一代 Solid API。

## 组件

- `createSignal`、`createStore`、`For`、`Show`、`Loading` 从 `solid-js` 导入。DOM、SSR 和 `JSX` 从 `@solidjs/web` 导入。
- 读 signal 要调用，例如 `pending()`。组件里用 `props.value`，不要解构 props。
- DOM 用 `class`、`onInput`、`event.currentTarget`。动态类用数组和对象。
- `createEffect(compute, apply)` 的第一个函数只读依赖，副作用和清理在第二个函数。
- 计时器、监听和动画帧用 `onSettled` 注册，并在清理函数里卸掉。
- 路由模块用 `lazy(() => import("./routes/login"))`。具名导出写 `{ export: "Name" }`。不要在 import 后再包一层新的模块对象。
- 站内跳转用 `<a href>`，不要换成另一套导航组件。

## 状态与请求

登录状态由服务端 Session 恢复。每个应用实例自己的 `AppStateProvider`，不要在模块顶层共享用户。凭据只在 HttpOnly Cookie 里，不要复制到 localStorage。

axios 实例只放在 `src/lib/client.ts`：`withCredentials: true`，失败包成带 `status` 和业务 `code` 的 `ApiError`。401 发事件给 auth store 清理并跳转，拦截器里不要改 `window.location`。

表单提交用 `createAsyncAction`。提交中用 `pending()` 禁用按钮。错误写在表单里，不弹全局通知。

## 样式与语言

颜色、圆角、字体只加在 `style.css` 的 `@theme`，组件引用语义类。默认深色主题，用根元素 `data-theme` 和 localStorage 键同步；首屏脚本在绘制前恢复，避免闪烁。

`web/src/i18n/locales.json` 是语言和 URL 前缀的唯一来源。英文没有前缀，简体中文是 `/zh-cn`。URL 决定语言，不要按浏览器语言自动跳转。应用文案用 i18next，中英键保持同步。不要为了 SEO 再做 hreflang、sitemap 或预渲染。

Vite 使用 `@solidjs/vite-plugin` 的 start 模式，`ssr: false`。构建仍输出 `web/dist/client`，由 Go 托管。开发服务器只代理 `/api`。
