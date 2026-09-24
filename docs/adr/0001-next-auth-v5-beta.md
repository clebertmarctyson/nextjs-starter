# 0001: Use NextAuth v5 (beta) instead of a stable v4 release

Date: 2026-09-10
Status: Accepted

## Context

This starter needs an auth solution with first-class App Router support (server-side `auth()` in route handlers/server components), a Prisma adapter, and OAuth provider support (Google, with room for more). NextAuth v4 is stable but was designed around the Pages Router; its App Router support is retrofitted and awkward. NextAuth v5 (Auth.js) is built around the App Router from the ground up but has not reached a stable `5.0.0` release — it's been in beta for an extended period.

## Decision

Use `next-auth@5.0.0-beta.x`, pinned to an exact beta version (never a caret range — see the `next-auth` version note in the `nextjs-starter-reuse` skill), rather than v4 stable or an alternative library (Lucia, Clerk, a hand-rolled JWT flow).

## Alternatives considered

- **NextAuth v4 (stable)**: rejected — App Router integration requires workarounds the v5 API doesn't need; would mean migrating to v5 later anyway once it stabilizes, at higher cost than starting on v5 now.
- **Lucia / hand-rolled auth**: rejected for a general-purpose starter — more implementation and maintenance surface for something OAuth providers already solve well; NextAuth's ecosystem (adapters, providers) is worth the beta-stability tradeoff here.
- **Clerk / hosted auth-as-a-service**: rejected as the *default* — adds a recurring cost and external dependency unsuitable for a starter meant to be cloned into many different client/proprietary projects with different budgets; a project with different requirements can swap it in later.

## Consequences

- Every dependency upgrade pass (see the starter's own upgrade history) must bump `next-auth` explicitly to a newer `5.0.0-beta.N` — a blanket `pnpm up --latest` resolves the `latest` npm dist-tag to a v4 stable release and would silently break the app. This is documented in the `nextjs-starter-reuse` skill precisely so it isn't rediscovered the hard way on the next upgrade.
- Being on beta software means occasional breaking changes between beta versions are possible; verify the build + auth routes (see the starter's verification steps) after every `next-auth` bump, not just a version-number diff.
- Once NextAuth v5 reaches a stable `5.0.0` release, this ADR should be marked superseded by whichever ADR records the move to the stable release.
