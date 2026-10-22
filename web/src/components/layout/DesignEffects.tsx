import { createEffect, onSettled } from "solid-js";
import { useTheme } from "./ThemeProvider";

export function PointerGlow() {
  let element!: HTMLDivElement;
  onSettled(() => {
    function move(event: globalThis.MouseEvent) {
      element.style.transform = `translate(${event.clientX}px,${event.clientY}px)`;
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  });
  return (
    <div
      ref={(node) => {
        element = node;
      }}
      class="design-glow"
      aria-hidden="true"
    />
  );
}

export function DotField(props: { intensity?: number }) {
  let canvas!: HTMLCanvasElement;
  const { theme } = useTheme();
  createEffect(
    () => [props.intensity ?? 1, theme()] as const,
    ([intensity, currentTheme]) => {
      const context = canvas.getContext("2d")!;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const style = getComputedStyle(canvas);
      const foreground = style.getPropertyValue("--fg");
      const accent = style.getPropertyValue("--ac");
      const mouse = { x: -9999, y: -9999 };
      let frame = 0;
      const move = (event: globalThis.MouseEvent) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      };
      function draw(timestamp: number) {
        const reduced = motion.matches;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.clientWidth,
          height = canvas.clientHeight;
        if (
          canvas.width !== Math.round(width * ratio) ||
          canvas.height !== Math.round(height * ratio)
        ) {
          canvas.width = Math.round(width * ratio);
          canvas.height = Math.round(height * ratio);
        }
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        const time = reduced ? 0 : timestamp / 1000;
        const rect = canvas.getBoundingClientRect();
        const mx = reduced ? -9999 : mouse.x - rect.left,
          my = reduced ? -9999 : mouse.y - rect.top;
        const base = currentTheme === "light" ? 0.16 : 0.13;
        for (let y = 13; y < height; y += 26) {
          for (let x = 13; x < width; x += 26) {
            const wave = 0.5 + 0.5 * Math.sin(time * 0.6 + x * 0.012 + y * 0.018);
            const dx = x - mx,
              dy = y - my,
              distance = Math.sqrt(dx * dx + dy * dy);
            const near = distance < 170 ? 1 - distance / 170 : 0;
            const px = near ? x + (dx / (distance || 1)) * near * 5 : x;
            const py = near ? y + (dy / (distance || 1)) * near * 5 : y;
            if (near > 0.02) {
              context.globalAlpha = Math.min(1, 0.2 + near * 0.8) * intensity;
              context.fillStyle = accent;
              context.beginPath();
              context.arc(px, py, 1.1 + near * 1.4, 0, Math.PI * 2);
              context.fill();
            } else {
              context.globalAlpha = (base + wave * 0.1) * intensity;
              context.fillStyle = foreground;
              context.fillRect(px - 0.75, py - 0.75, 1.5, 1.5);
            }
          }
        }
        context.globalAlpha = 1;
        if (!reduced) frame = requestAnimationFrame(draw);
      }
      function redraw() {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(draw);
      }
      function resize() {
        if (motion.matches) redraw();
      }
      window.addEventListener("mousemove", move);
      window.addEventListener("resize", resize);
      motion.addEventListener("change", redraw);
      frame = requestAnimationFrame(draw);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("mousemove", move);
        window.removeEventListener("resize", resize);
        motion.removeEventListener("change", redraw);
      };
    },
  );
  return (
    <canvas
      ref={(node) => {
        canvas = node;
      }}
      class="design-dots"
      aria-hidden="true"
    />
  );
}
