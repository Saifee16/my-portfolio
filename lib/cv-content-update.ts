import type { Experience, PortfolioContent, ResearchItem, SkillGroup } from "./types.ts";
import { isDeepStrictEqual } from "node:util";

const migration = "cv-update-2026-10";
type FieldChanges = Record<string, { before: unknown; after: unknown }>;

const profileChanges: FieldChanges = {
  "title": {
    "before": "Applied AI & Full-Stack Engineer — Backend Focus",
    "after": "Applied AI Engineer"
  },
  "eyebrow": {
    "before": "APPLIED AI / BACKEND SYSTEMS / FULL-STACK ENGINEERING",
    "after": "COMPUTER VISION / RAG SYSTEMS / PYTHON BACKENDS"
  },
  "hero": {
    "before": "I build reliable AI systems and the software infrastructure around them.",
    "after": "I build AI systems and dependable backends."
  },
  "summary": {
    "before": "Applied AI engineer and full-stack developer with a backend focus, building production-minded systems across RAG, LLM infrastructure, ML APIs, computer vision, and commerce software.",
    "after": "Applied AI engineer focused on computer vision, RAG systems, and Python backend development. Building evaluated AI prototypes, a live retail storefront, and CNC monitoring research at NUST PNEC."
  },
  "about": {
    "before": "I work where applied AI meets dependable software engineering: typed APIs, evaluation, retrieval, data systems, testing, security, deployment, and product workflows. My goal is to build systems that are technically credible, useful to real users, and explicit about their limitations.",
    "after": "I build and evaluate AI systems with the backend infrastructure they need. My work spans computer vision, retrieval-augmented generation, Python APIs, and full-stack applications. At NUST PNEC, I contribute to Pakistan Science Foundation-funded research on CNC process-health monitoring, from machining datasets to vibration-signal inference for IoT and edge integration."
  },
  "availability": {
    "before": "Open to Applied AI, Backend, and Full-Stack engineering opportunities.",
    "after": "Available for full-time AI/ML roles in Karachi (onsite or hybrid) or remotely."
  },
  "whatsapp": {
    "before": "https://wa.me/923483034922",
    "after": "https://wa.me/923173818976"
  }
};

const cvChanges: FieldChanges = {
  "activeFileUrl": {
    "before": "",
    "after": "/uploads/saifullah-ai-cv.pdf"
  },
  "version": {
    "before": "",
    "after": "Applied AI CV - October 2026"
  },
  "updatedAt": {
    "before": "",
    "after": "2026-10-20"
  }
};

