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
- Scrypt-hashed single-owner admin password, signed `httpOnly` session cookie, server-side logout revocation, and no public registration.
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

Generate and set strong secrets. Never put a plaintext password in production:

```env
ADMIN_PASSWORD_HASH=<output of npm run hash-admin-password>
ADMIN_SESSION_SECRET=<at least 32 random characters>
NEXT_PUBLIC_SITE_URL=https://your-domain.example
STORAGE_DRIVER=vercel-blob
BLOB_READ_WRITE_TOKEN=<Vercel Blob read-write token>
```

Create the password hash locally with `npm run hash-admin-password`. The command reads the password without echoing it and prints only the scrypt hash. Plaintext `ADMIN_PASSWORD` values are not accepted.

If you paste that hash into a local `.env.local` dotenv file, escape each `$` separator as `\$` because Next.js expands `$` references while loading dotenv files. Secret dashboards and hosted environment-variable managers should receive the raw hash without backslashes.

Optional newsletter delivery:

```env
RESEND_API_KEY=...
NEWSLETTER_FROM="Saifullah Suleman <updates@your-domain.example>"
```

## Deployment and storage boundary

The CMS keeps its existing filesystem mode for local development and persistent Node/VPS deployments. On Vercel, set `STORAGE_DRIVER=vercel-blob`; the same `lib/cms.ts` API then stores CMS JSON, owner/session state, and validated media in one private Vercel Blob store. Public media is delivered through the controlled same-origin `/media/<generated-filename>` route (and the résumé through `/resume`), so the Blob token is used only by server code and is never returned to the browser.

Vercel Blob initialization is idempotent: the first read copies only the canonical repository seed JSON when the corresponding private object is missing. A later deployment never overwrites an initialized store. CMS saves use ETags and `If-Match`; stale admin screens receive a conflict instead of silently replacing newer content. Analytics writes are intentionally disabled in Blob mode to avoid a write per page view.

For a persistent deployment:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

Persist the `data/` directory and `public/uploads/` directory in backups. For Blob deployments, use the owner-only export/restore scripts; they write a local backup directory and never expose a backup route:

```bash
npm run export-blob -- --output=backups/blob-2026-08-25
npm run restore-blob -- --source=backups/blob-2026-08-25
```

Restore refuses to overwrite existing objects unless `--allow-overwrite` is explicitly supplied. Review the manifest and backup before restoring. Blob session objects are intentionally excluded from exports; users can log in again after a restore.

The included GitHub Actions workflow validates install, lint, typecheck, tests, dependency audit, and production build on pushes and pull requests to `main`. It does not deploy automatically.

## Project maturity language

- P1–P4: Shipped engineering projects.
- Wahab Mobiles: Production family-business e-commerce platform.
- LucidFence: Private Alpha · Coming Soon.
- Atlas: Private Development · Coming Soon; open-source planned after completion.
- MS-ADA: Academic Research Prototype; publication details intentionally remain pending until formally available.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical public URL used by metadata, sitemap, RSS, resume/newsletter links. |
| `STORAGE_DRIVER` | Yes on Vercel | `filesystem` locally or on a persistent Node host; `vercel-blob` on Vercel. |
| `BLOB_READ_WRITE_TOKEN` | Yes with Blob | Private server-side read/write token for the Vercel Blob store. Never expose it to client code. |
| `ADMIN_PASSWORD_HASH` | Yes in production | Scrypt hash generated by `npm run hash-admin-password`. |
| `ADMIN_SESSION_SECRET` | Yes in production | At least 32 random characters for signed admin sessions. |
| `RESEND_API_KEY` | Optional | Enables confirmation and publish-notification email delivery. |
| `NEWSLETTER_FROM` | Optional with Resend | Verified sender address used by the email adapter. |

## Security notes

- Keep `.env.local` out of source control.
- There is no usable default admin password. Generate a unique hash before exposing `/admin` publicly.
- Admin API routes re-check server-side authentication, same-origin requests, and login throttling.
- Session cookies are `httpOnly`, `SameSite=Strict`, Secure in production, time-limited, and revoked server-side on logout.
- Uploads enforce kind-specific MIME allowlists, size caps, and file-signature checks; generated filenames prevent traversal.
- Markdown rendering HTML-escapes user content before applying a deliberately small Markdown subset.
- Newsletter signup uses generic responses, a honeypot, rate limiting, expiring confirmation tokens, and unsubscribe links.
- No public account registration is implemented.
