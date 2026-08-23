import assert from "node:assert/strict";
import { unlink } from "node:fs/promises";
import { readFileSync as readTextFile } from "node:fs";
import test from "node:test";
import { formatEducationPeriod } from "../lib/content-utils.ts";
import { isPortfolioContent } from "../lib/content-validation.ts";
import { renderMarkdown } from "../lib/markdown.ts";
import { hasValidFileSignature } from "../lib/uploads.ts";
import { hashAdminPassword, isAdminPasswordHash, verifyAdminPasswordHash } from "../lib/security.ts";
import { issueAdminSession, revokeAdminSession, verifySessionToken } from "../lib/session.ts";

type SeedProject = { slug: string; featured: boolean; liveUrl: string; repoUrl: string; status: string };
type SeedContent = { projects: SeedProject[]; education: Array<{ startDate?: string; period: string }> } & Record<string, unknown>;
const content = JSON.parse(readTextFile(new URL("../data/content.json", import.meta.url), "utf8")) as SeedContent;

test("seeded portfolio content preserves the required project hierarchy", () => {
  assert.equal(isPortfolioContent(content), true);
  assert.deepEqual(content.projects.map(project => project.slug), ["pdf-rag-chatbot", "llm-api-gateway", "lead-scoring-ml-api", "ai-engineering-starter-kit", "wahab-mobiles", "lucidfence", "atlas", "ms-ada"]);
  assert.equal(content.projects.filter(project => project.featured).length, 4);
  assert.equal(content.projects.find(project => project.slug === "wahab-mobiles")?.liveUrl, "https://wahabmobiles.com");
  assert.equal(content.projects.find(project => project.slug === "lucidfence")?.repoUrl, "");
  assert.equal(content.projects.find(project => project.slug === "atlas")?.repoUrl, "");
  assert.equal(content.projects.find(project => project.slug === "ms-ada")?.status, "Research Prototype");
});

test("education period changes truthfully after the configured start date", () => {
  const education = content.education[0];
  assert.equal(formatEducationPeriod(education as never, new Date("2026-08-23T00:00:00Z")), "Starting September 2026");
  assert.equal(formatEducationPeriod(education as never, new Date("2026-09-07T00:00:00Z")), "September 2026 – Present");
});

test("admin password hashes verify without storing the plaintext", () => {
  const password = "A long portfolio password 2026!";
  const hash = hashAdminPassword(password);
  assert.equal(isAdminPasswordHash(hash), true);
  assert.equal(verifyAdminPasswordHash(password, hash), true);
  assert.equal(verifyAdminPasswordHash("wrong password", hash), false);
  assert.equal(hash.includes(password), false);
  assert.equal(isAdminPasswordHash("change-me"), false);
});

test("admin sessions are registered and revoked on logout", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const previousSessionSecret = process.env.ADMIN_SESSION_SECRET;
  const environment = process.env as Record<string, string | undefined>;
  environment.NODE_ENV = "production";
  process.env.ADMIN_PASSWORD_HASH = hashAdminPassword("A session test password 2026!");
  process.env.ADMIN_SESSION_SECRET = "a deliberately local test secret that is longer than 32 characters";
  try {
    const token = await issueAdminSession();
    assert.equal(await verifySessionToken(token), true);
    await revokeAdminSession(token);
    assert.equal(await verifySessionToken(token), false);
  } finally {
    if (previousNodeEnv === undefined) delete environment.NODE_ENV; else environment.NODE_ENV = previousNodeEnv;
    if (previousPasswordHash === undefined) delete process.env.ADMIN_PASSWORD_HASH; else process.env.ADMIN_PASSWORD_HASH = previousPasswordHash;
    if (previousSessionSecret === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = previousSessionSecret;
    await unlink(new URL("../data/admin-sessions.json", import.meta.url)).catch(() => undefined);
  }
});

test("markdown output escapes HTML and supports safe code fences", () => {
  const html = renderMarkdown("# Safe heading\n\n<script>alert(1)</script>\n\n```ts\nconst value = '<x>';\n```\n\n[x](javascript:alert(1))");
  assert.match(html, /<h1 id="safe-heading">Safe heading<\/h1>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /<pre><code class="language-ts">[\s\S]*&lt;x&gt;/);
  assert.doesNotMatch(html, /href="javascript:/);
});

test("upload validation checks file signatures instead of trusting MIME alone", () => {
  assert.equal(hasValidFileSignature("application/pdf", new TextEncoder().encode("%PDF-1.7")), true);
  assert.equal(hasValidFileSignature("application/pdf", new TextEncoder().encode("not a pdf")), false);
  assert.equal(hasValidFileSignature("image/png", new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), true);
  assert.equal(hasValidFileSignature("image/png", new Uint8Array([137, 80, 78])), false);
});