const projectChanges: Record<string, FieldChanges> = {
  "pdf-rag-chatbot": {
    "highlights": {
      "before": [
        "Asynchronous PDF ingestion with worker-based processing and persistent metadata.",
        "Dense, hybrid, and hybrid-rerank retrieval with evidence-based confidence gating and abstention.",
        "Native, scanned, and mixed PDF handling with local OCR plus layout/table-aware extraction.",
        "Validated page citations, retrieval traces, reindex fingerprints, regression evaluation, and security hardening."
      ],
      "after": [
        "Asynchronous PDF ingestion with worker-based processing and persistent metadata.",
        "Dense, hybrid, and hybrid-rerank retrieval with evidence-based confidence gating and abstention.",
        "Native, scanned, and mixed PDF handling with local OCR plus layout/table-aware extraction.",
        "Validated page citations, retrieval traces, reindex fingerprints, regression evaluation, and security hardening.",
        "Compared dense, hybrid, and reranked retrieval across 46 synthetic regression cases: 32 positive and 14 negative/no-answer."
      ]
    },
    "outcomes": {
      "before": [],
      "after": [
        "46 synthetic regression cases covering answerable and no-answer queries."
      ]
    },
    "role": {
      "before": "",
      "after": "Applied AI / backend development"
    }
  },
  "lead-scoring-ml-api": {
    "limitations": {
      "before": "All benchmark metrics are synthetic and must not be interpreted as real CRM performance or causal business impact.",
      "after": "Methodology demo using synthetic leads. The held-out ROC-AUC of 0.729 does not establish real CRM performance or causal business impact."
    },
    "outcomes": {
      "before": [],
      "after": [
        "ROC-AUC 0.729 on 1,000 held-out test rows from a 5,000-row synthetic dataset."
      ]
    }
  },
  "wahab-mobiles": {
    "subtitle": {
      "before": "A production e-commerce platform for a family retail business, spanning storefront, authentication, checkout, administration, and deployment hardening.",
      "after": "A live React/TypeScript retail catalogue with a Fastify/PostgreSQL backend, inventory and admin tools, and ordering workflows prepared for an upcoming launch."
    },
    "highlights": {
      "before": [
        "Production-oriented commerce flows for a real family business rather than a portfolio-only demo.",
        "Cookie-based JWT authentication with refresh rotation, role-based administration, and OAuth support.",
        "Server-side checkout recalculation, locking/idempotency, signed guest cart handling, CSRF defenses, rate limits, and security headers.",
        "Containerized deployment topology with API, PostgreSQL, Redis, migrations, and reverse proxy infrastructure."
      ],
      "after": [
        "React/TypeScript frontend deployed on Vercel with a Fastify/PostgreSQL backend on Render.",
        "Live catalogue lists 80+ active products for a family retail business.",
        "Inventory and administration tools with ordering workflows implemented for an upcoming launch."
      ]
    },
    "caseStudy": {
      "before": "This project demonstrates full-stack product engineering attached to an operating retail business: customer flows, administrative workflows, data integrity, security controls, and deployment concerns have to work together.",
      "after": "Built a live retail storefront for a family business, connecting catalogue browsing and inventory administration to a Fastify/PostgreSQL backend. Ordering workflows are implemented for an upcoming launch."
    },
    "limitations": {
      "before": "Commercial details, credentials, operational data, and private business information are intentionally excluded from the public case study.",
      "after": "The catalogue is live; ordering workflows are prepared for an upcoming launch. Product count reflects the supplied CV and can change. Commercial and operational data remain private."
    },
    "outcomes": {
      "before": [],
      "after": [
        "Live retail catalogue with 80+ active products, as documented in the CV."
      ]
    }
  },
  "ms-ada": {
    "stack": {
      "before": [
        "Python",
        "YOLO11",
        "OpenCV",
        "Tracking",
        "ALPR",
        "Optical Flow",
        "Docker"
      ],
      "after": [
        "Python",
        "YOLO11",
        "OpenCV",
        "ByteTrack",
        "EasyOCR",
        "ALPR",
        "Docker"
      ]
    },
    "highlights": {
      "before": [
        "Real-time vehicle detection and tracking with Pakistani plate recognition and evidence outputs.",
        "Deterministic multi-signal accident reasoning using contact/proximity, relative motion, deceleration, optical flow, and trajectory convergence.",
        "Hit-and-run monitoring, event CSVs, processed video, snapshots/clips, and alert workflows.",
        "Final Year Project at NED University; publication details will be added once the research paper is formally published."
      ],
      "after": [
        "Real-time vehicle detection and tracking with Pakistani plate recognition and evidence outputs.",
        "Deterministic multi-signal accident reasoning using contact/proximity, relative motion, deceleration, optical flow, and trajectory convergence.",
        "Hit-and-run monitoring, event CSVs, processed video, snapshots/clips, and alert workflows.",
        "Final Year Project at NED University (June 2025 - August 2026). Manuscript under peer review."
      ]
    },
    "limitations": {
      "before": "Academic prototype; no claim of production readiness or universal accident-detection accuracy. Research-paper citation will be added after formal publication.",
      "after": "Academic prototype, tested on multiple raw traffic videos. No production-readiness or universal accident-detection accuracy claim. Manuscript under peer review; publication link will be added when available."
    },
    "publication": {
      "before": {
        "status": "In preparation",
        "label": "Read research paper",
        "url": ""
      },
      "after": {
        "status": "Under peer review",
        "label": "Read research paper",
        "url": ""
      }
    },
    "outcomes": {
      "before": [],
      "after": [
        "Tested on multiple raw traffic videos with snapshots, evidence clips, and structured event outputs."
      ]
    }
  }
};

const educationChanges: Record<string, FieldChanges> = {
  "National University of Sciences & Technology (NUST)": {
    "period": {
      "before": "Starting September 2026",
      "after": "September 2026 - Present"
    },
    "description": {
      "before": "Graduate study in Artificial Intelligence at Pakistan Navy Engineering College (PNEC), Karachi. Before the program begins, this portfolio intentionally labels the degree as upcoming rather than 'Present'.",
      "after": "M.S. Artificial Intelligence at Pakistan Navy Engineering College (PNEC), Karachi. Expected graduation: 2028."
    }
  },
  "NED University of Engineering & Technology": {
    "degree": {
      "before": "B.E. Telecommunication Engineering",
      "after": "B.E. Telecommunications Engineering"
    },
    "period": {
      "before": "2022–2026",
      "after": "2022 - June 2026"
    }
  }
};

const researchChanges: Record<string, FieldChanges> = {
  "MS-ADA: AI-Powered Intelligent Traffic Surveillance for Real-Time Accident and Hit-and-Run Detection & Tracking": {
    "authors": {
      "before": "To be added after formal publication",
      "after": ""
    },
    "status": {
      "before": "Publication details pending",
      "after": "Under peer review"
    },
    "venue": {
      "before": "To be added after formal publication",
      "after": ""
    },
    "description": {
      "before": "Research publication derived from the NED Final Year Project. The portfolio will not claim publication, acceptance, venue, DOI, or citation details until they are formally available.",
      "after": "Academic computer-vision research from the NED Final Year Project (June 2025 - August 2026), combining YOLO11 detection, ByteTrack tracking, EasyOCR-based Pakistani ALPR, and multi-signal accident reasoning. Tested on multiple raw traffic videos with snapshots, evidence clips, and structured event outputs. Manuscript under peer review; no publication or acceptance is claimed."
    }
  }
};

