import { useState } from "react";
import { Link } from "react-router";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { trackSpot } from "@/lib/track-spot";

export default function ResourcesPage() {
  const locale = useLocale(),
    copy = toolsmithCopy(locale);
  const [tag, setTag] = useState(0);
  return (
    <section className="design-container design-blog" data-screen-label="Blog">
      <div className="design-eyebrow">{copy.navBlog}</div>
      <h1 className="design-page-title">{copy.blogTitle}</h1>
      <p className="design-page-subtitle">{copy.blogSub}</p>
      <div className="design-filters design-blog-filters">
        {copy.blogTagsL.map((label, index) => (
          <button
            type="button"
            key={label}
            className={`design-filter ${tag === index ? "active" : ""}`}
            aria-pressed={tag === index}
            onClick={() => setTag(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="design-post-grid">
        {copy.posts
          .filter((post) => !tag || post.tag === tag)
          .map((post) => (
            <Link
              className="design-post"
              key={post.title}
              to={localizedPath("/guides/read-paper", locale)}
              onMouseMove={trackSpot}
            >
              <div className="design-post-top">
                <span className="design-post-tag">{copy.blogTagsL[post.tag]}</span>
                <span className="design-post-date">{post.date}</span>
              </div>
              <div className="design-post-title">{post.title}</div>
              <div className="design-post-description">{post.desc}</div>
              <div className="design-post-bottom">
                <span>{post.read}</span>
                <span>{copy.readGuide} →</span>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
