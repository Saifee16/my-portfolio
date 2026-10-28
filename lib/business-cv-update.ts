import type { Experience, NowEntry, PortfolioContent, Project, SkillGroup } from "./types.ts";

const migration = "business-cv-2026-10-29";

const profileUpdate = {
  title: "Associate Business Analyst | Solution Design & Systems Integration",
  eyebrow: "BUSINESS ANALYSIS / SOLUTION DESIGN / SYSTEMS INTEGRATION",
  hero: "I turn business needs into working systems.",
  summary: "Business analysis, solution design, and systems integration, backed by hands-on work in applied AI, backend development, data analytics, and industrial AI research.",
  about: "I am a telecommunications engineer and M.S. Artificial Intelligence candidate with experience in business analysis, backend development, applied AI, data analysis, and industrial AI research. I translate business needs into practical technology solutions through requirements gathering, workflow analysis, application features, and API integrations. My work includes AI-enabled applications, RAG and LLM systems, ML decision support, reporting dashboards, and CNC process-health monitoring research at NUST PNEC.",
  availability: "Open to associate business analysis and AI business solutions roles in Karachi or remotely.",
};

const roles: Experience[] = [
  {
    title: "AI Research Associate",
    organization: "PNEC, NUST",
    period: "September 2026 - Present",
    description: "Contributing to Pakistan Science Foundation-funded CNC process-health monitoring research at NUST PNEC, Karachi.",
    highlights: [
      "Curate CNC machining datasets through preprocessing, operation-wise segmentation, and labeling of continuous production-cycle signals.",
      "Develop and evaluate PyTorch/TensorFlow models for CNC process-health monitoring.",
      "Build vibration-signal inference components for integration with the project's IoT/edge architecture.",
    ],
    links: [],
  },
  {
    title: "Business Solutions & Systems Design Engineer",
    organization: "Wisdom Tech",
    period: "August 2025 - August 2026",
    description: "Translated client needs and business workflows into practical application features, API integrations, and delivered software solutions.",
    highlights: [
      "Participated in client meetings to understand business needs, capture requirements, and clarify workflows.",
      "Proposed practical solutions, translating business needs into application features and API integrations.",
      "Implemented solutions using Python, Node.js/TypeScript, PostgreSQL, and Shopify; supported testing, deployment, and client feedback.",
    ],
    links: [],
  },
  {
    title: "Data Analysis Intern",
    organization: "NCBC, NED University",
    period: "November 2024 - January 2025",
    description: "Data analysis internship in Karachi, Pakistan.",
    highlights: [
      "Cleaned and analyzed datasets using SQL.",
      "Built Power BI and Tableau dashboards to communicate trends and performance metrics.",
    ],
    links: [],
  },
];

const skills: SkillGroup[] = [
  { id: "business-analysis", category: "Business Analysis & Delivery", skills: ["Requirements gathering", "Stakeholder communication", "Workflow analysis", "Solution scoping"], visible: true },
  { id: "solution-design", category: "Solution Design & Integration", skills: ["System design fundamentals", "REST APIs", "Data flows", "SQL / PostgreSQL", "IoT / edge concepts"], visible: true },
  { id: "ai-ml", category: "Applied AI & ML", skills: ["RAG", "LLM APIs", "Qdrant", "scikit-learn", "PyTorch", "TensorFlow", "Model evaluation"], visible: true },
  { id: "backend-web", category: "Development & Delivery", skills: ["Python", "FastAPI", "Node.js / TypeScript", "Shopify", "Docker", "Git", "pytest", "CI/CD"], visible: true },
  { id: "data-analytics", category: "Data & Analytics", skills: ["SQL", "Power BI", "Tableau", "Reporting dashboards", "Telecommunications signal processing"], visible: true },
];

