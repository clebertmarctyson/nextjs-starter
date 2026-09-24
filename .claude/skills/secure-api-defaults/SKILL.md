---
name: secure-api-defaults
description: Security checklist and implementation patterns for new API endpoints — auth, rate limiting, input validation, secrets handling, and error responses. Use whenever creating a new REST/GraphQL/RPC endpoint, adding an auth flow (JWT/OAuth/session), or reviewing existing endpoints before a client handoff or production deploy.
metadata:
  tags: security, api, auth, backend
---

## When to use

Load this before/while writing any server-side endpoint, middleware, or auth flow — new endpoint, new service, or a pre-deploy security pass on an existing one.

## Checklist

**Auth**
- [ ] Every endpoint has an explicit auth decision — "public" is a deliberate choice, never a default from forgetting middleware.
- [ ] Tokens (JWT) are short-lived (15-60 min access token) with a separate refresh token, not one long-lived token doing both jobs.
- [ ] JWT signature verified server-side on every request — never trust an unverified decoded payload for authorization decisions.
- [ ] Passwords hashed with bcrypt/argon2 (never SHA-256/MD5, never plaintext, never a fixed salt).
- [ ] Session/refresh tokens are revocable (a logout or "sign out everywhere" actually invalidates server-side state, not just clears the client cookie).

**Input validation**
- [ ] Every request body/query/path param validated against a schema (zod/joi/pydantic/class-validator) before it touches business logic.
- [ ] Validation happens server-side even if the client already validates — client validation is UX, not security.
- [ ] File uploads: type allowlist (not blocklist), size cap, re-encoded or scanned before storage, never served from the same origin as the app if user-uploaded.

**Rate limiting & abuse**
- [ ] Auth endpoints (login, signup, password reset, OTP) have tighter limits than general API traffic — these are the ones credential-stuffed.
- [ ] Rate limiting keyed by IP + account, not just IP (so one compromised account can't be brute-forced past a shared-NAT allowance).
- [ ] Expensive endpoints (search, export, report generation) have their own limits independent of the general API limit.

**Secrets**
- [ ] No secret (API key, DB credential, signing key) in source control — checked via `git log -p` scan or a pre-commit secret scanner, not just "I didn't add one this time."
- [ ] Secrets loaded from environment/secret manager (AWS Secrets Manager, GCP Secret Manager, Vault), never hardcoded even in "temporary" debug code.
- [ ] Different secrets per environment (dev/staging/prod) — a leaked dev key must not unlock prod.

**Error responses**
- [ ] Error responses never leak stack traces, SQL, internal file paths, or library versions to the client in production.
- [ ] Auth failures return the same generic message/timing for "wrong password" vs "user doesn't exist" (prevents user enumeration).
- [ ] 500s are logged server-side with full detail; the client only ever sees a generic message + correlation ID.

**Transport & headers**
- [ ] HTTPS enforced (HSTS header set), no mixed content.
- [ ] CORS allowlist is explicit origins, never `*` when credentials/cookies are involved.
- [ ] Security headers set: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` (or `frame-ancestors` in CSP).

## Pattern: validation + auth middleware stacked explicitly

```ts
router.post(
  '/api/invoices',
  requireAuth,                 // 401 if no valid session/token
  requireRole('billing_admin'), // 403 if authenticated but not authorized
  validateBody(createInvoiceSchema), // 400 on shape mismatch, before handler runs
  rateLimit({ windowMs: 60_000, max: 20 }),
  async (req, res) => { /* handler trusts req.body is now well-formed and req.user is authorized */ }
);
```

Never write a handler that does its own inline `if (!req.user) return res.status(401)` scattered per-route — that's how one route gets missed. Centralize auth/validation as middleware so a new endpoint is insecure only if someone actively forgets to attach the middleware, not by default.

## Quick self-audit before a client handoff or prod deploy

1. List every route. For each, confirm: who can call it unauthenticated, and is that intentional?
2. Hit each mutating endpoint with an invalid/malformed body — confirm 400, not a 500 or a silent partial write.
3. Grep the repo for `console.log`, hardcoded strings matching key-like patterns (`sk_`, `AKIA`, `-----BEGIN`), and confirm none in tracked files.
4. Check CORS config for `*` combined with `credentials: true` — that combination is invalid/dangerous and must not exist.
5. Confirm rate limiting is actually wired to auth endpoints, not just present in a config file that's unused.
