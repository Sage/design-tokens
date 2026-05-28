/*
Copyright © 2026 The Sage Group plc or its licensors. All Rights reserved.
 */

/**
 * Builds docs/mcp-demo.html — a single-file, offline-capable presentation
 * about the Sage Design Tokens MCP. Embeds the three Sage UI font weights
 * as base64 and pulls live numbers from dist/mcp/tokens.json.
 *
 * Aesthetic: editorial / refined-minimalist. Massive typography flush-left,
 * Sage UI throughout, signature green used sparingly as a marker rather than
 * a fill. Subtle dot-grid backgrounds evoke a design-system spec sheet.
 * Numbers ARE the design on the snapshot slide.
 *
 * Regenerate with `npm run build:demo`.
 */

import fs from "fs-extra";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ── Inputs ────────────────────────────────────────────────────────────────
const fontRegular = fs.readFileSync(resolve(root, "assets/fonts/sageui-regular.woff2")).toString("base64");
const fontMedium = fs.readFileSync(resolve(root, "assets/fonts/sageui-medium.woff2")).toString("base64");
const fontBold = fs.readFileSync(resolve(root, "assets/fonts/sageui-bold.woff2")).toString("base64");

const tokens: Record<string, any> = fs.readJsonSync(resolve(root, "dist/mcp/tokens.json"));
const entries = Object.values<any>(tokens);
const totalTokens = entries.length;
const withDescription = entries.filter(t => typeof t.description === "string" && t.description.length > 0).length;
const modeDivergent = entries.filter(t => !!t.value && typeof t.value === "object" && "light" in t.value).length;
const byLayer: Record<string, number> = entries.reduce<Record<string, number>>((acc, t) => {
  acc[t.layer] = (acc[t.layer] ?? 0) + 1;
  return acc;
}, {});

const sampleToken = tokens["button-typical-primary-bg-default"];

const gitOut = (args: string[]): string => {
  try { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return "unknown"; }
};
const commit = gitOut(["rev-parse", "--short", "HEAD"]);
const branch = gitOut(["rev-parse", "--abbrev-ref", "HEAD"]);
const generated = new Date().toISOString().slice(0, 10);

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const jsonPretty = (v: unknown): string => esc(JSON.stringify(v, null, 2));

