import type { BlogPost, Certification, CommunityRole, Education, Experience, ImpactMetric, PortfolioContent, Project, ProjectDocument, ProjectVisual, ResearchItem, SkillGroup, Testimonial, NowEntry } from "./types.ts";
import { isAssetUrl, isPdfAssetUrl } from "./asset-url.ts";
import { editorialMigration, editorialPosts } from "./editorial-content.ts";

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

function isLinkArray(value: unknown) {
  return Array.isArray(value) && value.length <= 30 && value.every(item => isRecord(item) && isString(item.label, 120) && isHttpUrl(item.url));
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
     (value.role === undefined || isString(value.role, 240)) &&
     (value.outcomes === undefined || isStringArray(value.outcomes, 2_000, 40)) &&
     (value.visuals === undefined || (Array.isArray(value.visuals) && value.visuals.length <= 30 && value.visuals.every(isProjectVisual))) &&
     typeof value.featured === "boolean" &&
     (value.publication === undefined || isResearchPublication(value.publication)) &&
     (value.documents === undefined || (Array.isArray(value.documents) && value.documents.length <= 20 && value.documents.every(isProjectDocument)))
  );
}

function isEditorialCoverUrl(value: unknown) {
  return typeof value === "string" && /^\/media\/editorial\/[a-z0-9-]+\.svg$/i.test(value);
}

function isResearchPublication(value: unknown) {
  return isRecord(value) &&
    (value.status === "Planned" || value.status === "In preparation" || value.status === "Preprint available" || value.status === "Published") &&
    isString(value.label, 240) &&
    isHttpUrl(value.url);
}

function isProjectDocument(value: unknown): value is ProjectDocument {
  return isRecord(value) && isString(value.id, 120) && isString(value.title, 240) && isString(value.description, 2_000) && isPdfAssetUrl(value.assetUrl);
}

function isProjectVisual(value: unknown): value is ProjectVisual {
  return isRecord(value) && isString(value.id, 120) && isString(value.title, 240) && isString(value.alt, 300) && isAssetUrl(value.assetUrl);
}

export function normalizePortfolioContent(input: unknown): PortfolioContent {
  if (!isRecord(input) || !Array.isArray(input.projects)) return input as PortfolioContent;
  const migrations = isStringArray(input.migrations, 120, 40) ? input.migrations : [];
  const hasEditorialMigration = migrations.includes(editorialMigration);
  const blog = Array.isArray(input.blog) ? input.blog : [];
  return {
    ...input,
    projects: input.projects.map(project => {
      if (!isRecord(project)) return project;
      const normalized = {
        ...project,
        documents: Array.isArray(project.documents) ? project.documents : [],
        role: typeof project.role === "string" ? project.role : "",
        outcomes: Array.isArray(project.outcomes) ? project.outcomes : [],
        visuals: Array.isArray(project.visuals) ? project.visuals : [],
      } as Record<string, unknown>;
      if (normalized.slug !== "ms-ada" || Object.prototype.hasOwnProperty.call(normalized, "publication")) return normalized;
      return { ...normalized, publication: { status: "In preparation", label: "Read research paper", url: "" } };
    }),
    blog: !hasEditorialMigration
      ? [...blog, ...editorialPosts.filter(post => !blog.some(item => isRecord(item) && item.slug === post.slug))]
      : blog,
    migrations: hasEditorialMigration ? migrations : [...migrations, editorialMigration],
    experience: Array.isArray(input.experience) ? input.experience.map(item => isRecord(item) ? { ...item, highlights: Array.isArray(item.highlights) ? item.highlights : [], links: Array.isArray(item.links) ? item.links : [] } : item) : [],
    research: Array.isArray(input.research) ? input.research.map(item => isRecord(item) ? { ...item, abstract: typeof item.abstract === "string" ? item.abstract : "", pdfUrl: typeof item.pdfUrl === "string" ? item.pdfUrl : "", publicationUrl: typeof item.publicationUrl === "string" ? item.publicationUrl : item.url ?? "", citationCount: typeof item.citationCount === "number" || item.citationCount === "" ? item.citationCount : "", featured: typeof item.featured === "boolean" ? item.featured : false } : item) : [],
    impact: Array.isArray(input.impact) ? input.impact : [],
    skills: Array.isArray(input.skills) ? input.skills : [],
    now: Array.isArray(input.now) ? input.now : [],
    testimonials: Array.isArray(input.testimonials) ? input.testimonials : [],
    community: Array.isArray(input.community) ? input.community : [],
    activity: isRecord(input.activity) ? { enabled: input.activity.enabled === true, githubUrl: typeof input.activity.githubUrl === "string" ? input.activity.githubUrl : "" } : { enabled: false, githubUrl: "" },
  } as PortfolioContent;
}

function isExperience(value: unknown): value is Experience {
  return isRecord(value) && isString(value.title, 200) && isString(value.organization, 200) && isString(value.period, 120) && isString(value.description, 5_000) && (value.highlights === undefined || isStringArray(value.highlights, 2_000, 30)) && (value.links === undefined || isLinkArray(value.links));
}

function isEducation(value: unknown): value is Education {
  return isRecord(value) && isString(value.degree, 200) && isString(value.institution, 300) && isString(value.location, 160) && isString(value.period, 120) && (value.startDate === undefined || isString(value.startDate, 20)) && isString(value.description, 5_000);
}

