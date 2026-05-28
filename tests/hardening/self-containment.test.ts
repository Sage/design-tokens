import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { cwd } from "process";

// Tracked files limited to versioned production sources + onboarding docs.
// We exclude docs/superpowers/ (historical working documents may reference legacy paths).
const trackedFiles = (): string[] => {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .filter(Boolean)
    .filter((p) => !p.startsWith("docs/superpowers/"));
};

describe("self-containment: no host-absolute paths in versioned code", () => {
  it("no /Users/, /home/, or C:\\ prefixes outside historical specs", () => {
    const offenders: { file: string; line: number; text: string }[] = [];
    for (const f of trackedFiles()) {
      if (!/\.(ts|js|md|json|sh)$/.test(f)) continue;
      const content = readFileSync(resolve(cwd(), f), "utf8");
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (/\/Users\/[A-Za-z]/.test(line) || /\/home\/[A-Za-z]/.test(line) || /[A-Z]:\\/.test(line)) {
          offenders.push({ file: f, line: i + 1, text: line.trim().slice(0, 120) });
        }
      });
    }
    expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);
  });
});

describe("self-containment: no references to the legacy external wrapper", () => {
  it("no occurrence of 'Sage-Design-Tokens/index.js' outside historical specs", () => {
    const offenders: string[] = [];
    for (const f of trackedFiles()) {
      const content = readFileSync(resolve(cwd(), f), "utf8");
      if (content.includes("Sage-Design-Tokens/index.js")) {
        offenders.push(f);
      }
    }
    expect(offenders, `Legacy wrapper referenced in: ${offenders.join(", ")}`).toEqual([]);
  });
});

describe("self-containment: mcp/README.md exists with required sections", () => {
  const readme = readFileSync(resolve(cwd(), "mcp/README.md"), "utf8");
  const headings = readme.match(/^## .+$/gm) ?? [];

  it.each([
    ["what", /^## what/i],
    ["running", /^## running/i],
    ["tools", /^## tools/i],
    ["hardening", /^## hardening/i],
    ["roadmap", /^## roadmap/i],
  ])("contains a '%s' section heading", (_label, pattern) => {
    expect(headings.some((h) => pattern.test(h)), `Missing heading matching ${pattern}`).toBe(true);
  });
});

describe("self-containment: root README references the MCP", () => {
  it("contains a link to mcp/README.md", () => {
    const content = readFileSync(resolve(cwd(), "README.md"), "utf8");
    expect(content).toMatch(/mcp\/README\.md/);
  });
});

describe("self-containment: mcp/ is a self-contained sub-package", () => {
  const pkg = JSON.parse(readFileSync(resolve(cwd(), "mcp/package.json"), "utf8"));

  it("declares the MCP SDK as a runtime dependency", () => {
    expect(pkg.dependencies).toBeDefined();
    expect(pkg.dependencies["@modelcontextprotocol/sdk"]).toBeDefined();
  });

  it("ships a reproducible lockfile", () => {
    expect(existsSync(resolve(cwd(), "mcp/package-lock.json"))).toBe(true);
  });
});

describe("self-containment: dist/mcp/tokens.json is reproducible without secrets", () => {
  it("scripts/postbuild.ts merges enriched tokens BEFORE the Figma icon fetch", () => {
    // The icon fetch requires FIGMA_ACCESS_TOKEN and is the last step. If the merge
    // runs after it, a fresh-clone build without that env var would never produce
    // dist/mcp/tokens.json. Verify the IIFE ordering textually.
    const post = readFileSync(resolve(cwd(), "scripts/postbuild.ts"), "utf8");
    const mergeIdx = post.indexOf("mergeMCPTokens()");
    const iconsIdx = post.search(/await\s+Icons\s*\(/);
    expect(mergeIdx, "mergeMCPTokens() call missing in postbuild").toBeGreaterThan(-1);
    expect(iconsIdx, "Icons() call missing in postbuild").toBeGreaterThan(-1);
    expect(mergeIdx, "mergeMCPTokens() must run before Icons()").toBeLessThan(iconsIdx);
  });
});
