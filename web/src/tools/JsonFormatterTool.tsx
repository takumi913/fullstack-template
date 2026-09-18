import { useState } from "react";

const initialValue = '{\n  "hello": "world",\n  "count": 2\n}';

export function JsonFormatterTool() {
  const [input, setInput] = useState(initialValue);
  const [output, setOutput] = useState(initialValue);
  const [error, setError] = useState("");

  const transform = (mode: "format" | "minify") => {
    try {
      const parsed = JSON.parse(input) as unknown;
      setOutput(JSON.stringify(parsed, null, mode === "format" ? 2 : 0));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid JSON");
    }
  };

  return (
    <div className="rounded-xl border bg-zinc-50 p-4 sm:p-6">
      <label className="text-sm font-medium text-zinc-800" htmlFor="json-input">
        JSON input
      </label>
      <textarea
        id="json-input"
        className="mt-2 min-h-52 w-full rounded-lg border bg-white p-3 font-mono text-sm outline-none focus:border-zinc-400"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="button-primary" onClick={() => transform("format")} type="button">
          Format
        </button>
        <button className="button-secondary" onClick={() => transform("minify")} type="button">
          Minify
        </button>
      </div>
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <pre className="mt-4 min-h-28 overflow-auto rounded-lg border bg-white p-3 text-sm text-zinc-700">
          {output}
        </pre>
      )}
    </div>
  );
}