function isCertification(value: unknown): value is Certification {
  return isRecord(value) && isString(value.id, 120) && isString(value.name, 240) && isString(value.issuer, 240) && isString(value.issueDate, 80) && isString(value.credentialId, 240) && isHttpUrl(value.credentialUrl) && isAssetUrl(value.assetUrl) && isString(value.category, 120) && typeof value.featured === "boolean";
}

function isResearch(value: unknown): value is ResearchItem {
  return isRecord(value) && isString(value.title, 500) && isString(value.authors, 1_000) && isString(value.status, 160) && isString(value.venue, 300) && isString(value.doi, 300) && isString(value.url, 2_000) && isHttpUrl(value.url) && (value.abstract === undefined || isString(value.abstract, 10_000)) && (value.pdfUrl === undefined || isAssetUrl(value.pdfUrl)) && (value.publicationUrl === undefined || isHttpUrl(value.publicationUrl)) && (value.year === "" || (Number.isInteger(value.year) && Number(value.year) >= 1900 && Number(value.year) <= 2_200)) && (value.citationCount === undefined || value.citationCount === "" || (Number.isInteger(value.citationCount) && Number(value.citationCount) >= 0)) && (value.featured === undefined || typeof value.featured === "boolean") && isString(value.description, 5_000);
}

function isImpact(value: unknown): value is ImpactMetric { return isRecord(value) && isString(value.id, 120) && isString(value.label, 160) && isString(value.value, 160) && isString(value.detail, 500) && isHttpUrl(value.sourceUrl) && typeof value.visible === "boolean"; }
function isSkillGroup(value: unknown): value is SkillGroup { return isRecord(value) && isString(value.id, 120) && isString(value.category, 160) && isStringArray(value.skills, 120, 50) && typeof value.visible === "boolean"; }
function isNowEntry(value: unknown): value is NowEntry { return isRecord(value) && isString(value.id, 120) && isString(value.title, 240) && isString(value.summary, 3_000) && isString(value.updatedAt, 80) && isLinkArray(value.links) && typeof value.visible === "boolean"; }
function isTestimonial(value: unknown): value is Testimonial { return isRecord(value) && isString(value.id, 120) && isString(value.quote, 2_000) && isString(value.author, 200) && isString(value.role, 200) && isString(value.organization, 200) && isHttpUrl(value.profileUrl) && typeof value.visible === "boolean"; }
function isCommunity(value: unknown): value is CommunityRole { return isRecord(value) && isString(value.id, 120) && isString(value.title, 240) && isString(value.organization, 240) && isString(value.period, 120) && isString(value.description, 3_000) && isHttpUrl(value.url) && typeof value.visible === "boolean"; }

function isBlogPost(value: unknown): value is BlogPost {
  if (!isRecord(value) || !isString(value.id, 120) || !isSlug(value.slug) || !isString(value.title, 240) || !isString(value.excerpt, 2_000) || !isString(value.content, 200_000) || !isString(value.category, 120) || !isStringArray(value.tags, 80, 40) || (value.status !== "Draft" && value.status !== "Published") || !isString(value.publishedAt, 80) || !isString(value.seoTitle, 240) || !isString(value.seoDescription, 2_000) || !isHttpUrl(value.coverImage) || !(isAssetUrl(value.coverImage) || isEditorialCoverUrl(value.coverImage)) || typeof value.featured !== "boolean") return false;
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
  if (input.impact !== undefined && (!Array.isArray(input.impact) || input.impact.length > 100 || !input.impact.every(isImpact))) return false;
  if (input.skills !== undefined && (!Array.isArray(input.skills) || input.skills.length > 50 || !input.skills.every(isSkillGroup))) return false;
  if (input.now !== undefined && (!Array.isArray(input.now) || input.now.length > 50 || !input.now.every(isNowEntry))) return false;
  if (input.testimonials !== undefined && (!Array.isArray(input.testimonials) || input.testimonials.length > 50 || !input.testimonials.every(isTestimonial))) return false;
  if (input.community !== undefined && (!Array.isArray(input.community) || input.community.length > 50 || !input.community.every(isCommunity))) return false;
  if (input.activity !== undefined && (!isRecord(input.activity) || typeof input.activity.enabled !== "boolean" || !isHttpUrl(input.activity.githubUrl))) return false;
  if (!Array.isArray(input.blog) || input.blog.length > 200 || !input.blog.every(isBlogPost)) return false;
  if (input.migrations !== undefined && !isStringArray(input.migrations, 120, 40)) return false;
  if (new Set(input.projects.map(project => project.slug)).size !== input.projects.length) return false;
  if (new Set(input.blog.map(post => post.slug)).size !== input.blog.length) return false;
  if (!isString(cv.label, 120) || !isAssetUrl(cv.activeFileUrl) || !isString(cv.version, 160) || !isString(cv.updatedAt, 80)) return false;
  if (!isString(newsletter.heading, 240) || !isString(newsletter.description, 2_000) || typeof newsletter.enabled !== "boolean") return false;
  if (!isHttpUrl(settings.siteUrl, false) || typeof settings.analyticsEnabled !== "boolean" || typeof settings.phoneVisible !== "boolean" || !isString(settings.projectOrderMode, 80)) return false;
  return true;
}
