import { useMemo, useState } from "react";

export function WordCounterTool() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      characters: text.length,
      lines: text ? text.split(/\r?\n/).length : 0,
      paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0,
    };
  }, [text]);

  return (
    <div className="rounded-xl border bg-zinc-50 p-4 sm:p-6">
      <label className="text-sm font-medium text-zinc-800" htmlFor="word-counter-input">
        Text
      </label>
      <textarea
        id="word-counter-input"
        className="mt-2 min-h-56 w-full rounded-lg border bg-white p-3 text-sm leading-6 outline-none focus:border-zinc-400"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(stats).map(([label, value]) => (
          <div className="rounded-lg border bg-white p-3" key={label}>
            <dt className="text-xs capitalize text-zinc-500">{label}</dt>
            <dd className="mt-1 text-xl font-semibold text-zinc-950">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
