# nextjs-starter

Reusable Next.js starter template with authentication and a database already wired up. Use this as the base for a new project instead of scaffolding from scratch — see the [`nextjs-starter-reuse`](https://github.com/clebertmarctyson/nextjs-starter) skill in this author's Claude Code setup for the full reuse workflow.

## Stack

- **Next.js** (App Router) + **React**, TypeScript
- **Prisma 7** + **Postgres**
- **NextAuth v5** (beta) with **Google OAuth**, backed by `@auth/prisma-adapter`
- **next-intl** — i18n wired for `en`/`fr`, routes live under `app/[locale]/`
- Minimalist dark header (logo + name, language dropdown, login/logout) in `components/layout/Header.tsx`
- SEO metadata (OpenGraph, Twitter card, `robots.ts`, `sitemap.ts`) and a full favicon/icon suite — all placeholder values, replace per real project
- Radix UI primitives + shadcn-style `components/ui/`
- Tailwind CSS v4
- pnpm

## Quickstart (working on this starter itself)

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET
pnpm run db:migrate
pnpm run dev
```

## Starting a new project from this template

This repo is a GitHub template repository. Don't `git clone` it directly — that carries this repo's git history and leaves `origin` pointed back here.

```bash
gh repo create my-new-project --template clebertmarctyson/nextjs-starter --private --clone
cd my-new-project
pnpm install
```

Then set fresh values in `.env` for the new project (a new database, a new `AUTH_SECRET`, and a new Google Cloud OAuth client — don't reuse this starter's own credentials across projects).

## Scripts

| Command | What it does |
|---|---|
| `pnpm run dev` | Start the dev server |
| `pnpm run build` | Production build |
| `pnpm run lint` | Run ESLint |
| `pnpm run test` | Run the test suite (Vitest) |
| `pnpm run db:migrate` | Apply Prisma migrations (dev) |
| `pnpm run db:generate` | Regenerate the Prisma client |
| `pnpm run db:studio` | Open Prisma Studio |

## Team skills and standards

`.claude/skills/` in this repo carries the team's shared engineering skills (git workflow, code review, security defaults, testing strategy, architecture principles, and more), installed from [`vunep/skills`](https://github.com/vunep/skills) and committed to git — anyone who clones this repo gets them automatically via any Claude Code (or other supported agent) session. To pull the latest versions:

```bash
npx skills add vunep/skills --skill '*' -a claude-code -y
```

## Architecture decisions

Non-obvious technical decisions are recorded in `docs/adr/` as they're made — see [`docs/adr/0001-next-auth-v5-beta.md`](docs/adr/0001-next-auth-v5-beta.md) for why this starter runs on a NextAuth v5 beta instead of a stable v4 release.

## Rebranding for a new project

Several things are deliberately left as placeholders and need real values once cloned:
- `lib/constants.ts` — `APP_NAME`
- `app/[locale]/layout.tsx` — `SITE_URL`, description, keywords, OG/Twitter image
- `app/robots.ts`, `app/sitemap.ts` — `SITE_URL`
- `public/*` — the generated favicon/icon suite is a placeholder mark (solid black square); regenerate from a real logo — see the `favicon-icon-suite` skill in `vunep/skills`
- `messages/en.json`, `messages/fr.json` — starter copy on the home page

## Known gaps

- Docker support is in progress on the `dockerize` branch.