const newExperience: Experience[] = [
  {
    "title": "Research Analyst",
    "organization": "PNEC, NUST",
    "period": "September 2026 - Present",
    "description": "Contributing to Pakistan Science Foundation-funded CNC process-health monitoring research at NUST PNEC, Karachi.",
    "highlights": [
      "Curate CNC machining datasets through preprocessing, operation-wise segmentation, and labeling of continuous production-cycle signals.",
      "Develop and evaluate PyTorch/TensorFlow models for CNC process-health monitoring.",
      "Build vibration-signal inference components for integration with the project's IoT and edge architecture."
    ],
    "links": []
  },
  {
    "title": "Full Stack Developer",
    "organization": "Wisdom Tech",
    "period": "August 2025 - August 2026",
    "description": "Backend-focused development for business and e-commerce applications. Karachi / Remote.",
    "highlights": [
      "Built Python and Node.js/TypeScript backends and APIs with PostgreSQL integration.",
      "Contributed to Shopify implementations, testing, and deployment."
    ],
    "links": []
  },
  {
    "title": "Data Analysis Intern",
    "organization": "NCBC, NED University",
    "period": "November 2024 - January 2025",
    "description": "Data analysis internship in Karachi, Pakistan.",
    "highlights": [
      "Cleaned and analyzed datasets using SQL.",
      "Built Power BI and Tableau dashboards to communicate trends and performance metrics."
    ],
    "links": []
  }
];

const newResearch: ResearchItem[] = [
  {
    "title": "CNC Process-Health Monitoring",
    "authors": "",
    "status": "Ongoing research",
    "venue": "PNEC, NUST",
    "doi": "",
    "url": "",
    "year": "",
    "description": "Pakistan Science Foundation-funded research on CNC machining signals: dataset preprocessing, operation-wise segmentation and labeling, model evaluation with PyTorch/TensorFlow, and vibration-signal inference for IoT and edge integration. Contributing as Research Analyst since September 2026.",
    "abstract": "",
    "pdfUrl": "",
    "publicationUrl": "",
    "citationCount": "",
    "featured": true
  }
];

const newSkills: SkillGroup[] = [
  {
    "id": "ai-ml",
    "category": "AI & machine learning",
    "skills": [
      "Python",
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "Model training & evaluation"
    ],
    "visible": true
  },
  {
    "id": "computer-vision",
    "category": "Computer vision",
    "skills": [
      "YOLO11",
      "OpenCV",
      "ByteTrack",
      "EasyOCR",
      "Detection",
      "Tracking",
      "ALPR"
    ],
    "visible": true
  },
  {
    "id": "llm-systems",
    "category": "LLM systems",
    "skills": [
      "RAG",
      "Embeddings",
      "Qdrant",
      "OpenAI / Gemini APIs"
    ],
    "visible": true
  },
  {
    "id": "backend-web",
    "category": "Backend & web",
    "skills": [
      "FastAPI",
      "Node.js",
      "TypeScript",
      "Fastify",
      "React",
      "PostgreSQL"
    ],
    "visible": true
  },
  {
    "id": "engineering",
    "category": "Engineering",
    "skills": [
      "Redis",
      "Celery",
      "Docker",
      "pytest",
      "Git",
      "GitHub Actions"
    ],
    "visible": true
  }
];

function patchUneditedFields<T extends object>(item: T, changes?: FieldChanges): T {
  if (!changes) return item;
  const patched = { ...item };
  for (const [field, change] of Object.entries(changes)) {
    const key = field as keyof T;
    if (isDeepStrictEqual(item[key], change.before)) {
      patched[key] = structuredClone(change.after) as T[keyof T];
    }
  }
  return patched;
}

// Upgrade known seed values while preserving content edited through the CMS.
export function applyCvContentUpdate(content: PortfolioContent): PortfolioContent {
  if (content.migrations?.includes(migration)) return content;
  return {
    ...content,
    profile: patchUneditedFields(content.profile, profileChanges),
    cv: patchUneditedFields(content.cv, cvChanges),
    projects: content.projects.map(item => patchUneditedFields(item, projectChanges[item.slug])),
    education: content.education.map(item => patchUneditedFields(item, educationChanges[item.institution])),
    experience: [
      ...structuredClone(newExperience.filter(addition => !content.experience.some(item => item.title === addition.title && item.organization === addition.organization))),
      ...content.experience,
    ],
    research: [
      ...structuredClone(newResearch.filter(addition => !content.research.some(item => item.title === addition.title))),
      ...content.research.map(item => patchUneditedFields(item, researchChanges[item.title])),
    ],
    skills: content.skills.length ? content.skills : structuredClone(newSkills),
    migrations: [...(content.migrations ?? []), migration],
  };
}
