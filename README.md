# nextjs-starter

Reusable Next.js starter template with authentication and a database already wired up. Use this as the base for a new project instead of scaffolding from scratch — see the [`nextjs-starter-reuse`](https://github.com/clebertmarctyson/nextjs-starter) skill in this author's Claude Code setup for the full reuse workflow.

## Stack

- **Next.js** (App Router) + **React**, TypeScript
- **Prisma 7** + **Postgres**
- **NextAuth v5** (beta) with **Google OAuth**, backed by `@auth/prisma-adapter`
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
| `pnpm run db:migrate` | Apply Prisma migrations (dev) |
| `pnpm run db:generate` | Regenerate the Prisma client |
| `pnpm run db:studio` | Open Prisma Studio |

## Known gaps

- No custom sign-in/sign-out UI yet — currently relies on NextAuth's default hosted `/api/auth/signin` page. Add branded UI per-project as needed.
- Docker support is in progress on the `dockerize` branch.
