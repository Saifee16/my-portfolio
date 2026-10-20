import assert from "node:assert/strict";
import { unlink } from "node:fs/promises";
import { readFileSync as readTextFile } from "node:fs";
import test from "node:test";
import { formatEducationPeriod } from "../lib/content-utils.ts";
import { isPortfolioContent, normalizePortfolioContent } from "../lib/content-validation.ts";
import { renderMarkdown } from "../lib/markdown.ts";
import { hasValidFileSignature, uploadRules } from "../lib/uploads.ts";
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

test("legacy projects without documents remain valid and normalize to an empty list", () => {
  const legacy = structuredClone(content) as SeedContent;
  delete (legacy.projects[0] as unknown as Record<string, unknown>).documents;
  assert.equal(isPortfolioContent(legacy), true);
  const normalized = normalizePortfolioContent(legacy);
  assert.deepEqual(normalized.projects[0].documents, []);
});

test("research publication can be under peer review without implying acceptance", () => {
  const updated = structuredClone(content) as SeedContent & { projects: Array<SeedProject & Record<string, unknown>> };
  updated.projects[0].publication = { status: "Under peer review", label: "Research paper", url: "" };
  assert.equal(isPortfolioContent(updated), true);
  updated.projects[0].publication = { status: "Accepted without review", label: "Research paper", url: "" };
  assert.equal(isPortfolioContent(updated), false);
});

test("project documents require controlled PDF assets", () => {
  const valid = structuredClone(content) as SeedContent & { projects: Array<SeedProject & Record<string, unknown>> };
  valid.projects[0].documents = [{ id: "doc-1", title: "Evaluation report", description: "Retrieval evaluation.", assetUrl: "/media/project-document-1.pdf" }];
  assert.equal(isPortfolioContent(valid), true);
  valid.projects[0].documents = [{ id: "doc-1", title: "Evaluation report", description: "Retrieval evaluation.", assetUrl: "/media/project-document-1.png" }];
  assert.equal(isPortfolioContent(valid), false);
});

test("normalized editorial content with bundled raster covers can be saved", () => {
  const normalized = normalizePortfolioContent(content);
  assert.equal(isPortfolioContent(normalized), true);
  for (const coverImage of ["/media/editorial/ann-neural-networks.png", "/media/editorial/cover.webp", "/media/editorial/01_legacy-cover.png"]) {
    const updated = structuredClone(normalized);
    updated.blog[0].coverImage = coverImage;
    assert.equal(isPortfolioContent(updated), true);
  }
  for (const coverImage of ["/media/editorial/../cover.png", "/media/editorial/cover.html", "/media/editorial/nested/cover.png"]) {
    const updated = structuredClone(normalized);
    updated.blog[0].coverImage = coverImage;
    assert.equal(isPortfolioContent(updated), false);
  }
});

test("new research notes migrate once without overwriting edits or restoring old deleted articles", () => {
  const existing = structuredClone(content);
  existing.migrations = ["editorial-v1"];
  const migrated = normalizePortfolioContent(existing);
  const published = migrated.blog.filter(post => post.status === "Published");
  assert.equal(published.length, 6);
  assert.equal(published.some(post => post.slug === "reliable-rag-begins-where-the-demo-ends"), false);
  assert.equal(new Set(published.map(post => post.slug)).size, 6);
  const edited = structuredClone(migrated);
  edited.blog.find(post => post.slug === "neuro-symbolic-ai-learning-with-reasoning")!.title = "Owner-edited title";
  edited.blog = edited.blog.filter(post => post.slug !== "spiking-neural-networks-event-driven-intelligence");
  assert.deepEqual(normalizePortfolioContent(edited).blog, edited.blog);
  assert.deepEqual(normalizePortfolioContent(migrated).blog, migrated.blog);
});

test("legacy CMS records receive CV updates while owner edits are preserved", () => {
  const legacy = normalizePortfolioContent(content);
  legacy.migrations = legacy.migrations?.filter(value => value !== "cv-update-2026-10");
  legacy.profile.hero = "I build reliable AI systems and the software infrastructure around them.";
  legacy.profile.title = "Applied AI & Full-Stack Engineer — Backend Focus";
  legacy.cv = { label: "Résumé", activeFileUrl: "", version: "", updatedAt: "" };
  legacy.experience = legacy.experience.filter(role => !["PNEC, NUST", "Wisdom Tech", "NCBC, NED University"].includes(role.organization));
  legacy.skills = [];
  const updated = normalizePortfolioContent(legacy);
  assert.equal(updated.profile.title, "Applied AI Engineer");
  assert.equal(updated.profile.hero, "I build AI systems and dependable backends.");
  assert.equal(updated.cv.activeFileUrl, "/uploads/saifullah-ai-cv.pdf");
  assert.equal(updated.experience.filter(role => role.organization === "Wisdom Tech").length, 1);
  assert.equal(updated.skills.length, 5);
  assert.deepEqual(normalizePortfolioContent(updated), updated);

  const customized = structuredClone(legacy);
  customized.profile.hero = "Owner's custom headline";
  customized.cv.activeFileUrl = "/media/owner-resume.pdf";
  customized.skills = [{ id: "owner", category: "Custom skills", skills: ["Rust"], visible: true }];
  customized.experience.unshift({ title: "Research Analyst", organization: "PNEC, NUST", period: "Owner's dates", description: "Owner's edited role", highlights: [], links: [] });
  const preserved = normalizePortfolioContent(customized);
  assert.equal(preserved.profile.hero, "Owner's custom headline");
  assert.equal(preserved.cv.activeFileUrl, "/media/owner-resume.pdf");
  assert.deepEqual(preserved.skills, customized.skills);
  assert.equal(preserved.experience.find(role => role.organization === "PNEC, NUST")?.description, "Owner's edited role");
  preserved.experience = preserved.experience.filter(role => role.organization !== "Wisdom Tech");
  assert.deepEqual(normalizePortfolioContent(preserved), preserved);
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
  assert.match(renderMarkdown("[Project](/projects/pdf-rag-chatbot)"), /href="\/projects\/pdf-rag-chatbot"/);
  assert.doesNotMatch(renderMarkdown("[Bad](/admin/login)"), /href="\/admin\/login"/);
});

test("upload validation checks file signatures instead of trusting MIME alone", () => {
  assert.equal(hasValidFileSignature("application/pdf", new TextEncoder().encode("%PDF-1.7")), true);
  assert.equal(hasValidFileSignature("application/pdf", new TextEncoder().encode("not a pdf")), false);
  assert.equal(hasValidFileSignature("image/png", new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), true);
  assert.equal(hasValidFileSignature("image/png", new Uint8Array([137, 80, 78])), false);
  assert.deepEqual(uploadRules["project-document"], { mimeTypes: ["application/pdf"], maxBytes: 10 * 1024 * 1024 });
  assert.equal(hasValidFileSignature("application/pdf", new TextEncoder().encode("not a pdf")), false);
});
