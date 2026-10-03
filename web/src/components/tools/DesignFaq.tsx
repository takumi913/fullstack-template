import { useState } from "react";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { useLocale } from "@/i18n/useLocale";

export function DesignFaq() {
  const copy = toolsmithCopy(useLocale());
  const [opened, setOpened] = useState(0);
  return (
    <section id="faq" className="design-container design-faq" data-screen-label="FAQ">
      <div>
        <div className="design-eyebrow">FAQ</div>
        <h2>{copy.faqTitle}</h2>
      </div>
      <div className="design-faq-list">
        {copy.faq.map(([question, answer], index) => (
          <div className="design-faq-item" key={question}>
            <button
              type="button"
              className="design-faq-question"
              aria-expanded={opened === index}
              aria-controls={`faq-answer-${index}`}
              onClick={() => setOpened(opened === index ? -1 : index)}
            >
              <span>{question}</span>
              <span className="design-faq-plus" aria-hidden="true">
                +
              </span>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`design-faq-answer ${opened === index ? "open" : ""}`}
              inert={opened !== index}
            >
              <div>
                <div className="design-faq-answer-copy">{answer}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
