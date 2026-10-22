/** @vitest-environment jsdom */
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteI18nProvider } from "@/i18n/context";
import { JsonFormatterTool } from "./JsonFormatterTool";
import { WordCounterTool } from "./WordCounterTool";
import { TextWorkbench } from "./TextWorkbench";
import { ToolPageProvider } from "./context";
import { getToolPageByPath } from "@/content/tool-pages";
import { textPreviewResults } from "./text-preview";
import { ToolRuntime } from "./registry";

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  vi.useRealTimers();
});

function mount(component: () => JSX.Element) {
  const container = document.body.appendChild(document.createElement("div"));
  const dispose = render(component, container);
  const unmount = () => {
    dispose();
    container.remove();
    cleanup = undefined;
  };
  cleanup = unmount;
  return { container, unmount };
}

function button(label: string | RegExp) {
  const result = [...document.querySelectorAll("button")].find((element) => {
    const text = element.textContent!.replace(/\s+/g, " ").trim();
    return typeof label === "string" ? text.startsWith(label) : label.test(text);
  });
  if (!result) throw new Error(`Button not found: ${label}`);
  return result;
}

function enterText(element: HTMLTextAreaElement, value: string) {
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  flush();
}

function shortcut(element: HTMLTextAreaElement) {
  element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }),
  );
}

function renderJson() {
  const view = mount(() => (
    <SiteI18nProvider locale="en">
      <JsonFormatterTool />
    </SiteI18nProvider>
  ));
  return {
    ...view,
    input: view.container.querySelector<HTMLTextAreaElement>("#json-input")!,
    result: view.container.querySelector(".tool-result")!,
  };
}

describe("browser tool workbench", () => {
  it("formats and minifies the actual input without changing its values", () => {
    const { input, result } = renderJson();
    enterText(input, '{"hello":"world","count":2}');
    button("Run").click();
    flush();
    expect(result.textContent).toBe('{\n  "hello": "world",\n  "count": 2\n}');
    button("Minify").click();
    flush();
    shortcut(input);
    flush();
    expect(result.textContent).toBe('{"hello":"world","count":2}');
  });

  it("removes stale results when input changes and reports invalid JSON", () => {
    const { input, result } = renderJson();
    button("Run").click();
    flush();
    enterText(input, "{invalid");
    expect(result.querySelector("pre")).toBeNull();
    button("Run").click();
    flush();
    expect(document.querySelector('[role="alert"]')!.textContent).toMatch(/JSON|property|position/);
    expect(button("Copy").disabled).toBe(true);
    button("Clear").click();
    flush();
    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(button("Run").disabled).toBe(true);
  });

  it("copies the computed output and exposes clipboard failures inline", async () => {
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Clipboard access denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const { input, result } = renderJson();
    enterText(input, '{"count":2}');
    button("Run").click();
    flush();
    button("Copy").click();
    await vi.waitFor(() => expect(button("Copied")).toBeDefined());
    expect(writeText).toHaveBeenCalledWith(result.textContent);
    enterText(input, '{"count":3}');
    button("Run").click();
    flush();
    button("Copy").click();
    await vi.waitFor(() =>
      expect(document.querySelector('[role="alert"]')!.textContent).toBe("Clipboard access denied"),
    );
  });

  it("updates whitespace-separated word counts, CRLF lines and paragraphs while typing", () => {
    const { container } = mount(() => (
      <SiteI18nProvider locale="en">
        <WordCounterTool />
      </SiteI18nProvider>
    ));
    enterText(container.querySelector("textarea")!, "Hello world\r\n\r\nSecond paragraph");
    const expected = { Words: "4", Characters: "29", Lines: "3", Paragraphs: "2" };
    for (const [label, value] of Object.entries(expected)) {
      const stat = [...container.querySelectorAll(".counter-stat")].find(
        (element) => element.querySelector("dt")!.textContent === label,
      )!;
      expect(stat.querySelector("dd")!.textContent).toBe(value);
    }
    button("Clear").click();
    flush();
    expect([...container.querySelectorAll("dd")].map((stat) => stat.textContent)).toEqual([
      "0",
      "0",
      "0",
      "0",
    ]);
  });
});

function renderTextWorkbench() {
  const view = mount(() => (
    <SiteI18nProvider locale="en">
      <ToolPageProvider page={getToolPageByPath("/tools/rewriter")!}>
        <TextWorkbench />
      </ToolPageProvider>
    </SiteI18nProvider>
  ));
  return {
    ...view,
    input: view.container.querySelector("textarea")!,
    output: view.container.querySelector(".design-output")!,
    status: view.container.querySelector(".design-output-status")!,
  };
}

describe("design text preview", () => {
  it("starts a fresh editor when navigating between tools that share the lazy implementation", async () => {
    let selectSummary!: () => void;
    const { container } = mount(() => {
      const [page, setPage] = createSignal(getToolPageByPath("/tools/rewriter")!);
      selectSummary = () => setPage(getToolPageByPath("/tools/summarizer")!);
      return (
        <SiteI18nProvider locale="en">
          <ToolRuntime page={page()} />
        </SiteI18nProvider>
      );
    });
    await vi.waitFor(() => expect(container.querySelector("textarea")).not.toBeNull());
    enterText(container.querySelector("textarea")!, "Previous tool text");
    button("Translate").click();
    flush();
    selectSummary();
    flush();
    expect(container.querySelector("textarea")!.value).not.toBe("Previous tool text");
    expect(button("Summarize").getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector(".design-output-status")!.textContent).toBe("Waiting");
  });

  it("streams one result even when the run shortcut is pressed twice", () => {
    vi.useFakeTimers();
    const { input, output, status } = renderTextWorkbench();
    shortcut(input);
    shortcut(input);
    flush();
    expect(vi.getTimerCount()).toBe(1);
    expect(status.textContent).toBe("Generating");
    vi.advanceTimersByTime(718);
    flush();
    expect(output.textContent!.trim().length).toBeGreaterThan(0);
    expect(output.textContent!.trim().length).toBeLessThan(textPreviewResults.en.rewrite.length);
    vi.runAllTimers();
    flush();
    expect(output.textContent!.trim()).toBe(textPreviewResults.en.rewrite);
    expect(status.textContent).toBe("Done");
  });

  it("cancels stale streaming when the processing mode changes", () => {
    vi.useFakeTimers();
    const { output, status } = renderTextWorkbench();
    button(/Run.*⌘↵/).click();
    flush();
    vi.advanceTimersByTime(718);
    flush();
    button("Summarize").click();
    flush();
    vi.runAllTimers();
    flush();
    expect(status.textContent).toBe("Waiting");
    expect(output.textContent).toContain("Your result streams in here");
    button(/Run.*⌘↵/).click();
    flush();
    vi.runAllTimers();
    flush();
    expect(output.textContent!.trim()).toBe(textPreviewResults.en.summarize);
  });

  it("cancels the active stream when its tool unmounts", () => {
    vi.useFakeTimers();
    const { input, unmount } = renderTextWorkbench();
    shortcut(input);
    flush();
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("copies the streamed output and resets the copied feedback after 1.6 seconds", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderTextWorkbench();
    button(/Run.*⌘↵/).click();
    flush();
    vi.runAllTimers();
    flush();
    button("Copy").click();
    await vi.advanceTimersByTimeAsync(0);
    flush();
    expect(writeText).toHaveBeenCalledWith(textPreviewResults.en.rewrite);
    expect(button("Copied")).toBeDefined();
    vi.advanceTimersByTime(1600);
    flush();
    expect(button("Copy")).toBeDefined();
  });
});
