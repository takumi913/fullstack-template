/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteI18nProvider } from "@/i18n/SiteI18nProvider";
import { JsonFormatterTool } from "./JsonFormatterTool";
import { WordCounterTool } from "./WordCounterTool";
import { TextWorkbench } from "./TextWorkbench";
import { ToolPageProvider } from "./context";
import { getToolPageByPath } from "@/content/tool-pages";
import { textPreviewResults } from "./text-preview";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderJson() {
  const view = render(
    <SiteI18nProvider locale="en">
      <JsonFormatterTool />
    </SiteI18nProvider>,
  );
  return {
    ...view,
    input: screen.getByLabelText("JSON input"),
    result: view.container.querySelector(".tool-result")!,
  };
}

describe("browser tool workbench", () => {
  it("formats and minifies the actual input without changing its values", () => {
    const { input, result } = renderJson();
    fireEvent.change(input, { target: { value: '{"hello":"world","count":2}' } });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(result.textContent).toBe('{\n  "hello": "world",\n  "count": 2\n}');
    fireEvent.click(screen.getByRole("button", { name: "Minify" }));
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    expect(result.textContent).toBe('{"hello":"world","count":2}');
  });

  it("removes stale results when input changes and reports invalid JSON", () => {
    const { input, result } = renderJson();
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    fireEvent.change(input, { target: { value: "{invalid" } });
    expect(result.querySelector("pre")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(screen.getByRole("alert").textContent).toMatch(/JSON|property|position/);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Copy" }).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Run" }).disabled).toBe(true);
  });

  it("copies the computed output and exposes clipboard failures inline", async () => {
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Clipboard access denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const { input, result } = renderJson();
    fireEvent.change(input, { target: { value: '{"count":2}' } });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Copied" })).toBeDefined());
    expect(writeText).toHaveBeenCalledWith(result.textContent);
    fireEvent.change(input, { target: { value: '{"count":3}' } });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe("Clipboard access denied"),
    );
  });

  it("updates whitespace-separated word counts, CRLF lines and paragraphs while typing", () => {
    const { container } = render(
      <SiteI18nProvider locale="en">
        <WordCounterTool />
      </SiteI18nProvider>,
    );
    fireEvent.change(screen.getByLabelText("Text"), {
      target: { value: "Hello world\r\n\r\nSecond paragraph" },
    });
    const expected = { Words: "4", Characters: "29", Lines: "3", Paragraphs: "2" };
    for (const [label, value] of Object.entries(expected)) {
      const stat = screen.getByText(label, { selector: "dt" }).parentElement!;
      expect(within(stat).getByText(value, { selector: "dd" })).toBeDefined();
    }
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect([...container.querySelectorAll("dd")].map((stat) => stat.textContent)).toEqual([
      "0",
      "0",
      "0",
      "0",
    ]);
  });
});

function renderTextWorkbench() {
  const view = render(
    <SiteI18nProvider locale="en">
      <ToolPageProvider page={getToolPageByPath("/tools/rewriter")!}>
        <TextWorkbench />
      </ToolPageProvider>
    </SiteI18nProvider>,
  );
  return { ...view, output: view.container.querySelector(".design-output")! };
}

describe("design text preview", () => {
  it("streams one result even when the run shortcut is pressed twice", () => {
    vi.useFakeTimers();
    const { output } = renderTextWorkbench();
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    expect(vi.getTimerCount()).toBe(1);
    expect(screen.getByText("Generating")).toBeDefined();
    act(() => vi.advanceTimersByTime(718));
    expect(output.textContent!.trim().length).toBeGreaterThan(0);
    expect(output.textContent!.trim().length).toBeLessThan(textPreviewResults.en.rewrite.length);
    act(() => vi.runAllTimers());
    expect(output.textContent!.trim()).toBe(textPreviewResults.en.rewrite);
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("cancels stale streaming when the processing mode changes", () => {
    vi.useFakeTimers();
    const { output } = renderTextWorkbench();
    fireEvent.click(screen.getByRole("button", { name: /Run.*⌘↵/ }));
    act(() => vi.advanceTimersByTime(718));
    fireEvent.click(screen.getByRole("button", { name: "Summarize" }));
    act(() => vi.runAllTimers());
    expect(screen.getByText("Waiting")).toBeDefined();
    expect(output.textContent).toContain("Your result streams in here");
    fireEvent.click(screen.getByRole("button", { name: /Run.*⌘↵/ }));
    act(() => vi.runAllTimers());
    expect(output.textContent!.trim()).toBe(textPreviewResults.en.summarize);
  });

  it("copies the streamed output and resets the copied feedback after 1.6 seconds", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderTextWorkbench();
    fireEvent.click(screen.getByRole("button", { name: /Run.*⌘↵/ }));
    act(() => vi.runAllTimers());
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy" })));
    expect(writeText).toHaveBeenCalledWith(textPreviewResults.en.rewrite);
    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();
    act(() => vi.advanceTimersByTime(1600));
    expect(screen.getByRole("button", { name: "Copy" })).toBeDefined();
  });
});
