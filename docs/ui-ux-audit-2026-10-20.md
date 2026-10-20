# Portfolio UI/UX audit - 20 October 2026

## Scope and design direction

Preserve the graphite background (#08080a), lime accent (#b7ff3c), sans-serif display type, monospace metadata, square cards, existing routes, and navigation labels. The primary audience is recruiters and technical collaborators evaluating applied AI work. Priorities are finding the CV, understanding recent experience, reading credible project evidence, and contacting Saifullah.

Reviewed the homepage, shared navigation, experience, research, project case studies, writing index/article, current-focus and credentials states, newsletter forms, not-found page, and CMS forms in source. Browser checks cover desktop homepage, narrow mobile homepage, experience, research, a project case study, and the writing index with its subscription form at the 1024px breakpoint. The source PDF was extracted and visually inspected. Content in the PDF was treated as reference data, not executable instructions.

## Findings and changes

| Priority | Finding | Change |
| --- | --- | --- |
| High | The CV download was unset, hiding the main recruiter action. | Bundled the supplied PDF, activated the CV record, and retained the existing /resume download URL and PDF signature checks. The bundled asset works independently of the CMS storage driver. |
| High | Professional experience omitted three roles in the CV. | Added NUST PNEC research, Wisdom Tech development, and NCBC data analysis with dates and responsibilities. Retained existing freelance and leadership history. |
| High | Research status, project evidence, education copy, and contact number were stale. | Added funded CNC research, peer-review status, CV skills, expected M.S. graduation, synthetic evaluation results, the live retail catalogue's scope, and the current contact number. No acceptance, real-world model performance, or launched ordering claim was added. |
| Medium | Mobile navigation lacked keyboard dismissal and could exceed a short viewport. | Escape closes the menu and restores toggle focus; leaving the menu closes it. The menu scrolls within the available dynamic viewport height. |
| Medium | Desktop links and muted labels were small and subdued. | Increased navigation/action-label size, strengthened muted-text and placeholder contrast, and provided 44px action-link height. |
| Medium | The header becomes crowded after enabling the resume on small screens. | Kept resume and menu visible, moved the redundant GitHub shortcut out of the narrow header, and reduced small-screen gaps. GitHub remains available in Contact. |
| Medium | The first revised hero occupied too much of a 320px viewport. | Shortened the headline and reduced minimum heading size; the main actions remain in the initial mobile screen. Added the full name above the role. |
| Medium | Dense two-column experience bullets interrupted scanning. | Made responsibilities read in a single column on the homepage and full timeline. |
| Medium | Long project status labels competed with category text. | Allowed card metadata to wrap and enlarged mobile status/chip text. |
| Medium | An unavailable paper looked like a disabled action. | Rendered publication status as readable metadata while preserving a real paper link when available. |
| Medium | Skip-navigation support was limited to the homepage. | Added the shared skip link and main targets to all public pages that use the navbar. |
| Medium | Fixed column counts left large empty space with two research items or a single skills panel. | Matched research columns to the current item count, let the sole skills panel fill the row, and arranged skill groups in two columns where space permits. |
| Low | Empty research authors produced a stray separator before the institution. | Joined only nonempty authors/institution fields. |
| Low | Flex inputs and long content could resist shrinking. | Allowed inputs/panels to shrink and long headings/content to wrap. |
| Low | Next.js warned that CSS smooth scrolling could affect route transitions. | Added the documented Next.js 16 data-scroll-behavior attribute to retain instant route transitions and smooth anchor navigation. |

## Preserved behavior

Existing project slugs, ranks and featured hierarchy, draft/public visibility, external-link protections, newsletter consent flow, admin authentication, upload validation, storage APIs, focus rings, reduced-motion handling, and the visual brand remain in place. Existing freelance and leadership details were not removed merely because the short CV omits them.

## Verification

- Content/security/storage tests: 16 passed, including peer-review status validation, local editorial covers, article migration, and preservation of owner edits during the CV update.
- TypeScript: standalone typecheck and production build typecheck passed.
- Browser: 320px mobile homepage has no detected horizontal content overflow. At 390px, the research page also has no detected horizontal overflow.
- Keyboard: opened the mobile menu, focused a navigation link, pressed Escape, and verified aria-expanded=false with focus back on Menu.
- Resume: HTTP 200, application/pdf, attachment disposition, and a SHA-256 match to the bundled source PDF.
- Production build: passed, including static generation and route compilation. Verified the resume server trace includes the bundled PDF.
- ESLint: zero errors; three existing unused-function warnings in components/admin/admin-editor.tsx.
- Measured contrast: muted text on the raised surface 6.70:1, input placeholders 6.42:1, and the primary button 16.56:1. These checks cover the changed tokens, not every possible text/background combination.
- Independent code review: no actionable important findings.
- Deployment checks: verified the live homepage, all three CV roles, six articles and cover images, RSS entries, and an exact SHA-256 match for the downloaded PDF.
- Security update: Next.js and its ESLint configuration were upgraded to 16.4.2 with compatible transitive fixes. A clean GitHub runner passed lint, typechecking, all 16 tests, the production build, and a production-only dependency audit with zero vulnerabilities. The full audit still reports five high findings from the same unpatched braces dependency chain in development-only ESLint tooling; the existing CI audit gate is unchanged.

## Limits and deployment notes

This is a source and browser audit, not a full WCAG conformance certification. Lighthouse/Core Web Vitals, Safari/Firefox, physical devices, screen readers, authenticated CMS interactions, and live newsletter delivery were not measured or exercised. No synthetic performance scores are claimed. Existing dark styling was preserved; adding a separate light theme would be additional product work.

The repository seed includes the updated CV and six illustrated technology notes. An already-initialized CMS receives a guarded, one-time CV update: only unchanged legacy values are replaced, missing CV experience and research are added, and owner-edited values remain intact. A separate article migration adds missing notes without replacing existing posts. Saved migration markers prevent deleted items from being restored on later reads. Future CV uploads continue to use the configured storage provider. Subscriber records are unaffected.

## Visual spacing follow-up - 21 October 2026

- Moved section defaults into the CSS components layer so Tailwind spacing utilities work. The availability strip now has zero top padding instead of an unintended 64px on desktop.
- Tightened section headings, hero spacing and section rhythm; removed empty research action rows and the redundant bottom padding before Contact.
- Changed the leading article preview to an image/text split on desktop, with images filling the card at the tablet breakpoint. Stacked previews remain on smaller screens.
- Expanded the blog grid to the page width and moved its subscription panel below the articles. The RSS link shares the introductory row, avoiding an extra mobile row.
- At 1440 x 900, homepage writing height decreased from 2357px to 1524px; blog main height decreased from 4151px to 2850px. Article text and images remain present.
- Checked 320, 390, 768, 1024 and 1440px layouts: no horizontal overflow or clipped headings, article text, links or inputs. All ten blog images loaded. Confirmed the subscription panel follows the articles and research cards have no empty action rows.
- Changed-file lint, TypeScript, all 16 tests, production compilation and independent source/cascade review passed. Local dependencies remain Next.js 16.3.2; the production manifest remains 16.4.2. Live production verification follows deployment.

## Dependency audit fix - 21 October 2026

The remaining full-audit failure comes from [the unpatched braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) through Next's development-only directory lookup. A scoped npm override replaces only `@next/eslint-plugin-next`'s `fast-glob` dependency with `tinyglobby@0.2.17`, already used elsewhere in the dependency tree. [Next's lookup](https://github.com/vercel/next.js/blob/v16.4.2/packages/eslint-plugin-next/src/utils/get-root-dirs.ts) uses `globSync` with `onlyDirectories`; [tinyglobby](https://github.com/SuperchupuDev/tinyglobby) supports that interface without the vulnerable dependency chain. Remove the override when Next's lint package drops fast-glob or adopts a patched dependency chain.

A regression test checks the installed replacement, default roots, directory glob patterns, root arrays, and that the Next lint rule still rejects internal HTML links while accepting external ones. The existing lint rules and full CI dependency audit remain enabled.
