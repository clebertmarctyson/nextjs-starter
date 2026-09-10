---
name: new-project-intake
description: Guided, repeatable flow for starting a brand-new project — a structured Q&A (name, description, the actual problem being solved, stack/feature choices) before touching anything, a short confirmed plan, then executing repo creation, renaming, package.json/README/CI setup, and local verification (build, lint, auth) end to end. Use whenever a new project is being started from scratch, before creating any repo or writing any scaffolding.
metadata:
  tags: project-setup, onboarding, scaffolding
---

## When to use

Load this at the very start of a new project — before creating a repo, before running any scaffolding command, before deciding on a stack. This is the front door for "let's build something new."

## Phase 1 — Structured intake, before touching anything

Ask, using clear single/multi-choice or yes/no questions where the answer is genuinely a choice, and free text where it isn't:

- **Name** — the actual project name (not a placeholder to rename later).
- **One-line description** — what it does, for someone who's never seen it.
- **The actual problem being solved** — free text, in the user's own words. This drives every downstream decision more than the tech stack does.
- **Does it need user accounts / sign-in?** → if yes, routes to [[nextjs-starter-reuse]] (Next.js + Prisma + Google OAuth already wired) rather than a bare scaffold.
- **Does it need a database?** → same routing signal as above.
- **Is this multi-tenant from day one** (multiple customer organizations, not just multiple users)? → if yes, [[multi-tenant-saas-patterns]] applies from the first schema design, not retrofitted later.
- **Visibility** — private or public repo (default private for anything client/proprietary).
- **Anything else scope-relevant** that changes the setup — e.g. does it need to be deployed anywhere specific, does it have a hard deadline that affects how much initial scaffolding is worth doing.

Don't ask questions whose answer is already obvious from context (e.g. don't ask the stack if the user already said "Next.js app" or referenced the starter by name) — the point is filling real gaps, not going through a script mechanically.

## Phase 2 — Confirm a short plan before executing

Summarize back: name, one-line description, chosen starter/stack, repo visibility, and anything else that came out of Phase 1. Get explicit confirmation before creating anything — this mirrors the same discipline as plan-mode itself, one level down, for a task that's about to create real external state (a GitHub repo, initial commits).

## Phase 3 — Execute, in order, verifying as you go

1. **Create the repo.** Needs auth/database → [[nextjs-starter-reuse]]'s template-repo flow (`gh repo create <name> --template ... --private --clone`). Otherwise → [[gh-cli-repo-setup]] for a plain repo with full metadata set at creation (description, visibility, topics).
2. **Rename generic fields.** [[package-json-standards]]: `name`, `description`, `keywords`, `repository`, `bugs`, `homepage` all need real values, not the starter's own — this is exactly the gap found and fixed on `nextjs-starter` itself earlier.
3. **Confirm `.github/` hygiene is present** — [[github-repo-config]]. If starting from the template it's already there; if starting from scratch, set it up now, not as an afterthought.
4. **Install dependencies**, `pnpm install` (or the project's package manager).
5. **Set up `.env`** with real, project-specific credentials if auth/database is involved — a fresh `DATABASE_URL`, a fresh `AUTH_SECRET`, a fresh OAuth client per [[nextjs-starter-reuse]]. Never carry over credentials from another project.
6. **Verify locally, all of it, before calling this done:**
   - Type-check and lint pass.
   - Build succeeds.
   - Dev server boots.
   - If auth is involved: hit the auth provider/signin routes and confirm they actually respond (the same check used to verify `nextjs-starter` after its own upgrade — `/api/auth/providers` lists the provider, `/api/auth/signin` returns 200, not a 500).
7. **Write the real README** — [[docs-project-docs]]: description, quickstart (tested, not assumed), stack, scripts table.
8. **Install the shared team skill set** if it isn't already present from a template clone — see [[using-vunep-skills]].
9. **Initial commit.** Stage everything, commit with a message describing what this project is, push.

## The rule that matters most

Never mark this "done" on an unverified setup. Step 6 isn't optional or best-effort — a project that "should work" but was never actually run is not a finished setup. This mirrors exactly the discipline used when `nextjs-starter` itself was upgraded and verified this session: build, lint, typecheck, and a live functional check, not just "the code looks right."

## Checklist

- [ ] Every Phase 1 question that mattered for this project was actually asked — nothing was silently assumed that the user should have decided.
- [ ] The Phase 2 plan was confirmed before any repo/commit was created.
- [ ] `package.json` has real values, not carried-over starter/template defaults.
- [ ] Local verification actually ran (build, lint, dev server, auth check if applicable) — not skipped because "it should be fine."
- [ ] The initial commit and push actually happened — the project isn't left in a half-set-up local-only state.

## Quick self-audit

1. Could someone else read back the Phase 2 plan summary and understand exactly what's about to be built and how, or was anything left implicit?
2. Did verification actually execute (commands run, output checked), or was "should work" substituted for a real check anywhere?
3. Does `package.json`/README still contain any starter-template language (a stale description, wrong repo URL) that should have been replaced in Phase 3?
