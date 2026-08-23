# Validation report

## Passed

- `npm run typecheck` — PASS
- `npm run lint` — PASS
- Content-integrity assertions — PASS
  - exactly 8 project records
  - unique slugs
  - ranks 1–8
  - exactly 4 flagship projects
  - NUST M.S. AI start date present as 7 September 2026
  - seeded blog posts remain Draft
  - Atlas and LucidFence expose no repository URL
- Secret / stale-placeholder scan — PASS for source/content files

## Production build limitation in this environment

`npm run build` was attempted. The source passes TypeScript and ESLint, but the supplied original dependency tree contains the Windows Next.js SWC binary only. In this Linux execution environment, Next.js attempts to download `@next/swc-linux-x64-gnu`; outbound npm/DNS access is unavailable, so the build stops at dependency acquisition (`EAI_AGAIN registry.npmjs.org`).

On a normal machine with npm access, run:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

The final ZIP intentionally excludes `node_modules` and build caches.
