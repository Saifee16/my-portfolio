import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isPortfolioContent, normalizePortfolioContent } from "../lib/content-validation.ts";

const seed = JSON.parse(readFileSync(new URL("../data/content.json", import.meta.url), "utf8"));
const migration = "business-cv-2026-10-29";

test("business CV updates an initialized store completely without duplicate roles", () => {
  const legacy = structuredClone(normalizePortfolioContent(seed));
  legacy.migrations = legacy.migrations?.filter(value => value !== migration);
  legacy.profile.title = "Applied AI Engineer";
  legacy.profile.hero = "I build AI systems and dependable backends.";
  legacy.profile.photoUrl = "/media/owner-portrait.png";
  legacy.cv.activeFileUrl = "/uploads/saifullah-ai-cv.pdf";
  legacy.skills = [];
  legacy.now = [];
  const researchRole = legacy.experience.find(item => item.organization === "PNEC, NUST")!;
  researchRole.title = "Research Analyst";
  legacy.experience.push({ ...researchRole, title: "AI Research Associate" });
  const wisdom = legacy.experience.find(item => item.organization === "Wisdom Tech")!;
  wisdom.title = "Full Stack Developer";
  wisdom.links = [{ label: "Owner's supporting link", url: "https://example.com/work" }];
  const rag = legacy.projects.find(item => item.slug === "pdf-rag-chatbot")!;
  rag.documents = [{ id: "owner-document", title: "Supporting evidence", description: "Owner's document", assetUrl: "/media/supporting-evidence.pdf" }];
  const untouched = structuredClone(legacy.projects.find(item => item.slug === "atlas"));

  const updated = normalizePortfolioContent(legacy);
  assert.equal(isPortfolioContent(updated), true);
  assert.equal(updated.profile.title, "Associate Business Analyst | Solution Design & Systems Integration");
  assert.equal(updated.profile.photoUrl, legacy.profile.photoUrl);
  assert.equal(updated.cv.activeFileUrl, "/uploads/saifullah-ba-cv.pdf");
  assert.equal(updated.experience.filter(item => item.organization === "PNEC, NUST").length, 1);
  assert.equal(updated.experience.find(item => item.organization === "PNEC, NUST")?.title, "AI Research Associate");
  const updatedWisdom = updated.experience.find(item => item.organization === "Wisdom Tech")!;
  assert.equal(updatedWisdom.title, "Business Solutions & Systems Design Engineer");
  assert.match(updatedWisdom.highlights.join(" "), /requirements/);
  assert.match(updatedWisdom.highlights.join(" "), /client feedback/);
  assert.deepEqual(updatedWisdom.links, wisdom.links);
  assert.equal(updated.experience.some(item => item.organization === "Independent"), true);
  assert.equal(updated.skills.length, 5);
  assert.match(updated.skills.flatMap(item => item.skills).join(" "), /Power BI.*Tableau/);
  assert.match(updated.skills.flatMap(item => item.skills).join(" "), /Telecommunications signal processing/);
  assert.deepEqual(updated.projects.filter(item => item.featured).sort((a,b) => a.rank-b.rank).map(item => item.slug), ["pdf-rag-chatbot", "llm-api-gateway", "wahab-mobiles", "lead-scoring-ml-api"]);
  assert.deepEqual(updated.projects.find(item => item.slug === "pdf-rag-chatbot")?.documents, rag.documents);
  assert.deepEqual(updated.projects.find(item => item.slug === "atlas"), untouched);
  assert.deepEqual(updated.blog, legacy.blog);
  assert.equal(updated.now.length, 2);
  assert.match(updated.education[0].description, /2028/);
  assert.match(updated.research.find(item => item.title === "CNC Process-Health Monitoring")!.description, /AI Research Associate/);
  assert.deepEqual(normalizePortfolioContent(updated), updated);
});

test("business CV migration preserves later admin edits and intentional removals", () => {
  const updated = structuredClone(normalizePortfolioContent(seed));
  assert.ok(updated.migrations?.includes(migration));
  updated.profile.hero = "A later owner headline";
  updated.cv.activeFileUrl = "/media/updated-owner-cv.pdf";
  updated.skills = [{ id: "custom", category: "Later skills", skills: ["Rust"], visible: true }];
  updated.experience = updated.experience.filter(item => item.organization !== "Wisdom Tech");
  updated.now = [];
  assert.deepEqual(normalizePortfolioContent(updated), updated);
});
