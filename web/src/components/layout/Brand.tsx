import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { siteConfig } from "@/seo/site";
import { cn } from "@/lib/utils";

export function Brand(props: { class?: string }) {
  const locale = useLocale();
  return (
    <a class={cn("design-brand", props.class)} href={localizedPath("/", locale())}>
      <span class="design-brand-diamond" aria-hidden="true" />
      <span>{siteConfig.name}</span>
    </a>
  );
}