// ── Slide content ─────────────────────────────────────────────────────────
const slides: Array<{ id: string; title: string; chapter: string; html: string }> = [
  {
    id: "cover",
    title: "Cover",
    chapter: "00 — Title",
    html: `
      <div class="cover">
        <div class="cover-meta-top">
          <span class="dot"></span>
          <span class="eyebrow">Sage · Design Tokens · 2026</span>
        </div>
        <div class="cover-body">
          <p class="hero-kicker">A model context protocol server</p>
          <h1 class="hero-title">Design Tokens <span class="hero-emph">MCP</span></h1>
          <p class="hero-sub">Light and dark values · source <code>$description</code> · resolved alias and layer chains. Built into the repo, ready for the upstream PR.</p>
        </div>
        <aside class="cover-aside">
          <p class="label">Edition</p>
          <p>This deck is generated from the live build artefact &mdash; numbers, sample token and SHA all reflect the current branch state.</p>
          <p class="stat-mini">${totalTokens.toLocaleString("en-GB")}</p>
          <p class="label">Tokens served</p>
        </aside>
        <div class="cover-meta-bottom">
          <span class="ref">REF</span>
          <span><code>${esc(branch)}</code> · <code>${esc(commit)}</code> · ${esc(generated)}</span>
        </div>
      </div>`,
  },
  {
    id: "why",
    title: "Why this exists",
    chapter: "01 — Motivation",
    html: `
      <header class="slide-head">
        <p class="chapter">01 · Motivation</p>
        <h2 class="slide-title">Why this <span class="emph">exists</span></h2>
        <p class="lede">An earlier external wrapper consumed only the published <code>js/common</code> export — flat <code>key → value</code> pairs. Three structural deficiencies drove the rewrite. Each is solved at the root.</p>
      </header>
      <ol class="reasons">
        <li>
          <span class="reason-n">01</span>
          <div>
            <h3>Light, missing</h3>
            <p>A flat name-keyed index collides between modes. <code>dark</code> overwrites <code>light</code> during indexing — the <code>light</code> category vanishes. Fixed by merging both modes into one entry with <code>value:{light,dark}</code>.</p>
          </div>
        </li>
        <li>
          <span class="reason-n">02</span>
          <div>
            <h3>No context</h3>
            <p>Published dist outputs strip <code>$description</code>. The source <code>data/tokens/</code> has it; the npm package doesn't ship those files. Building from source restores it — <strong>${withDescription}</strong> tokens now carry their description.</p>
          </div>
        </li>
        <li>
          <span class="reason-n">03</span>
          <div>
            <h3>No layers</h3>
            <p>The four-layer architecture (<code>core → global → mode → component</code>) and alias references live only in source. A new <code>custom/json-enriched</code> style-dictionary format keeps the references; the MCP exposes them as a resolved <code>refChain</code>.</p>
          </div>
        </li>
      </ol>`,
  },
  {
    id: "architecture",
    title: "Architecture",
    chapter: "02 — Architecture",
    html: `
      <header class="slide-head">
        <p class="chapter">02 · Architecture</p>
        <h2 class="slide-title">One pipeline.<br/>One <span class="emph">upstream-ready</span> artefact.</h2>
      </header>
      <div class="arch-flow">
        <div class="arch-step">
          <p class="step-label">Source</p>
          <code class="step-name">data/tokens/*.json</code>
          <p class="step-desc">DTCG · <code>$description</code> · aliases · four layers</p>
        </div>
        <div class="arch-link"><span>↓</span><em>style-dictionary build · official resolution</em></div>
        <div class="arch-step is-key">
          <p class="step-label">Artefact</p>
          <code class="step-name">dist/mcp/tokens.json</code>
          <p class="step-desc">Enriched · light + dark merged · refChain resolved</p>
        </div>
        <div class="arch-link"><span>↓</span><em>reads at startup</em></div>
        <div class="arch-step">
          <p class="step-label">Server</p>
          <code class="step-name">mcp/server.js</code>
          <p class="step-desc">Thin wrapper · <code>@modelcontextprotocol/sdk</code> · stdio</p>
        </div>
        <div class="arch-link"><span>↓</span><em>MCP wire protocol</em></div>
        <div class="arch-step">
          <p class="step-label">Consumer</p>
          <code class="step-name">AI coding assistant</code>
          <p class="step-desc">Claude Code · Cursor · any MCP client</p>
        </div>
      </div>`,
  },
  {
    id: "anatomy",
    title: "Anatomy of an enriched token",
    chapter: "03 — Anatomy",
    html: `
      <header class="slide-head">
        <p class="chapter">03 · Anatomy</p>
        <h2 class="slide-title">Anatomy of an <span class="emph">enriched</span> token</h2>
        <p class="lede">A real entry from <code>dist/mcp/tokens.json</code> — <code>button-typical-primary-bg-default</code>.</p>
      </header>
      <div class="anatomy">
        <pre class="code is-large"><code>${jsonPretty(sampleToken)}</code></pre>
        <dl class="anatomy-legend">
          <dt>value</dt>
          <dd>Single string for mode-independent tokens; <code>{light, dark}</code> when the modes diverge.</dd>
          <dt>refChain</dt>
          <dd>Resolved alias path down to the literal. May itself diverge per mode.</dd>
          <dt>description</dt>
          <dd>Preserved from the source so an AI agent knows <em>why</em> a token exists.</dd>
        </dl>
      </div>`,
  },
  {
    id: "tools",
    title: "Four tools",
    chapter: "04 — Tools",
    html: `
      <header class="slide-head">
        <p class="chapter">04 · Tools</p>
        <h2 class="slide-title">Four tools.<br/>Same enriched <span class="emph">shape</span>.</h2>
      </header>
      <div class="tools">
        <article class="tool">
          <p class="tool-n">01</p>
          <h3 class="tool-name">get_token</h3>
          <p class="tool-desc">Lookup by kebab-case name. Returns the enriched entry. <code>mode</code> reduces light/dark fields to one side.</p>
          <pre class="code small"><code>{ "name": "core-color-black", "mode": "dark" }</code></pre>
        </article>
        <article class="tool">
          <p class="tool-n">02</p>
          <h3 class="tool-name">search_tokens</h3>
          <p class="tool-desc">Multi-word substring search. Optional <code>category</code> and <code>layer</code> filters.</p>
          <pre class="code small"><code>{ "query": "button primary", "layer": "component" }</code></pre>
        </article>
        <article class="tool">
          <p class="tool-n">03</p>
          <h3 class="tool-name">list_categories</h3>
          <p class="tool-desc">Every category with counts. Use it before searching to see what's available.</p>
          <pre class="code small"><code>{}</code></pre>
        </article>
        <article class="tool">
          <p class="tool-n">04</p>
          <h3 class="tool-name">list_tokens_by_category</h3>
          <p class="tool-desc">All tokens in a category — including their description where present.</p>
          <pre class="code small"><code>{ "category": "button", "limit": 50 }</code></pre>
        </article>
      </div>`,
  },
  {
    id: "snapshot",
    title: "Live snapshot",
    chapter: "05 — Snapshot",
    html: `
      <header class="slide-head">
        <p class="chapter">05 · Snapshot</p>
        <p class="snapshot-source">Numbers as of <code>${esc(branch)}</code> · <code>${esc(commit)}</code></p>
      </header>
      <div class="snapshot">
        <div class="stat-hero">
          <p class="stat-n">${totalTokens.toLocaleString("en-GB")}</p>
          <p class="stat-l">tokens served</p>
        </div>
        <div class="stat-grid">
          <div class="stat-row">
            <span class="stat-row-n">${withDescription.toLocaleString("en-GB")}</span>
            <span class="stat-row-l">carry a <code>$description</code> from the source</span>
          </div>
          <div class="stat-row">
            <span class="stat-row-n">${modeDivergent.toLocaleString("en-GB")}</span>
            <span class="stat-row-l">have mode-divergent values</span>
          </div>
          <div class="stat-row">
            <span class="stat-row-n">${Object.keys(byLayer).length}</span>
            <span class="stat-row-l">architecture layers exposed</span>
          </div>
        </div>
        <div class="layers">
          <p class="layers-title">By layer</p>
          ${(() => {
            const max = Math.max(...Object.values(byLayer));
            return Object.entries(byLayer).sort((a,b)=>b[1]-a[1]).map(([k,v]) => {
              const pct = Math.round((v / max) * 100);
              return `<div class="layer-row"><span class="layer-k">${esc(k)}</span><span class="layer-bar"><span class="layer-bar-fill" style="--w:${pct}%"></span></span><span class="layer-v">${v}</span></div>`;
            }).join("");
          })()}
        </div>
      </div>`,
  },
  {
    id: "hardening",
    title: "Hardening",
    chapter: "06 — Hardening",
    html: `
      <header class="slide-head">
        <p class="chapter">06 · Hardening</p>
        <h2 class="slide-title">Five test classes.<br/><span class="emph">Three real bugs</span> caught.</h2>
      </header>
      <ol class="harden">
        <li><span class="h-n">i</span><div><h3>Data integrity</h3><p>Every token satisfies the schema; every alias chain terminates at a literal; every <code>--var</code> in <code>dist/css/*</code> exists as a token; values match for resolved layers.</p></div></li>
        <li><span class="h-n">ii</span><div><h3>Adversarial input</h3><p>Null, empty, oversized, Unicode, negative-limit inputs never crash. Response shapes stay stable.</p></div></li>
        <li><span class="h-n">iii</span><div><h3>Agent scenarios</h3><p>Realistic multi-word queries, mode reduction, layer filters, alias-chain visibility — all return meaningful results.</p></div></li>
        <li><span class="h-n">iv</span><div><h3>MCP E2E</h3><p>The server is spawned as a subprocess and driven through the real wire protocol via <code>@modelcontextprotocol/sdk</code> Client.</p></div></li>
        <li><span class="h-n">v</span><div><h3>Self-containment</h3><p>No host-absolute paths, no legacy references, README sections present, sub-package reproducible, build runs without secrets.</p></div></li>
      </ol>
      <p class="caught"><span class="caught-mark">⚑</span><strong>Caught and fixed:</strong> shadow <code>px</code> normalisation missing from MCP output · <code>getToken({ name: "" })</code> returned an arbitrary token via fuzzy match · <code>truncated</code> reported as <code>true</code> when callers asked for nothing.</p>`,
  },
  {
    id: "quickstart",
    title: "Quickstart",
    chapter: "07 — Use it",
    html: `
      <header class="slide-head">
        <p class="chapter">07 · Use it</p>
        <h2 class="slide-title">From clone to <span class="emph">connected</span>.</h2>
      </header>
      <div class="qs">
        <div class="qs-step">
          <span class="qs-n">A</span>
          <div>
            <h3>Install and build</h3>
            <pre class="code"><code>npm install
npm run build
(cd mcp &amp;&amp; npm install)</code></pre>
          </div>
        </div>
        <div class="qs-step">
          <span class="qs-n">B</span>
          <div>
            <h3>Wire the client</h3>
            <p class="qs-note">For Claude Code, add to <code>~/.claude.json</code> under <code>mcpServers</code>:</p>
            <pre class="code"><code>"sage-design-tokens": {
  "type": "stdio",
  "command": "node",
  "args": ["&lt;absolute path&gt;/mcp/server.js"]
}</code></pre>
          </div>
        </div>
      </div>`,
  },
  {
    id: "roadmap",
    title: "Roadmap",
    chapter: "08 — Roadmap",
    html: `
      <header class="slide-head">
        <p class="chapter">08 · Roadmap</p>
        <h2 class="slide-title">Two phases.<br/>One <span class="emph">direction</span>.</h2>
      </header>
      <ol class="phases">
        <li class="phase is-current">
          <p class="phase-mark"><span class="dot"></span>Now</p>
          <h3>Phase 1 — In the repo</h3>
          <p>The enriched build format and the server live inside <code>@sage/design-tokens</code> behind a feature branch. Fully hardened, self-contained. Consumers clone the repo and wire the server into their MCP client.</p>
        </li>
        <li class="phase">
          <p class="phase-mark"><span class="dot is-empty"></span>Next</p>
          <h3>Phase 2 — Upstream</h3>
          <p>Contribute the <code>custom/json-enriched</code> format and the server entry point upstream to <code>@sage/design-tokens</code>. After acceptance, the MCP ships with the package and downstream consumers use it without cloning.</p>
        </li>
      </ol>`,
  },
  {
    id: "end",
    title: "End",
    chapter: "09 — Fin",
    html: `
      <div class="cover end">
        <div class="cover-meta-top">
          <span class="dot"></span>
          <span class="eyebrow">Fin · ${esc(generated)}</span>
        </div>
        <div class="cover-body end-body">
          <p class="hero-kicker">Ready when you are</p>
          <h1 class="hero-title end-title">Ready for <span class="hero-emph">daily use</span>.</h1>
          <dl class="colophon">
            <dt>Consumer flow &amp; tool reference</dt><dd><code>mcp/README.md</code></dd>
            <dt>Committed token snapshot</dt><dd><code>mcp/REPORT.md</code></dd>
            <dt>Design rationale</dt><dd><code>docs/superpowers/specs/2026-05-27-…</code></dd>
            <dt>Hardening spec</dt><dd><code>docs/superpowers/specs/2026-05-28-mcp-hardening-design.md</code></dd>
            <dt>Onboarding check</dt><dd><code>scripts/verify-fresh-clone.sh</code></dd>
          </dl>
        </div>
        <aside class="cover-aside">
          <p class="label">Keys</p>
          <p><kbd>←</kbd> <kbd>→</kbd> navigate &middot; <kbd>Space</kbd> index &middot; <kbd>T</kbd> theme &middot; <kbd>F</kbd> fullscreen &middot; <kbd>R</kbd> restart</p>
        </aside>
        <div class="cover-meta-bottom">
          <span class="ref">REF</span>
          <span><code>${esc(branch)}</code> · <code>${esc(commit)}</code> · ${esc(generated)}</span>
        </div>
      </div>`,
  },
];

