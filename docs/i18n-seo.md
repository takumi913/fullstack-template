# English-first i18n and SEO

## Language and URL contract

English is the default and SEO source language. Simplified Chinese is a fully localized version, not a browser-only toggle.

| Language | Home | Tool | Privacy / terms |
| --- | --- | --- | --- |
| `en` | `/` | `/tools/json-formatter` | `/legal/privacy-policy`, `/legal/terms` |
| `zh-CN` | `/zh-cn` | `/zh-cn/tools/json-formatter` | `/zh-cn/legal/privacy-policy`, `/zh-cn/legal/terms` |

`web/src/i18n/locales.json` is the shared registry for the frontend route generator, Go private SPA fallback prefixes, and generated static-host redirects. The URL determines the document and UI language. There is no automatic IP, browser-language, or cookie redirect. Public links keep the selected language. Google recommends separate language URLs, a consistently localized visible page, and explicit language links. [Google multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

Each translation has a **self-canonical**, not a canonical to English. Reciprocal `hreflang` and English `x-default` are generated from existing content variants. The sitemap uses the same data as HTML, includes only indexable pages, and validates alternate targets. A published version does not advertise a draft/noindex translation; publish both reviewed versions to establish the full family. [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).

## Content ownership

- `config/site-config.ts`: shared brand, English SEO defaults, appearance, homepage primary tool.
- `config/site-copy.ts`: complete English/Chinese homepage and hub copy and local keywords.
- `i18n/common.ts`: navigation, buttons, tools and generic messages (`common`).
- `i18n/private.ts`: authentication and workspace UI (`app`), imported only by private/auth routes.
- `content/tool-pages.ts`, `content/landing-pages.ts`: localized body, title, description, H1, FAQ, related links and publication state.
- `content/legal-pages.ts`: complete policies per language, review status and effective date.
- `pkg/model/messages.go`: bilingual user-facing API messages. Services retain business validation; HTTP boundaries select language using `Accept-Language`. The private Axios client sends the URL language.

The Chinese dictionaries use `satisfies typeof en`, and i18next keys are typed. Keep both languages complete rather than relying on English fallback for Chinese page content. `SiteI18nProvider` creates an independent synchronous i18next instance per document; concurrent prerenders do not share a mutable language singleton. [react-i18next SSR](https://react.i18next.com/latest/ssr), [i18next configuration](https://www.i18next.com/overview/configuration-options).

## Adding a translated tool or guide

Give each actual variant its own internal `slug`, explicit `locale` and `path`, and the same `translationKey`:

```ts
// English definition
{ slug: "task", translationKey: "task", locale: "en", path: "/tools/task", /* complete content */ }
// Chinese definition: reuse the runtime, localize the whole page
{ slug: "task-zh-cn", translationKey: "task", locale: "zh-CN", path: "/zh-cn/tools/task", /* complete Chinese content */ }
```

Do not hand-maintain a second URL list or reciprocal alternate arrays. The definition registry derives hreflang, prerender paths and sitemap entries. Internal links use the variant’s localized slugs. Hubs list only their language’s content. A homepage primary tool requires an actual routable translation in every supported language; missing translations fail preflight instead of mixing English tools into Chinese pages.

To add another language later: add its registry entry and full typed dictionaries, homepage/hub and policy content, then add real tool/guide variants. The router and Go language prefixes are derived from the registry. Run typecheck and build verification before publishing.

## SEO strategy and rollout

GeFei’s single-page → multi-page → multilingual approach is applied as **demand-led expansion**, not bulk translation. Start with the real English search intent, deliver a useful tool immediately, then add guides, comparisons and use-case pages only when each answers a distinct need. Localize Chinese keyword intent and examples instead of merely translating a keyword list. His article also cautions against low-quality mechanical multilingual expansion. [GeFei: the overseas website growth flywheel](https://new.web.cafe/topic/v6wkttow5n).

English titles/descriptions, visible content, navigation, JSON-LD and social metadata are aligned. Chinese versions receive their own metadata, breadcrumbs and structured-data language. Template examples remain `noindex, follow`; policy drafts remain noindex too. Unknown public URLs return real HTTP 404, and only auth/private URLs use the SPA fallback. Static-host language rules are generated from the same English routing policy. [Cloudflare redirects](https://developers.cloudflare.com/pages/configuration/redirects/).

For production:

1. Replace scaffold branding and both homepage/hub copies with the actual product.
2. Replace/remove example pages; use `published` and remove `templateExample` only after review.
3. Review **both** privacy and terms against actual operator, contact, data flows, providers, retention, pricing and regions. Set `status: "published"` and `updatedAt: "YYYY-MM-DD"` after completing the text. Draft notices are not shown for published policies.
4. Set a real `VITE_SITE_URL`, production raster social image and `SEO_STRICT=true`. Strict preflight blocks unpublished/undated policies. `SEO_ALLOW_TEMPLATE_EXAMPLES=true` is exclusively for template CI/preview.
5. Run `make lint`, `bun run typecheck`, tests and both static/interactive homepage builds. Inspect English/Chinese HTML, sitemap and language switch targets, then submit the sitemap to Search Console and measure actual queries and conversions. No ranking outcome is guaranteed.
