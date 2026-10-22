import { createSignal, For } from "solid-js";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { trackSpot } from "@/lib/track-spot";

export default function ResourcesPage() {
  const locale = useLocale(),
    copy = () => toolsmithCopy(locale());
  const [tag, setTag] = createSignal(0);
  return (
    <section class="design-container design-blog" data-screen-label="Blog">
      <div class="design-eyebrow">{copy().navBlog}</div>
      <h1 class="design-page-title">{copy().blogTitle}</h1>
      <p class="design-page-subtitle">{copy().blogSub}</p>
      <div class="design-filters design-blog-filters">
        <For each={copy().blogTagsL}>
          {(label, index) => (
            <button
              type="button"
              class={["design-filter", { active: tag() === index() }]}
              aria-pressed={tag() === index() ? "true" : "false"}
              onClick={() => setTag(index())}
            >
              {label}
            </button>
          )}
        </For>
      </div>
      <div class="design-post-grid">
        <For each={copy().posts.filter((post) => !tag() || post.tag === tag())}>
          {(post) => (
            <a
              class="design-post"
              href={localizedPath("/guides/read-paper", locale())}
              onMouseMove={trackSpot}
            >
              <div class="design-post-top">
                <span class="design-post-tag">{copy().blogTagsL[post.tag]}</span>
                <span class="design-post-date">{post.date}</span>
              </div>
              <div class="design-post-title">{post.title}</div>
              <div class="design-post-description">{post.desc}</div>
              <div class="design-post-bottom">
                <span>{post.read}</span>
                <span>{copy().readGuide} →</span>
              </div>
            </a>
          )}
        </For>
      </div>
    </section>
  );
}
