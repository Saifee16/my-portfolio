# Validation notes

The repository includes focused tests for the content contract, project hierarchy, education-date wording, scrypt password hashing, Markdown escaping/code fences, and upload signatures.

Run the full local validation suite with:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm audit --audit-level=high
npm run build
```

The CMS is intentionally supported on a persistent Node/server/VPS deployment. A serverless deployment remains blocked until `lib/cms.ts` is backed by durable database storage and uploads move to durable object storage.