const projects: Record<string, Partial<Project>> = {
  "pdf-rag-chatbot": {
    rank: 1,
    title: "PDF RAG System",
    category: "Applied AI & Knowledge Systems",
    subtitle: "An asynchronous document-question-answering backend with OCR, traceable page citations, and confidence-based no-answer handling.",
    role: "Applied AI and backend development",
    highlights: [
      "Asynchronous FastAPI ingestion for native and scanned PDFs using Tesseract OCR and Celery/Redis workers.",
      "Qdrant retrieval with dense, hybrid, and reranked strategies, confidence-based abstention, and validated page citations.",
      "PostgreSQL conversations, retrieval traces, persistent metadata, and reindex fingerprints.",
      "Docker, automated tests, CI gates, document validation, and security hardening.",
      "Compared retrieval strategies across 46 synthetic regression cases: 32 positive and 14 negative/no-answer.",
    ],
    caseStudy: "Built an asynchronous document-question-answering backend that connects PDF ingestion, OCR, retrieval, and cited answers to application workflows. PostgreSQL conversations and retrieval traces support investigation of system behavior; confidence-based abstention handles insufficient evidence. Dense, hybrid, and reranked retrieval were compared across 46 synthetic regression cases, with automated tests and CI gates.",
    outcomes: ["46 synthetic regression cases: 32 positive and 14 negative/no-answer."],
    featured: true,
  },
  "llm-api-gateway": {
    rank: 2,
    category: "Systems Integration & APIs",
    subtitle: "A provider-neutral FastAPI gateway for OpenAI and Gemini, with consistent interfaces, fallback policies, request tracing, and usage analytics.",
    role: "Backend development and provider integration",
    highlights: [
      "Stable model aliases and provider adapters separate application code from provider-specific APIs.",
      "Retry/timeout policies, ordered fallback chains, jittered backoff, and standardized errors.",
      "Structured JSON responses and embeddings for downstream applications.",
      "Token/cost accounting, usage analytics, and request tracing to support integration decisions.",
      "Provider routing and fallback tests, CI checks, CodeQL, and Dependabot.",
    ],
    caseStudy: "Built a consistent integration boundary for applications using OpenAI and Gemini. Model aliases, provider adapters, standardized errors, and fallback policies keep upstream differences out of application workflows. Structured JSON responses and embeddings support downstream features, while token/cost accounting, usage analytics, and request tracing provide evidence for integration decisions.",
    featured: true,
  },
  "wahab-mobiles": {
    rank: 3,
    title: "Wahab Mobiles E-commerce Platform",
    category: "Product & E-commerce Solutions",
    subtitle: "A live retail catalogue with inventory/admin tools, a React/TypeScript frontend on Vercel, and a Fastify/PostgreSQL backend on Render.",
    role: "Full-stack development and API integration",
    caseStudy: "Built the React/TypeScript storefront and Fastify/PostgreSQL backend for a family retail business, connecting catalogue browsing with inventory and administration tools. The frontend runs on Vercel and the backend on Render. The catalogue has 80+ active products as of October 2026, with ordering workflows implemented for an upcoming launch.",
    outcomes: ["Live retail catalogue with 80+ active products as of October 2026."],
    featured: true,
  },
  "lead-scoring-ml-api": {
    rank: 4,
    category: "ML Decision Support",
    subtitle: "A scikit-learn/FastAPI methodology demo exploring calibrated lead scores and business-cost thresholds on a clearly labeled synthetic dataset.",
    role: "ML methodology and API development",
    caseStudy: "Built a decision-support methodology demo using 5,000 synthetic leads with separate training, validation, and test sets. Calibration diagnostics and cost-based thresholds make the relationship between model scores and decisions explicit. A FastAPI service exposes the model with typed data contracts, artifact integrity checks, and reproducible evaluation. Held-out ROC-AUC was 0.729 on 1,000 synthetic test rows; this is not a claim of real CRM performance or causal business impact.",
    featured: true,
  },
  "ai-engineering-starter-kit": { rank: 5, featured: false },
};

const now: NowEntry[] = [
  { id: "cnc-research", title: "CNC process-health monitoring research", summary: "Working as an AI Research Associate at PNEC, NUST on Pakistan Science Foundation-funded research: machining datasets, PyTorch/TensorFlow model evaluation, and vibration-signal inference for IoT/edge integration.", updatedAt: "2026-10-29", links: [], visible: true },
  { id: "ms-ai-nust", title: "M.S. Artificial Intelligence at NUST PNEC", summary: "Pursuing an M.S. in Artificial Intelligence in Karachi, with expected graduation in 2028, building on a B.E. in Telecommunications Engineering completed at NED University in June 2026.", updatedAt: "2026-10-29", links: [], visible: true },
];

// Apply this supplied CV once; later CMS edits retain the saved migration marker.
export function applyBusinessCvUpdate(content: PortfolioContent): PortfolioContent {
  if (content.migrations?.includes(migration)) return content;
  const matches = (item: Experience, role: Experience) => item.organization === role.organization && item.period === role.period;
  return {
    ...content,
    profile: { ...content.profile, ...profileUpdate },
    cv: { ...content.cv, activeFileUrl: "/uploads/saifullah-ba-cv.pdf", version: "Business Analysis CV - October 2026", updatedAt: "2026-10-29" },
    experience: [
      ...roles.map(role => {
        const previous = content.experience.find(item => matches(item, role));
        return { ...previous, ...structuredClone(role), links: previous?.links ?? [] };
      }),
      ...content.experience.filter(item => !roles.some(role => matches(item, role))).map(item => /TE Links/i.test(item.organization) ? { ...item, description: "Led the NED departmental student body through 10+ events, 6 technical sessions, 10+ partnerships, and 3 community initiatives during 2025-2026." } : item),
    ],
    projects: content.projects.map(item => ({ ...item, ...structuredClone(projects[item.slug] ?? {}) })),
    skills: structuredClone(skills),
    education: content.education.map(item => item.degree === "M.S. Artificial Intelligence" ? { ...item, institution: "National University of Sciences & Technology (NUST), PNEC", description: "M.S. Artificial Intelligence candidate at Pakistan Navy Engineering College (PNEC), NUST, Karachi. Expected graduation: 2028." } : item),
    research: content.research.map(item => item.title === "CNC Process-Health Monitoring" ? { ...item, description: "Pakistan Science Foundation-funded CNC process-health monitoring research: dataset preprocessing, operation-wise segmentation and labeling, PyTorch/TensorFlow model evaluation, and vibration-signal inference for IoT/edge integration. Contributing as AI Research Associate at PNEC, NUST since September 2026." } : item),
    now: content.now.length ? content.now : structuredClone(now),
    migrations: [...(content.migrations ?? []), migration],
  };
}
