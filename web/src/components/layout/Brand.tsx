import { Link } from "react-router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { siteConfig } from "@/seo/site";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <Link className={cn("design-brand", className)} to={localizedPath("/", locale)}>
      <span className="design-brand-diamond" aria-hidden="true" />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
