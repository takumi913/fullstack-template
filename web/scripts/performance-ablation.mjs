import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir, platform, arch, cpus } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { gzipSync } from "node:zlib";

const { values } = parseArgs({
  options: {
    baseline: { type: "string" },
    snapshot: { type: "string" },
    current: { type: "string", default: "dist/client" },
    chrome: {
      type: "string",
      default:
        process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    },
    rounds: { type: "string", default: "7" },
    output: { type: "string", default: "../docs/performance-ablation.json" },
  },
});
const rounds = Number(values.rounds);
if (!Number.isInteger(rounds) || rounds < 1) throw new Error("rounds must be a positive integer");
const paths = ["/", "/tools/json-formatter", "/tools/word-counter"];
const profile = {
  width: 1280,
  height: 800,
  cpuSlowdown: 4,
  latencyMs: 40,
  downloadBytesPerSecond: 200000,
  uploadBytesPerSecond: 93750,
  observeAfterLoadMs: 1800,
  idleWindowMs: 1000,
  warmupRounds: 1,
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function assets(directory) {
  const files = new Map();
  async function visit(relative = "") {
    for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
      const name = join(relative, entry.name);
      if (entry.isDirectory()) await visit(name);
      else files.set("/" + name, await readFile(join(directory, name)));
    }
  }
  await visit();
  return files;
}
function inventory(files) {
  const result = {};
  for (const [kind, extension] of [
    ["js", ".js"],
    ["css", ".css"],
  ]) {
    const selected = [...files].filter(([path]) => path.endsWith(extension));
    result[kind] = { files: selected.length, rawBytes: 0, gzipBytes: 0 };
    for (const [, bytes] of selected) {
      result[kind].rawBytes += bytes.length;
      result[kind].gzipBytes += gzipSync(bytes, { level: 9 }).length;
    }
  }
  const hash = createHash("sha256");
  for (const [path, bytes] of [...files].sort(([a], [b]) => a.localeCompare(b)))
    hash.update(path).update(bytes);
  result.sha256 = hash.digest("hex");
  return result;
}
async function serve(files, staticOnly = false) {
  const responses = new Map();
  for (const [path, content] of files) {
    let body = content;
    if (path.endsWith(".html")) {
      let html = content.toString();
      if (staticOnly)
        html = html
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi, "");
      body = Buffer.from(html);
    }
    const mime = path.endsWith(".html")
      ? "text/html; charset=utf-8"
      : path.endsWith(".js")
        ? "text/javascript"
        : path.endsWith(".css")
          ? "text/css"
          : path.endsWith(".svg")
            ? "image/svg+xml"
            : "application/octet-stream";
    responses.set(path, { body: gzipSync(body, { level: 9 }), mime });
  }
  const server = createServer((request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;
    const asset = responses.get(path) ?? responses.get((path === "/" ? "" : path) + "/index.html");
    if (!asset) {
      response.writeHead(404).end();
      return;
    }
    response
      .writeHead(200, {
        "Content-Type": asset.mime,
        "Content-Encoding": "gzip",
        "Content-Length": asset.body.length,
        "Cache-Control": "no-store",
      })
      .end(asset.body);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}
class Protocol {
  id = 0;
  pending = new Map();
  listeners = new Set();
  constructor(socket) {
    this.socket = socket;
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      } else for (const listener of this.listeners) listener(message);
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Protocol timeout: ${method}`));
      }, 30000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  async evaluate(expression, sessionId) {
    const result = await this.send(
      "Runtime.evaluate",
      { expression, awaitPromise: true, returnByValue: true },
      sessionId,
    );
    if (result.exceptionDetails)
      throw new Error(
        "Page evaluation failed: " +
          result.exceptionDetails.text +
          " " +
          result.exceptionDetails.exception?.description,
      );
    return result.result.value;
  }
}
const instrumentation = `
window.__measurement={lcp:0,cls:0,longTasks:[]};
new PerformanceObserver(list=>{for(const e of list.getEntries())window.__measurement.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__measurement.cls+=e.value}).observe({type:'layout-shift',buffered:true});
new PerformanceObserver(list=>{for(const e of list.getEntries())window.__measurement.longTasks.push({start:e.startTime,duration:e.duration})}).observe({type:'longtask',buffered:true});`;
const readiness = `(async()=>{
 for(let attempt=0;attempt<200;attempt++){
  const before=document.documentElement.dataset.theme;
  document.querySelector('.design-theme-toggle')?.click();
  await new Promise(resolve=>setTimeout(resolve,25));
  if(document.documentElement.dataset.theme!==before)return;
 }
 throw new Error('Client handlers were not ready');
})()`;
const interaction = `(async()=>{
 const input=document.querySelector('textarea');
 const nativeSet=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
 const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const waitFor=predicate=>new Promise((resolve,reject)=>{
  if(predicate()){resolve();return}
  const observer=new MutationObserver(()=>{if(predicate()){observer.disconnect();clearTimeout(timer);resolve()}});
  observer.observe(document.querySelector('.tool-workspace'),{subtree:true,childList:true,characterData:true,attributes:true});
  const timer=setTimeout(()=>{observer.disconnect();reject(new Error('Output did not update'))},10000);
 });
 const json=location.pathname.includes('json-formatter');
 const source=json?JSON.stringify(Array.from({length:2048},(_,id)=>({id,name:'benchmark item '+id,active:true}))):'alpha beta gamma delta epsilon\\n'.repeat(4096);
 const expected=json?JSON.stringify(JSON.parse(source),null,2):String(source.trim().split(/\\s+/).length);
 const latencies=[];
 for(let repeat=0;repeat<7;repeat++){
  const value=source+(json?' '.repeat(repeat):' x'.repeat(repeat));
  const count=value.length.toLocaleString();
  const start=performance.now();
  nativeSet.call(input,value);
  input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertFromPaste',data:value}));
  await waitFor(()=>[...document.querySelectorAll('.tool-meta')].some(node=>node.textContent.includes(count)));
  if(json){
   input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',ctrlKey:true,bubbles:true}));
   await waitFor(()=>document.querySelector('.tool-result pre')?.textContent===expected);
  }else await waitFor(()=>document.querySelector('.counter-stat dd')?.textContent===(Number(expected)+repeat).toLocaleString());
  const commitMs=performance.now()-start;
  await frame(); latencies.push({commitMs,frameMs:performance.now()-start});
 }
 return {inputBytes:new TextEncoder().encode(source).length,latencies};
})()`;
async function sample(protocol, variant, path) {
  const { browserContextId } = await protocol.send("Target.createBrowserContext");
  try {
    const { targetId } = await protocol.send("Target.createTarget", {
      url: "about:blank",
      browserContextId,
    });
    const { sessionId } = await protocol.send("Target.attachToTarget", { targetId, flatten: true });
    const call = (method, params) => protocol.send(method, params, sessionId);
    let finished;
    const loaded = new Promise((resolve) => {
      finished = resolve;
    });
    const failures = [];
    const listener = (message) => {
      if (message.sessionId !== sessionId) return;
      if (message.method === "Page.loadEventFired") finished();
      if (message.method === "Runtime.exceptionThrown")
        failures.push(
          message.params.exceptionDetails.exception?.description ??
            message.params.exceptionDetails.text,
        );
    };
    protocol.listeners.add(listener);
    let timer;
    try {
      await call("Page.enable");
      await call("Runtime.enable");
      await call("Network.enable");
      await call("Performance.enable");
      await call("Network.setBlockedURLs", {
        urls: ["https://fonts.googleapis.com/*", "https://fonts.gstatic.com/*"],
      });
      await call("Network.setCacheDisabled", { cacheDisabled: true });
      await call("Network.setBypassServiceWorker", { bypass: true });
      await call("Network.emulateNetworkConditions", {
        offline: false,
        latency: profile.latencyMs,
        downloadThroughput: profile.downloadBytesPerSecond,
        uploadThroughput: profile.uploadBytesPerSecond,
        connectionType: "cellular4g",
      });
      await call("Emulation.setCPUThrottlingRate", { rate: profile.cpuSlowdown });
      await call("Emulation.setDeviceMetricsOverride", {
        width: profile.width,
        height: profile.height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await call("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-reduced-motion", value: variant.reduced ? "reduce" : "no-preference" },
        ],
      });
      await call("Page.addScriptToEvaluateOnNewDocument", { source: instrumentation });
      await call("Page.bringToFront");
      await call("Page.navigate", { url: variant.origin + path });
      await Promise.race([
        loaded,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Page load timed out")), 20000);
        }),
      ]);
      clearTimeout(timer);
      await pause(profile.observeAfterLoadMs);
      const navigation = await protocol.evaluate(
        `(()=>{
        const n=performance.getEntriesByType('navigation')[0],m=window.__measurement;
        const js=performance.getEntriesByType('resource').filter(e=>e.name.match(/\\.js(?:$|\\?)/));
        return {fcpMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,lcpMs:m.lcp,cls:m.cls,domContentLoadedMs:n.domContentLoadedEventEnd,loadMs:n.loadEventEnd,observedMs:performance.now(),longTaskCount:m.longTasks.length,blockingMs:m.longTasks.reduce((n,e)=>n+Math.max(0,e.duration-50),0),jsRequests:js.length,jsGzipBytes:js.reduce((n,e)=>n+e.encodedBodySize,0),htmlBytes:n.decodedBodySize};
      })()`,
        sessionId,
      );
      const before = Object.fromEntries(
        (await call("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value]),
      );
      await pause(profile.idleWindowMs);
      const after = Object.fromEntries(
        (await call("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value]),
      );
      let interactions = null;
      if (!variant.staticOnly) {
        await protocol.evaluate(readiness, sessionId);
        if (path !== "/") interactions = await protocol.evaluate(interaction, sessionId);
      }
      if (failures.length) throw new Error(`${variant.id} ${path}: ${failures.join("; ")}`);
      if (!navigation.fcpMs || !navigation.lcpMs)
        throw new Error(`${variant.id} ${path}: missing paint metrics`);
      return {
        variant: variant.id,
        path,
        ...navigation,
        scriptMs: before.ScriptDuration * 1000,
        taskMs: before.TaskDuration * 1000,
        idleTaskMs: (after.TaskDuration - before.TaskDuration) * 1000,
        interactions,
      };
    } finally {
      clearTimeout(timer);
      protocol.listeners.delete(listener);
    }
  } finally {
    await protocol.send("Target.disposeBrowserContext", { browserContextId });
  }
}
function quantiles(values) {
  values.sort((a, b) => a - b);
  const pick = (p) => values[Math.floor((values.length - 1) * p)];
  return {
    median: pick(0.5),
    p25: pick(0.25),
    p75: pick(0.75),
    min: values[0],
    max: values.at(-1),
  };
}
function summary(samples) {
  const results = [];
  for (const variant of [...new Set(samples.map((s) => s.variant))])
    for (const path of paths) {
      const group = samples.filter((s) => s.variant === variant && s.path === path);
      const metrics = {};
      for (const key of [
        "fcpMs",
        "lcpMs",
        "cls",
        "loadMs",
        "blockingMs",
        "scriptMs",
        "taskMs",
        "idleTaskMs",
        "jsRequests",
        "jsGzipBytes",
        "htmlBytes",
      ])
        metrics[key] = quantiles(group.map((s) => s[key]));
      if (group[0].interactions)
        for (const key of ["commitMs", "frameMs"])
          metrics[key] = quantiles(
            group.map((s) => quantiles(s.interactions.latencies.map((x) => x[key])).median),
          );
      results.push({ variant, path, samples: group.length, metrics });
    }
  return results;
}
const servers = [];
let browser;
let socket;
const directory = await mkdtemp(join(tmpdir(), "solid-ablation-browser-"));
try {
  const current = await assets(resolve(values.current));
  const currentServer = await serve(current);
  servers.push(currentServer.server);
  const staticServer = await serve(current, true);
  servers.push(staticServer.server);
  const variants = [];
  const bundles = { solid: inventory(current) };
  if (values.baseline) {
    const baseline = await assets(resolve(values.baseline));
    const baselineServer = await serve(baseline);
    servers.push(baselineServer.server);
    bundles.baseline = inventory(baseline);
    variants.push({ id: "baseline-full", origin: baselineServer.origin });
  }
  variants.push(
    { id: "solid-full", origin: currentServer.origin },
    { id: "solid-reduced-motion", origin: currentServer.origin, reduced: true },
    { id: "solid-static", origin: staticServer.origin, staticOnly: true },
  );
  browser = spawn(
    values.chrome,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${directory}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--no-proxy-server",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let endpoint;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (browser.exitCode !== null) throw new Error("Browser exited before debugging was ready");
    try {
      const [port, path] = (await readFile(join(directory, "DevToolsActivePort"), "utf8"))
        .trim()
        .split("\n");
      endpoint = `ws://127.0.0.1:${port}${path}`;
      break;
    } catch {
      await pause(100);
    }
  }
  if (!endpoint) throw new Error("Browser debugging endpoint was not ready");
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const protocol = new Protocol(socket);
  const version = await protocol.send("Browser.getVersion");
  const samples = [];
  for (let round = -profile.warmupRounds; round < rounds; round++)
    for (const path of paths) {
      const offset = (round + profile.warmupRounds) % variants.length;
      for (const variant of [...variants.slice(offset), ...variants.slice(0, offset)]) {
        const result = await sample(protocol, variant, path);
        if (round >= 0) samples.push({ round: round + 1, ...result });
        console.log(
          `${round < 0 ? "warmup" : round + 1}/${rounds} ${variant.id} ${path} FCP=${result.fcpMs}ms JS=${result.jsGzipBytes}B`,
        );
      }
    }
  const report = {
    date: new Date().toISOString(),
    baselineSnapshot: values.snapshot ?? null,
    environment: {
      browser: version.product,
      javascript: version.jsVersion,
      runtime: process.versions.bun,
      os: platform(),
      arch: arch(),
      cpu: cpus()[0].model,
    },
    profile,
    rounds,
    paths,
    bundles,
    summary: summary(samples),
    samples,
  };
  await writeFile(resolve(values.output), JSON.stringify(report, null, 2) + "\n");
  console.log(`Saved ${samples.length} measured samples to ${values.output}`);
} finally {
  socket?.close();
  browser?.kill("SIGTERM");
  await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
  if (browser && browser.exitCode === null)
    await new Promise((resolve) => browser.once("exit", resolve));
  await rm(directory, { recursive: true, force: true });
}
