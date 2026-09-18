import { legalPages } from "@/content/legal-pages";
import { SettingsPage } from "./ProfileSettingsPage";

export default function TermsPage() {
  const page = legalPages.terms;

  return (
    <SettingsPage title={page.title} description={page.description}>
      <article className="max-w-2xl space-y-8 text-sm leading-7 text-zinc-600">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-medium text-zinc-950">{section.heading}</h2>
            <p className="mt-2">{section.body}</p>
          </section>
        ))}
      </article>
    </SettingsPage>
  );
}
