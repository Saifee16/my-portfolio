# Saifullah Suleman — Portfolio + Private CMS

A Graphite + Lime engineering portfolio built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The site is intentionally evidence-first: projects distinguish shipped systems, production software, private alpha work, active development, and research prototypes.

## Included

- Eight curated engineering projects with case-study routes.
- Applied AI & Full-Stack Engineer — Backend Focus positioning.
- NUST PNEC M.S. Artificial Intelligence (starting 7 September 2026).
- NED B.E. Telecommunication Engineering and MS-ADA research context.
- Freelance + TE Links experience.
- Blog with Markdown posts, drafts, categories, tags, SEO fields, and publish state.
- Private CMS for profile, project hierarchy, experience, education, certifications, research, blog, CV, newsletter, and site settings.
- Validated CV/image/certificate uploads.
- Signed `httpOnly` admin session cookie; no public registration.
- Newsletter double-opt-in flow when email delivery is configured.
- Optional Resend-based confirmation + new-post notification emails.
- Privacy-friendly page-view counting that does not record IPs, fingerprints, cookies, or ad identifiers.
- Sitemap, robots, Open Graph image, accessibility focus states, reduced-motion support, responsive layout.

## Local setup

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`. Admin is at `http://localhost:3000/admin`.

### Required before real deployment

Set strong secrets:

```env
ADMIN_PASSWORD=<strong unique password>
ADMIN_SESSION_SECRET=<at least 32 random characters>
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Optional newsletter delivery:

```env
RESEND_API_KEY=...
NEWSLETTER_FROM="Saifullah Suleman <updates@your-domain.example>"
```

## Storage note

The included CMS deliberately uses atomic JSON files in `data/` and validated local uploads in `public/uploads/` so the portfolio is self-contained and can be run immediately without adding a database dependency.

This is durable for a normal persistent Node/server/VPS deployment. **Do not rely on filesystem writes on ephemeral/serverless hosts such as standard Vercel functions.** Before using admin writes on an ephemeral host, swap `lib/cms.ts` for durable PostgreSQL storage and `app/api/admin/upload` for object storage. The UI and public pages are already isolated from the storage implementation so that migration does not require a redesign.

## Project maturity language

- P1–P4: Shipped engineering projects.
- Wahab Mobiles: Production family-business e-commerce platform.
- LucidFence: Private Alpha · Coming Soon.
- Atlas: Private Development · Coming Soon; open-source planned after completion.
- MS-ADA: Academic Research Prototype; publication details intentionally remain pending until formally available.

## Security notes

- Keep `.env.local` out of source control.
- Replace default admin credentials before exposing `/admin` publicly.
- Admin API routes re-check server-side authentication.
- Uploads enforce MIME allowlists and file-size caps.
- Markdown rendering HTML-escapes user content before applying a deliberately small Markdown subset.
- No public account registration is implemented.
