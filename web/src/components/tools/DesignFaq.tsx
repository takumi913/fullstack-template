import { createSignal, For } from "solid-js";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { useLocale } from "@/i18n/context";

export function DesignFaq() {
  const locale = useLocale();
  const copy = () => toolsmithCopy(locale());
  const [opened, setOpened] = createSignal(0);
  return (
    <section id="faq" class="design-container design-faq" data-screen-label="FAQ">
      <div>
        <div class="design-eyebrow">FAQ</div>
        <h2>{copy().faqTitle}</h2>
      </div>
      <div class="design-faq-list">
        <For each={copy().faq}>
          {(item, index) => (
            <div class="design-faq-item">
              <button
                type="button"
                class="design-faq-question"
                aria-expanded={opened() === index() ? "true" : "false"}
                aria-controls={`faq-answer-${index()}`}
                onClick={() => setOpened(opened() === index() ? -1 : index())}
              >
                <span>{item[0]}</span>
                <span class="design-faq-plus" aria-hidden="true">
                  +
                </span>
              </button>
              <div
                id={`faq-answer-${index()}`}
                class={["design-faq-answer", { open: opened() === index() }]}
                inert={opened() !== index()}
              >
                <div>
                  <div class="design-faq-answer-copy">{item[1]}</div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
