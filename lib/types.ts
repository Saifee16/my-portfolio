export type ProjectStatus =
  | "Shipped"
  | "Production"
  | "Research Prototype"
  | "Private Alpha · Coming Soon"
  | "Private Development · Coming Soon"
  | "In Development"
  | "Coming Soon"
  | "Archived";

export type ProjectDocument = {
  id: string;
  title: string;
  description: string;
  assetUrl: string;
};

export type ProjectVisual = {
  id: string;
  title: string;
  alt: string;
  assetUrl: string;
};

export type ResearchPublication = {
  status: "Planned" | "In preparation" | "Preprint available" | "Published";
  label: string;
  url: string;
};

export type Project = {
  slug: string;
  rank: number;
  title: string;
  subtitle: string;
  category: string;
  status: ProjectStatus | string;
  visibility: "Public" | "Unlisted" | "Draft";
  repoVisibility: string;
  repoUrl: string;
  liveUrl: string;
  stack: string[];
  highlights: string[];
  architecture: string;
  caseStudy: string;
  limitations: string;
  featured: boolean;
  documents: ProjectDocument[];
  role: string;
  outcomes: string[];
  visuals: ProjectVisual[];
  publication?: ResearchPublication;
};

export type Experience = {
  title: string;
  organization: string;
  period: string;
  description: string;
  highlights: string[];
  links: { label: string; url: string }[];
};

export type Education = {
  degree: string;
  institution: string;
  location: string;
  period: string;
  startDate?: string;
  description: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  assetUrl: string;
  category: string;
  featured: boolean;
};

export type ResearchItem = {
  title: string;
  authors: string;
  status: string;
  venue: string;
  doi: string;
  url: string;
  year: number | "";
  description: string;
  abstract: string;
  pdfUrl: string;
  publicationUrl: string;
  citationCount: number | "";
  featured: boolean;
};

export type ImpactMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  sourceUrl: string;
  visible: boolean;
};

export type SkillGroup = {
  id: string;
  category: string;
  skills: string[];
  visible: boolean;
};

export type NowEntry = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  links: { label: string; url: string }[];
  visible: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  profileUrl: string;
  visible: boolean;
};

export type CommunityRole = {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  url: string;
  visible: boolean;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: "Draft" | "Published";
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  coverImage: string;
  featured: boolean;
};

export type PortfolioContent = {
  profile: {
    name: string;
    shortName: string;
    title: string;
    eyebrow: string;
    hero: string;
    summary: string;
    about: string;
    availability: string;
    email: string;
    linkedin: string;
    github: string;
    whatsapp: string;
    photoUrl: string;
  };
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  research: ResearchItem[];
  impact: ImpactMetric[];
  skills: SkillGroup[];
  now: NowEntry[];
  testimonials: Testimonial[];
  community: CommunityRole[];
  activity: {
    enabled: boolean;
    githubUrl: string;
  };
  blog: BlogPost[];
  cv: {
    label: string;
    activeFileUrl: string;
    version: string;
    updatedAt: string;
  };
  newsletter: {
    enabled: boolean;
    heading: string;
    description: string;
  };
  settings: {
    siteUrl: string;
    analyticsEnabled: boolean;
    phoneVisible: boolean;
    projectOrderMode: string;
  };
  migrations?: string[];
};

export type Subscriber = {
  email: string;
  status: "pending" | "active" | "unsubscribed";
  token: string;
  createdAt: string;
  confirmedAt: string;
  expiresAt?: string;
};

export type AnalyticsEvent = {
  path: string;
  event: string;
  at: string;
};
