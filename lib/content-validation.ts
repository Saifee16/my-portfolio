import type { BlogPost, Certification, Education, Experience, PortfolioContent, Project, ProjectDocument, ResearchItem } from "./types.ts";
import { isAssetUrl, isPdfAssetUrl } from "./asset-url.ts";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isString(value: unknown, max = 100_000): value is string {
  return typeof value === "string" && value.length <= max;
}

function isStringArray(value: unknown, itemMax = 500, maxItems = 100): value is string[] {
  return Array.isArray(value) && value.length <= maxItems && value.every(item => isString(item, itemMax));
}

function isHttpUrl(value: unknown, allowEmpty = true) {
  if (value === "" && allowEmpty) return true;
  if (!isString(value, 2_000)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSlug(value: unknown) {
  return isString(value, 120) && slugPattern.test(value);
}

function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false;
  return (
    isSlug(value.slug) &&
    Number.isInteger(value.rank) &&
    Number(value.rank) >= 0 &&
    Number(value.rank) <= 1_000 &&
    isString(value.title, 200) &&
    isString(value.subtitle, 2_000) &&
    isString(value.category, 120) &&
    isString(value.status, 120) &&
    (value.visibility === "Public" || value.visibility === "Unlisted" || value.visibility === "Draft") &&
    isString(value.repoVisibility, 200) &&
    isHttpUrl(value.repoUrl) &&
    isHttpUrl(value.liveUrl) &&
    !(typeof value.repoVisibility === "string" && /private/i.test(value.repoVisibility) && value.repoUrl !== "") &&
    isStringArray(value.stack, 80, 40) &&
    isStringArray(value.highlights, 2_000, 40) &&
    isString(value.architecture, 5_000) &&
    isString(value.caseStudy, 20_000) &&
    isString(value.limitations, 5_000) &&
     typeof value.featured === "boolean" &&
     (value.documents === undefined || (Array.isArray(value.documents) && value.documents.length <= 20 && value.documents.every(isProjectDocument)))
  );
}

function isProjectDocument(value: unknown): value is ProjectDocument {
  return isRecord(value) && isString(value.id, 120) && isString(value.title, 240) && isString(value.description, 2_000) && isPdfAssetUrl(value.assetUrl);
}

export function normalizePortfolioContent(input: unknown): PortfolioContent {
  if (!isRecord(input) || !Array.isArray(input.projects)) return input as PortfolioContent;
  return {
    ...input,
    projects: input.projects.map(project => {
      if (!isRecord(project) || Object.prototype.hasOwnProperty.call(project, "documents")) return project;
      return { ...project, documents: [] };
    }),
  } as PortfolioContent;
}

function isExperience(value: unknown): value is Experience {
  return isRecord(value) && isString(value.title, 200) && isString(value.organization, 200) && isString(value.period, 120) && isString(value.description, 5_000);
}

function isEducation(value: unknown): value is Education {
  return isRecord(value) && isString(value.degree, 200) && isString(value.institution, 300) && isString(value.location, 160) && isString(value.period, 120) && (value.startDate === undefined || isString(value.startDate, 20)) && isString(value.description, 5_000);
}

function isCertification(value: unknown): value is Certification {
  return isRecord(value) && isString(value.id, 120) && isString(value.name, 240) && isString(value.issuer, 240) && isString(value.issueDate, 80) && isString(value.credentialId, 240) && isHttpUrl(value.credentialUrl) && isAssetUrl(value.assetUrl) && isString(value.category, 120) && typeof value.featured === "boolean";
}

function isResearch(value: unknown): value is ResearchItem {
  return isRecord(value) && isString(value.title, 500) && isString(value.authors, 1_000) && isString(value.status, 160) && isString(value.venue, 300) && isString(value.doi, 300) && isString(value.url, 2_000) && isHttpUrl(value.url) && (value.year === "" || (Number.isInteger(value.year) && Number(value.year) >= 1900 && Number(value.year) <= 2_200)) && isString(value.description, 5_000);
}

function isBlogPost(value: unknown): value is BlogPost {
  if (!isRecord(value) || !isString(value.id, 120) || !isSlug(value.slug) || !isString(value.title, 240) || !isString(value.excerpt, 2_000) || !isString(value.content, 200_000) || !isString(value.category, 120) || !isStringArray(value.tags, 80, 40) || (value.status !== "Draft" && value.status !== "Published") || !isString(value.publishedAt, 80) || !isString(value.seoTitle, 240) || !isString(value.seoDescription, 2_000) || !isHttpUrl(value.coverImage) || !isAssetUrl(value.coverImage) || typeof value.featured !== "boolean") return false;
  if (value.status === "Published" && (value.publishedAt === "" || Number.isNaN(new Date(value.publishedAt).getTime()))) return false;
  return value.status === "Draft" ? value.publishedAt === "" : !Number.isNaN(new Date(value.publishedAt).getTime());
}

export function isPortfolioContent(input: unknown): input is PortfolioContent {
  if (!isRecord(input)) return false;
  const profile = input.profile;
  const cv = input.cv;
  const newsletter = input.newsletter;
  const settings = input.settings;
  if (!isRecord(profile) || !isRecord(cv) || !isRecord(newsletter) || !isRecord(settings)) return false;
  if (
    !isString(profile.name, 160) ||
    !isString(profile.shortName, 100) ||
    !isString(profile.title, 240) ||
    !isString(profile.eyebrow, 240) ||
    !isString(profile.hero, 1_000) ||
    !isString(profile.summary, 3_000) ||
    !isString(profile.about, 10_000) ||
    !isString(profile.availability, 1_000) ||
    !isString(profile.email, 254) ||
    !emailPattern.test(profile.email) ||
    !isHttpUrl(profile.linkedin) ||
    !isHttpUrl(profile.github) ||
    !isHttpUrl(profile.whatsapp) ||
    !isAssetUrl(profile.photoUrl)
  ) return false;
  if (!Array.isArray(input.projects) || input.projects.length > 100 || !input.projects.every(isProject)) return false;
  if (!Array.isArray(input.experience) || input.experience.length > 100 || !input.experience.every(isExperience)) return false;
  if (!Array.isArray(input.education) || input.education.length > 50 || !input.education.every(isEducation)) return false;
  if (!Array.isArray(input.certifications) || input.certifications.length > 200 || !input.certifications.every(isCertification)) return false;
  if (!Array.isArray(input.research) || input.research.length > 100 || !input.research.every(isResearch)) return false;
  if (!Array.isArray(input.blog) || input.blog.length > 200 || !input.blog.every(isBlogPost)) return false;
  if (new Set(input.projects.map(project => project.slug)).size !== input.projects.length) return false;
  if (new Set(input.blog.map(post => post.slug)).size !== input.blog.length) return false;
  if (!isString(cv.label, 120) || !isAssetUrl(cv.activeFileUrl) || !isString(cv.version, 160) || !isString(cv.updatedAt, 80)) return false;
  if (!isString(newsletter.heading, 240) || !isString(newsletter.description, 2_000) || typeof newsletter.enabled !== "boolean") return false;
  if (!isHttpUrl(settings.siteUrl, false) || typeof settings.analyticsEnabled !== "boolean" || typeof settings.phoneVisible !== "boolean" || !isString(settings.projectOrderMode, 80)) return false;
  return true;
}
