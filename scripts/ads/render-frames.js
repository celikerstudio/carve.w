#!/usr/bin/env node
/**
 * Drukt een HTML-pagina frame voor frame af via het DevTools-protocol.
 *
 * gebruik: node render-frames.js <pagina.html> <uitvoermap> <breedte> <hoogte> <fps> [duur]
 *
 * @ai-why Chrome schrijft geen video en `--screenshot` doet één plaatje per
 * start. Voor 243 frames is dat 243 keer een browser starten, ruim twee minuten.
 * Via CDP blijft één browser open, springt de pagina met setTime(t) naar een
 * tijdstip en levert captureScreenshot het frame: seconden in plaats van minuten.
 * De pagina mag daarom geen eigen animaties of timers hebben; zie frames/outro-anim.html.
 * @ai-sync scripts/ads/frames/outro-anim.html levert setTime(); scripts/ads/build-outro.sh roept dit aan.
 */
"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const [page, outDir, wArg, hArg, fpsArg, durArg] = process.argv.slice(2);
if (!page || !outDir) {
  console.error("gebruik: render-frames.js <pagina.html> <uitvoermap> <breedte> <hoogte> <fps> [duur]");
  process.exit(1);
}
const W = Number(wArg) || 1080;
const H = Number(hArg) || 1920;
const FPS = Number(fpsArg) || 30;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// @ai-gotcha /json/version geeft de websocket van de browser, en die kent Page
// niet ("'Page.enable' wasn't found"). De tab zelf staat in /json/list.
async function devtoolsUrl(port) {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const tab = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (tab) return tab.webSocketDebuggerUrl;
    } catch (e) { /* nog niet op */ }
    await sleep(100);
  }
  throw new Error("Chrome gaf geen tab op poort " + port);
}

function connect(url) {
  const ws = new WebSocket(url);
  let nextId = 1;
  const waiting = new Map();
  const listeners = new Map();

  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && waiting.has(msg.id)) {
      const { resolve, reject } = waiting.get(msg.id);
      waiting.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      listeners.get(msg.method).forEach((fn) => fn(msg.params));
      listeners.delete(msg.method);
    }
  });

  return {
    ready: new Promise((resolve, reject) => {
      ws.addEventListener("open", () => resolve());
      ws.addEventListener("error", (e) => reject(new Error("websocket ging niet open")));
    }),
    send(method, params) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        waiting.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params: params || {} }));
      });
    },
    once(method) {
      return new Promise((resolve) => {
        if (!listeners.has(method)) listeners.set(method, []);
        listeners.get(method).push(resolve);
      });
    },
    close() { ws.close(); }
  };
}

(async () => {
  const port = 9400 + Math.floor(Math.random() * 400);
  const profile = fs.mkdtempSync(path.join(require("os").tmpdir(), "carve-chrome-"));
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-sandbox",
    "--no-first-run",
    "--mute-audio",
    "--force-device-scale-factor=1",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    `--window-size=${W},${H}`,
    "about:blank"
  ], { stdio: "ignore" });

  let cdp;
  try {
    cdp = connect(await devtoolsUrl(port));
    await cdp.ready;
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: W, height: H, deviceScaleFactor: 1, mobile: false
    });

    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url: "file://" + path.resolve(page) });
    await loaded;
    // De afbeeldingen zitten als data-URI in de pagina, maar decoderen duurt even.
    await cdp.send("Runtime.evaluate", {
      expression: "document.fonts.ready.then(() => Promise.all(" +
                  "[...document.images].map(i => i.decode().catch(() => {}))))",
      awaitPromise: true
    });

    const dur = Number(durArg) || (await cdp.send("Runtime.evaluate", {
      expression: "window.outroDuration", returnByValue: true
    })).result.value || 8;

    fs.mkdirSync(outDir, { recursive: true });
    const total = Math.round(dur * FPS);
    for (let i = 0; i < total; i++) {
      const t = i / FPS;
      await cdp.send("Runtime.evaluate", { expression: `setTime(${t})` });
      const shot = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true });
      fs.writeFileSync(
        path.join(outDir, "f_" + String(i).padStart(4, "0") + ".png"),
        Buffer.from(shot.data, "base64")
      );
      if (i % 30 === 0) process.stderr.write(`  frame ${i}/${total}\r`);
    }
    process.stderr.write(`  ${total} frames        \n`);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    // Chrome schrijft zijn profiel nog weg; opruimen mag mislukken, de frames staan er al.
    await new Promise((r) => chrome.once("exit", r) && setTimeout(r, 2000));
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { /* laat staan */ }
  }
})().catch((err) => {
  console.error("frames renderen mislukt:", err.message);
  process.exit(1);
});