// ── HTML template ─────────────────────────────────────────────────────────
const html = `<!doctype html>
<!--
Copyright © 2026 The Sage Group plc or its licensors. All Rights reserved.
Generated by scripts/build-mcp-demo.ts — regenerate with \`npm run build:demo\`.
-->
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <title>Sage Design Tokens MCP</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='2' fill='%2300d639'/%3E%3C/svg%3E" />
  <style>
    @font-face { font-family: "Sage UI"; font-weight: 400; font-style: normal; font-display: block; src: url(data:font/woff2;base64,${fontRegular}) format("woff2"); }
    @font-face { font-family: "Sage UI"; font-weight: 500; font-style: normal; font-display: block; src: url(data:font/woff2;base64,${fontMedium}) format("woff2"); }
    @font-face { font-family: "Sage UI"; font-weight: 700; font-style: normal; font-display: block; src: url(data:font/woff2;base64,${fontBold}) format("woff2"); }

    :root {
      --bg:        #fafaf7;          /* very subtle warm off-white */
      --bg-deep:   #ffffff;
      --surface:   #f1f0eb;
      --line:      #d6d3cb;
      --line-soft: #e5e2d9;
      --fg:        #0a0a0a;
      --fg-soft:   #5a564f;
      --fg-faint:  #8d887d;
      --accent:    #00811f;
      --signature: #00d639;          /* never use as a fill of large areas */
      --code-bg:   #efeee8;
      --code-fg:   #1a1a1a;
      --dot:       rgba(10, 10, 10, 0.05);
      --shadow-1:  0 1px 0 0 var(--line-soft);
    }
    [data-theme="dark"] {
      --bg:        #0d0d0c;
      --bg-deep:   #060606;
      --surface:   #1b1b19;
      --line:      #2b2a26;
      --line-soft: #1f1e1b;
      --fg:        #f5f3ec;
      --fg-soft:   #9c988e;
      --fg-faint:  #6c6a62;
      --accent:    #00f142;
      --signature: #00d639;
      --code-bg:   #161614;
      --code-fg:   #ededeb;
      --dot:       rgba(245, 243, 236, 0.06);
      --shadow-1:  0 1px 0 0 var(--line);
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: var(--bg);
      background-image: radial-gradient(circle at 1px 1px, var(--dot) 1px, transparent 1.5px);
      background-size: 22px 22px;
      color: var(--fg);
      font-family: "Sage UI", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-weight: 400;
      font-size: clamp(15px, 0.85vw + 0.5rem, 19px);
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      font-feature-settings: "ss01" on, "kern" on;
      transition: background-color .35s ease, color .35s ease;
    }
    code, kbd, pre {
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-feature-settings: "ss01" off;
    }
    kbd {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 3px;
      border: 1px solid var(--line);
      background: var(--bg-deep);
      font-size: 0.78em;
      font-weight: 500;
      color: var(--fg-soft);
    }
    code {
      background: var(--code-bg);
      color: var(--code-fg);
      padding: 0.08em 0.42em;
      border-radius: 3px;
      font-size: 0.88em;
    }
    em { font-style: normal; font-weight: 500; }

    /* ── Pre/code blocks (code-as-typography) ───────────────────────── */
    pre.code {
      background: var(--code-bg);
      color: var(--code-fg);
      padding: 1.5rem 1.75rem;
      border-radius: 4px;
      overflow: auto;
      font-size: clamp(12px, 0.7vw + 0.3rem, 15px);
      line-height: 1.65;
      border-left: 2px solid var(--signature);
      margin: 0;
    }
    pre.code code { background: transparent; padding: 0; font-size: inherit; }
    pre.code.small { font-size: clamp(11px, 0.55vw + 0.25rem, 13px); padding: 0.85rem 1.1rem; line-height: 1.55; }
    pre.code.is-large { font-size: clamp(13px, 0.8vw + 0.35rem, 17px); padding: 2rem 2.25rem; }

    /* ── Deck and slide framework ──────────────────────────────────── */
    .deck { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
    .slides {
      display: flex;
      width: max-content;
      height: 100vh;
      transition: transform .55s cubic-bezier(.16, .84, .24, 1);
      will-change: transform;
    }
    .slide {
      flex: none;
      width: 100vw;
      height: 100vh;
      padding: clamp(4.5rem, 8vh, 7rem) clamp(2.5rem, 7vw, 8rem) clamp(2.5rem, 5vh, 4rem);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      overflow: auto;
      position: relative;
    }
    /* Cover slides (cover, end) use the full canvas with their own grid */
    .slide:has(> .cover) { padding: clamp(2.5rem, 5vw, 5.5rem) clamp(2.5rem, 7vw, 8rem); justify-content: stretch; }
    .slide:has(> .cover) > .cover { flex: 1; }
    .slide::before {
      content: "";
      position: absolute;
      top: 0; left: clamp(2.5rem, 7vw, 8rem);
      width: 1px; height: 100%;
      background: var(--line-soft);
      opacity: .55;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .slides { transition: none; }
    }

    /* ── Slide header (chapter / title / lede) ─────────────────────── */
    .slide-head { margin-bottom: clamp(1.75rem, 2vw + 1rem, 3rem); max-width: 92ch; }
    .chapter, .snapshot-source {
      font-family: "Sage UI", sans-serif;
      font-weight: 500;
      font-size: 0.78rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--fg-faint);
      margin: 0 0 1.4rem;
    }
    .chapter::before { content: "●  "; color: var(--signature); }
    .snapshot-source code { background: transparent; padding: 0; color: var(--fg-soft); font-size: inherit; }

    .slide-title {
      font-weight: 700;
      font-size: clamp(2.2rem, 4.5vw + 0.5rem, 5.5rem);
      line-height: 0.96;
      letter-spacing: -0.028em;
      margin: 0 0 1.2rem;
      max-width: 22ch;
    }
    .slide-title .emph { color: var(--accent); font-weight: 700; }

    .lede {
      font-size: clamp(1rem, 0.5vw + 0.7rem, 1.3rem);
      color: var(--fg-soft);
      max-width: 60ch;
      margin: 0;
      line-height: 1.5;
    }
    .lede code, .lede strong { color: var(--fg); }

    /* ── COVER / END ────────────────────────────────────────────────── */
    .cover {
      width: 100%; height: 100%;
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: clamp(1.5rem, 3vw, 3rem);
      column-gap: clamp(2rem, 5vw, 5rem);
    }
    .cover-meta-top, .cover-meta-bottom { grid-column: 1 / -1; }
    .cover-meta-top, .cover-meta-bottom {
      display: flex; align-items: center; gap: 0.85rem;
      color: var(--fg-faint);
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .cover-meta-bottom { color: var(--fg-soft); }
    .cover-meta-bottom code { background: transparent; padding: 0; font-size: 0.78rem; color: var(--fg); font-weight: 500; }
    .cover-meta-bottom kbd { font-size: 0.7rem; }
    .cover-aside {
      grid-column: 2 / 3;
      grid-row: 2 / 3;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-start;
      padding-bottom: 0.5rem;
      border-left: 1px solid var(--line-soft);
      padding-left: clamp(1.25rem, 2vw, 2rem);
      gap: 0.4rem;
    }
    .cover-aside .label { color: var(--fg-faint); font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; margin: 0 0 0.5rem; }
    .cover-aside p { margin: 0; color: var(--fg-soft); font-size: 0.92rem; line-height: 1.5; max-width: 28ch; }
    .cover-aside .stat-mini { font-family: "Sage UI", sans-serif; font-weight: 700; font-size: clamp(1.4rem, 1.5vw + 0.4rem, 2rem); color: var(--fg); letter-spacing: -0.02em; line-height: 1; margin-top: 0.7rem; }
    .cover-aside .stat-mini + .label { margin-top: 0.2rem; }
    @media (max-width: 900px) {
      .cover { grid-template-columns: 1fr; }
      .cover-aside { grid-column: 1 / 2; grid-row: auto; border-left: none; border-top: 1px solid var(--line-soft); padding-left: 0; padding-top: 1.25rem; }
    }
    .ref {
      display: inline-block;
      padding: 1px 8px;
      border: 1px solid var(--line);
      border-radius: 2px;
      font-size: 0.65rem;
      letter-spacing: 0.18em;
      color: var(--fg-faint);
    }
    .dot {
      display: inline-block;
      width: 10px; height: 10px;
      background: var(--signature);
      border-radius: 1px;
    }
    .cover-body { grid-column: 1 / 2; grid-row: 2 / 3; display: flex; flex-direction: column; justify-content: center; max-width: 100%; }
    .cover-body .hero-title { max-width: 14ch; }
    .hero-kicker {
      font-weight: 500;
      font-size: clamp(1rem, 0.6vw + 0.5rem, 1.4rem);
      color: var(--fg-soft);
      margin: 0 0 1.6rem;
      letter-spacing: -0.005em;
    }
    .hero-title {
      font-weight: 700;
      font-size: clamp(3.6rem, 9vw + 0.5rem, 11.5rem);
      line-height: 0.88;
      letter-spacing: -0.045em;
      margin: 0 0 1.8rem;
    }
    .hero-title .hero-emph {
      font-style: normal;
      color: var(--accent);
      letter-spacing: -0.045em;
      font-weight: 700;
    }
    .hero-sub {
      font-size: clamp(1.05rem, 0.55vw + 0.65rem, 1.4rem);
      color: var(--fg-soft);
      max-width: 38ch;
      margin: 0;
      line-height: 1.45;
    }
    .hero-sub code { background: transparent; padding: 0; color: var(--fg); }

    /* End slide variations */
    .end-body { max-width: 60ch; }
    .end-title { font-size: clamp(3rem, 7vw + 0.5rem, 9rem); }
    .colophon {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
      gap: 0.4rem 2rem;
      margin: 2.5rem 0 0;
      padding-top: 1.75rem;
      border-top: 1px solid var(--line);
      max-width: 60rem;
    }
    .colophon dt { color: var(--fg-faint); font-size: 0.85rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 0.15rem; }
    .colophon dd { margin: 0; }
    .colophon dd code { background: transparent; padding: 0; color: var(--fg); font-size: 0.88rem; }

    /* ── WHY ────────────────────────────────────────────────────────── */
    .reasons { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
    .reasons > li {
      display: grid;
      grid-template-columns: clamp(3.5rem, 5vw, 7rem) 1fr;
      gap: clamp(1.5rem, 2.5vw, 3rem);
      padding: 1.5rem 0;
      border-top: 1px solid var(--line);
      max-width: 90ch;
    }
    .reasons > li:last-child { border-bottom: 1px solid var(--line); }
    .reason-n {
      font-family: ui-monospace, monospace;
      font-weight: 500;
      font-size: clamp(1rem, 1vw + 0.4rem, 1.4rem);
      color: var(--fg-faint);
      padding-top: 0.3rem;
      letter-spacing: 0.04em;
    }
    .reasons h3 {
      margin: 0 0 0.5rem;
      font-weight: 700;
      font-size: clamp(1.4rem, 1.6vw + 0.5rem, 2.2rem);
      letter-spacing: -0.018em;
      line-height: 1.1;
    }
    .reasons p { margin: 0; color: var(--fg-soft); max-width: 62ch; line-height: 1.55; }
    .reasons p strong { color: var(--fg); font-weight: 700; }

    /* ── ARCHITECTURE ───────────────────────────────────────────────── */
    .arch-flow { display: flex; flex-direction: column; gap: 0; max-width: 70ch; }
    .arch-step {
      display: grid;
      grid-template-columns: 7rem 1fr;
      gap: 1.5rem;
      padding: 1.1rem 0;
      align-items: baseline;
      border-top: 1px solid var(--line);
    }
    .arch-step:last-of-type { border-bottom: 1px solid var(--line); }
    .arch-step.is-key { background: linear-gradient(to right, color-mix(in srgb, var(--signature) 6%, transparent), transparent 70%); padding-left: 0.5rem; margin-left: -0.5rem; border-radius: 3px; }
    .step-label { color: var(--fg-faint); font-size: 0.75rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; margin: 0; }
    .step-name { background: transparent; padding: 0; font-size: clamp(0.95rem, 0.85vw + 0.35rem, 1.3rem); color: var(--fg); font-weight: 500; display: block; }
    .arch-step.is-key .step-name { color: var(--accent); }
    .step-desc { margin: 0.3rem 0 0; color: var(--fg-soft); font-size: 0.92rem; grid-column: 2; }
    .step-desc code { background: transparent; padding: 0; color: var(--fg-soft); }
    .arch-link {
      display: grid;
      grid-template-columns: 7rem 1fr;
      gap: 1.5rem;
      padding: 0.35rem 0;
      color: var(--fg-faint);
      font-size: 0.78rem;
      letter-spacing: 0.06em;
    }
    .arch-link span { font-family: ui-monospace, monospace; color: var(--signature); }
    .arch-link em { font-style: normal; }

    /* ── ANATOMY ────────────────────────────────────────────────────── */
    .anatomy { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: clamp(2rem, 4vw, 4rem); align-items: start; }
    .anatomy-legend { margin: 0; }
    .anatomy-legend dt { font-family: ui-monospace, monospace; color: var(--accent); font-weight: 500; font-size: 1rem; margin-top: 1.1rem; }
    .anatomy-legend dt:first-child { margin-top: 0; }
    .anatomy-legend dd { margin: 0.3rem 0 0; color: var(--fg-soft); max-width: 40ch; line-height: 1.5; }
    .anatomy-legend dd code { background: transparent; padding: 0; color: var(--fg); }

    @media (max-width: 900px) {
      .anatomy { grid-template-columns: 1fr; }
    }

    /* ── TOOLS ──────────────────────────────────────────────────────── */
    .tools {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(1.25rem, 2vw, 2rem);
    }
    .tool {
      padding: 1.4rem 1.5rem;
      border: 1px solid var(--line);
      border-radius: 3px;
      background: var(--bg-deep);
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      transition: border-color .25s ease, transform .25s ease;
    }
    .tool:hover { border-color: var(--accent); }
    .tool-n {
      font-family: ui-monospace, monospace;
      font-size: 0.75rem;
      color: var(--fg-faint);
      letter-spacing: 0.1em;
      margin: 0;
    }
    .tool-name { margin: 0; font-family: ui-monospace, monospace; font-weight: 500; font-size: clamp(1.05rem, 0.7vw + 0.4rem, 1.35rem); color: var(--accent); }
    .tool-desc { margin: 0; color: var(--fg-soft); line-height: 1.5; }
    .tool-desc code { background: transparent; padding: 0; color: var(--fg); }
    .tool pre.code { margin-top: auto; }

    @media (max-width: 900px) {
      .tools { grid-template-columns: 1fr; }
    }

    /* ── SNAPSHOT ───────────────────────────────────────────────────── */
    .snapshot {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      gap: clamp(2rem, 4vw, 4rem);
      align-items: start;
    }
    .stat-hero {
      grid-row: span 2;
      display: flex;
      flex-direction: column;
      padding-top: 0.5rem;
    }
    .stat-hero .stat-n {
      font-family: "Sage UI", sans-serif;
      font-weight: 700;
      font-size: clamp(6rem, 14vw + 0.5rem, 16rem);
      line-height: 0.85;
      letter-spacing: -0.05em;
      margin: 0;
      color: var(--fg);
    }
    .stat-hero .stat-l {
      font-size: 1rem;
      color: var(--fg-faint);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin: 0.4rem 0 0;
      font-weight: 500;
    }
    .stat-grid { display: flex; flex-direction: column; gap: 0; }
    .stat-row {
      display: grid;
      grid-template-columns: minmax(0, auto) 1fr;
      gap: 1.5rem;
      padding: 1.2rem 0;
      border-top: 1px solid var(--line);
      align-items: baseline;
    }
    .stat-row:last-child { border-bottom: 1px solid var(--line); }
    .stat-row-n {
      font-family: "Sage UI", sans-serif;
      font-weight: 700;
      font-size: clamp(1.6rem, 2vw + 0.5rem, 2.6rem);
      letter-spacing: -0.025em;
      color: var(--fg);
      line-height: 1;
    }
    .stat-row-l { color: var(--fg-soft); font-size: 1rem; line-height: 1.4; }
    .stat-row-l code { background: transparent; padding: 0; color: var(--fg); }
    .layers { grid-column: 1 / -1; margin-top: 1.5rem; max-width: 50rem; }
    .layers-title { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--fg-faint); margin: 0 0 0.8rem; font-weight: 500; }
    .layer-row {
      display: grid;
      grid-template-columns: 8rem 1fr 3.5rem;
      align-items: center;
      gap: 1.2rem;
      padding: 0.35rem 0;
      border-bottom: 1px solid var(--line-soft);
    }
    .layer-k { font-family: ui-monospace, monospace; font-size: 0.95rem; color: var(--fg-soft); }
    .layer-bar { display: block; height: 4px; background: var(--line-soft); position: relative; border-radius: 0; }
    .layer-bar-fill { position: absolute; inset: 0 auto 0 0; width: var(--w); background: var(--signature); transition: width 1.2s cubic-bezier(.2,.8,.2,1); }
    .layer-v { font-family: ui-monospace, monospace; font-weight: 500; text-align: right; font-size: 0.95rem; color: var(--fg); }

    @media (max-width: 900px) {
      .snapshot { grid-template-columns: 1fr; }
      .stat-hero { grid-row: auto; }
    }

    /* ── HARDENING ──────────────────────────────────────────────────── */
    .harden { list-style: none; padding: 0; margin: 0 0 1.5rem; display: flex; flex-direction: column; }
    .harden > li {
      display: grid;
      grid-template-columns: 4rem 1fr;
      gap: 1.5rem;
      padding: 0.9rem 0;
      border-top: 1px solid var(--line);
      align-items: baseline;
    }
    .harden > li:last-of-type { border-bottom: 1px solid var(--line); }
    .h-n {
      font-family: ui-monospace, monospace;
      color: var(--fg-faint);
      font-size: 0.95rem;
      padding-top: 0.25rem;
      letter-spacing: 0.04em;
    }
    .harden h3 { margin: 0 0 0.25rem; font-weight: 700; font-size: 1.15rem; letter-spacing: -0.01em; }
    .harden p { margin: 0; color: var(--fg-soft); max-width: 70ch; }
    .caught {
      margin: 1.5rem 0 0;
      padding: 1.1rem 1.25rem;
      background: linear-gradient(to right, color-mix(in srgb, var(--signature) 12%, transparent), transparent 70%);
      border-left: 2px solid var(--signature);
      max-width: 90ch;
      color: var(--fg-soft);
      line-height: 1.5;
    }
    .caught strong { color: var(--fg); }
    .caught-mark { display: inline-block; color: var(--accent); font-weight: 700; margin-right: 0.5rem; }

    /* ── QUICKSTART ─────────────────────────────────────────────────── */
    .qs { display: flex; flex-direction: column; gap: 2rem; max-width: 70rem; }
    .qs-step { display: grid; grid-template-columns: 4rem 1fr; gap: 1.5rem; align-items: start; }
    .qs-n {
      font-family: ui-monospace, monospace;
      font-weight: 500;
      font-size: clamp(1.3rem, 1.2vw + 0.4rem, 1.8rem);
      color: var(--signature);
      letter-spacing: 0.02em;
    }
    .qs-step h3 { margin: 0 0 0.7rem; font-weight: 700; font-size: 1.2rem; letter-spacing: -0.01em; }
    .qs-note { margin: 0 0 0.8rem; color: var(--fg-soft); }
    .qs-note code { background: transparent; padding: 0; color: var(--fg); }

    /* ── ROADMAP ────────────────────────────────────────────────────── */
    .phases { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; max-width: 70ch; }
    .phase {
      padding: 1.5rem 0 1.75rem;
      border-top: 1px solid var(--line);
    }
    .phase:last-child { border-bottom: 1px solid var(--line); }
    .phase-mark {
      display: flex; align-items: center; gap: 0.7rem;
      color: var(--fg-faint);
      font-size: 0.78rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 500;
      margin: 0 0 0.6rem;
    }
    .phase-mark .dot { width: 8px; height: 8px; border-radius: 50%; }
    .phase-mark .dot.is-empty { background: transparent; border: 1px solid var(--fg-faint); }
    .phase h3 { margin: 0 0 0.55rem; font-weight: 700; font-size: clamp(1.4rem, 1.6vw + 0.5rem, 2.2rem); letter-spacing: -0.018em; line-height: 1.15; }
    .phase p { margin: 0; color: var(--fg-soft); max-width: 60ch; line-height: 1.55; }
    .phase.is-current h3 { color: var(--fg); }

    /* ── Top bar (controls, top-right only) ──────────────────────── */
    .topbar {
      position: fixed;
      top: 0; right: 0;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 1.1rem clamp(1.25rem, 3vw, 2rem);
      pointer-events: none;
      z-index: 20;
    }
    .icon-btn {
      pointer-events: auto;
      background: var(--bg);
      color: var(--fg-soft);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.4rem 0.95rem;
      font: inherit;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: border-color .2s ease, color .2s ease, background-color .2s ease;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .icon-btn:hover { border-color: var(--accent); color: var(--fg); }
    .icon-btn svg { width: 12px; height: 12px; flex: none; }

    /* ── Bottom navigation chrome ─────────────────────────────────── */
    .navbar {
      position: fixed;
      bottom: 0; right: 0;
      padding: 1.1rem clamp(1.25rem, 3vw, 2rem);
      pointer-events: none;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: clamp(0.75rem, 2vw, 1.5rem);
    }
    .navbar > * { pointer-events: auto; }
    .nav-hint {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--fg-faint);
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 500;
      padding: 0.3rem 0.7rem;
      background: color-mix(in srgb, var(--bg) 75%, transparent);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 999px;
      transition: opacity .35s ease;
    }
    .nav-hint kbd { font-size: 0.68rem; padding: 0px 6px; border-color: var(--line); color: var(--fg-soft); }
    .nav-counter {
      font-family: ui-monospace, monospace;
      font-variant-numeric: tabular-nums;
      color: var(--fg);
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.32rem 0.85rem;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: 999px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .nav-counter::before {
      content: "";
      width: 7px; height: 7px;
      background: var(--signature);
      display: inline-block;
      border-radius: 1px;
    }
    .nav-counter .sep { color: var(--fg-faint); margin: 0 0.15rem; }

    /* Hide bottom hint when index overlay is open */
    body.index-open .navbar .nav-hint { opacity: 0; }
    /* In fullscreen, lift the hint to be even subtler — purely decorative */
    body.is-fullscreen .nav-hint { opacity: .65; }
    body.is-fullscreen .nav-hint:hover { opacity: 1; }

    /* ── Index overlay (Space key) ─────────────────────────────────── */
    .index {
      position: fixed;
      inset: 0;
      background: color-mix(in srgb, var(--bg) 94%, transparent);
      backdrop-filter: blur(12px) saturate(1.05);
      -webkit-backdrop-filter: blur(12px) saturate(1.05);
      z-index: 30;
      padding: clamp(2rem, 5vw, 4.5rem);
      display: none;
      flex-direction: column;
      gap: 2rem;
      overflow: auto;
      opacity: 0;
      transition: opacity .2s ease;
    }
    body.index-open .index { display: flex; opacity: 1; }
    .index-head .chapter { margin-bottom: 0.75rem; }
    .index h2 { font-weight: 700; font-size: clamp(1.8rem, 3vw + 0.5rem, 3rem); letter-spacing: -0.025em; margin: 0 0 0.5rem; }
    .index-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
      gap: 0.75rem;
    }
    .index-tile {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1.1rem 1.2rem;
      background: var(--bg-deep);
      border: 1px solid var(--line);
      border-radius: 3px;
      cursor: pointer;
      font: inherit;
      text-align: left;
      color: var(--fg);
      transition: border-color .15s ease, transform .15s ease;
    }
    .index-tile:hover { border-color: var(--accent); transform: translateY(-1px); }
    .index-tile.is-current { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
    .idx-chapter {
      font-family: "Sage UI", sans-serif;
      font-weight: 500;
      font-size: 0.72rem;
      color: var(--fg-faint);
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .idx-title { font-weight: 700; font-size: 1.05rem; letter-spacing: -0.012em; line-height: 1.2; }

    /* ── Misc ─────────────────────────────────────────────────────── */
    ::selection { background: var(--signature); color: var(--bg-deep); }
  </style>
</head>
<body data-theme="light">
  <div class="topbar">
    <button type="button" class="icon-btn" id="fullscreen-btn" aria-label="Toggle fullscreen">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
        <path d="M1 4 V1 H4 M8 1 H11 V4 M11 8 V11 H8 M4 11 H1 V8" />
      </svg>
      <span>Full</span>
    </button>
    <button type="button" class="icon-btn" id="theme-toggle" aria-label="Toggle light or dark theme">Dark</button>
  </div>

  <div class="navbar" aria-label="Slide navigation">
    <div class="nav-hint" aria-hidden="true">
      <kbd>←</kbd><kbd>→</kbd> navigate
      <span style="opacity:.5">·</span>
      <kbd>Space</kbd> index
      <span style="opacity:.5">·</span>
      <kbd>F</kbd> full
    </div>
    <span class="nav-counter" aria-live="polite"><span id="counter-cur">01</span><span class="sep">/</span><span>${String(slides.length).padStart(2, "0")}</span></span>
  </div>

  <div class="deck">
    <div class="slides" id="slides">
${slides.map((s, i) => `      <section class="slide${i === 0 ? " is-active" : ""}" data-slide="${s.id}" data-chapter="${esc(s.chapter)}">${s.html}</section>`).join("\n")}
    </div>
  </div>

  <div class="index" id="index" role="dialog" aria-label="Slide index">
    <header class="index-head">
      <p class="chapter">Index · ${slides.length} slides</p>
      <h2>Jump to any slide</h2>
      <p class="lede"><kbd>Space</kbd> or <kbd>Esc</kbd> to close · click any tile · or use <kbd>←</kbd> <kbd>→</kbd></p>
    </header>
    <div class="index-grid">
${slides.map((s, i) => `      <button type="button" class="index-tile" data-index="${i}"><span class="idx-chapter">${esc(s.chapter)}</span><span class="idx-title">${esc(s.title)}</span></button>`).join("\n")}
    </div>
  </div>

  <script>
    (function () {
      const slidesEl = document.getElementById("slides");
      const counterCurEl = document.getElementById("counter-cur");
      const indexEl = document.getElementById("index");
      const themeBtn = document.getElementById("theme-toggle");
      const fsBtn = document.getElementById("fullscreen-btn");
      const tiles = Array.from(document.querySelectorAll(".index-tile"));
      const slideEls = Array.from(document.querySelectorAll(".slide"));
      const total = slideEls.length;
      let current = 0;

      function go(i) {
        current = Math.max(0, Math.min(total - 1, i));
        slidesEl.style.transform = "translateX(" + (-current * 100) + "vw)";
        counterCurEl.textContent = String(current + 1).padStart(2, "0");
        slideEls.forEach((el, idx) => el.classList.toggle("is-active", idx === current));
        tiles.forEach((t, idx) => t.classList.toggle("is-current", idx === current));
      }
      function toggleIndex(force) {
        const next = force !== undefined ? force : !document.body.classList.contains("index-open");
        document.body.classList.toggle("index-open", next);
      }
      function toggleTheme() {
        const cur = document.body.getAttribute("data-theme");
        const next = cur === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", next);
        themeBtn.textContent = next === "dark" ? "Light" : "Dark";
      }
      function toggleFullscreen() {
        if (!document.fullscreenElement) {
          (document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : Promise.resolve()).catch(function(){});
        } else if (document.exitFullscreen) {
          document.exitFullscreen().catch(function(){});
        }
      }
      document.addEventListener("fullscreenchange", function () {
        const isFs = !!document.fullscreenElement;
        document.body.classList.toggle("is-fullscreen", isFs);
        const label = fsBtn.querySelector("span");
        if (label) label.textContent = isFs ? "Exit" : "Full";
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "PageDown") { go(current + 1); e.preventDefault(); }
        else if (e.key === "ArrowLeft" || e.key === "PageUp") { go(current - 1); e.preventDefault(); }
        else if (e.key === " ") { toggleIndex(); e.preventDefault(); }
        else if (e.key === "Escape") { toggleIndex(false); }
        else if (e.key === "Home") { go(0); }
        else if (e.key === "End") { go(total - 1); }
        else if (e.key === "r" || e.key === "R") { go(0); }
        else if (e.key === "t" || e.key === "T") { toggleTheme(); }
        else if (e.key === "f" || e.key === "F") { toggleFullscreen(); }
      });

      tiles.forEach(function (t) {
        t.addEventListener("click", function () {
          go(parseInt(t.dataset.index, 10));
          toggleIndex(false);
        });
      });

      themeBtn.addEventListener("click", toggleTheme);
      if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);

      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.setAttribute("data-theme", "dark");
        themeBtn.textContent = "Light";
      }

      go(0);
    })();
  </script>
</body>
</html>
`;

fs.outputFileSync(resolve(root, "docs/mcp-demo.html"), html);
const bytes = fs.statSync(resolve(root, "docs/mcp-demo.html")).size;
console.log(`✅ Wrote docs/mcp-demo.html (${(bytes/1024).toFixed(1)} KB)`);
