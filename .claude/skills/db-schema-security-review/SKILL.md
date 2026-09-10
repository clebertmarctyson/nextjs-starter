---
name: db-schema-security-review
description: Checks new database migrations and schema designs for missing encryption on sensitive fields, PII stored in plaintext, missing row-level security/tenant scoping, and weak indexing that leaks data via timing. Use whenever writing a migration, designing a new table, or adding a column that stores personal, financial, or credential data.
metadata:
  tags: security, database, schema, migrations, pii
---

## When to use

Load this whenever creating a migration, designing a new table, or adding a column — especially one holding email, name, address, phone, payment info, government ID, health data, auth tokens/secrets, or anything tied to an individual.

## Checklist

**Sensitive data at rest**
- [ ] Highly sensitive fields (SSN/government ID, payment details, health data) are encrypted at the column level (app-layer encryption or pgcrypto/KMS-backed), not relying on disk-level encryption alone — disk encryption protects against stolen drives, not against a SQL injection or leaked read replica.
- [ ] Auth secrets (passwords, API keys, tokens) are hashed (passwords) or encrypted (tokens/keys) — never stored plaintext, never just base64.
- [ ] PII columns are identified and documented (a `-- PII` comment or a data-classification doc) so a future migration doesn't accidentally expose them via a careless `SELECT *` in an API response or export.

**Multi-tenant / row-level isolation**
- [ ] Every tenant-scoped table has a `tenant_id`/`org_id` column, and it's `NOT NULL`.
- [ ] Row-level security (Postgres `RLS`) or an equivalent app-layer guard enforces tenant scoping at the query layer, not just "the app always remembers to add WHERE tenant_id = ?" — a single forgotten WHERE clause in one endpoint becomes a cross-tenant data leak.
- [ ] Foreign keys between tenant-scoped tables are validated to belong to the same tenant, not just any valid ID (an attacker guessing a valid `invoice_id` from another tenant shouldn't be able to attach it to their own order).

**Access & least privilege at the DB layer**
- [ ] The application's DB user has only the permissions it needs (no `DROP`/`ALTER` from the runtime app connection — migrations run under a separate, more privileged user/pipeline).
- [ ] Read replicas or analytics/BI connections use a read-only user, never the app's read-write credential.
- [ ] Backups are encrypted and access-restricted the same as production data — a backup is a full copy of everything sensitive in the primary.

**Indexing & metadata leaks**
- [ ] No sensitive value (raw email, token, SSN) used as a primary key or exposed in a URL-visible ID — use a surrogate key (UUID) instead so IDs aren't guessable/enumerable.
- [ ] Sequential integer IDs on sensitive resources are avoided or paired with an authorization check, since sequential IDs let an attacker enumerate `/invoices/1001`, `/invoices/1002`, etc.
- [ ] `created_at`/`updated_at` on sensitive tables where audit trail matters; consider an append-only audit log table for financial/compliance-relevant mutations.

**Deletion & retention**
- [ ] A path exists to actually delete/anonymize a user's PII on request (GDPR/CCPA right-to-erasure) — check whether soft-delete (`deleted_at`) alone satisfies this, or whether hard deletion/anonymization of PII fields is required.
- [ ] Cascading deletes are deliberate — deleting a user shouldn't silently orphan financial records that must be retained for compliance, but also shouldn't leave PII behind that should've been purged.

## Pattern: Postgres row-level security for tenant isolation

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

The app sets `app.current_tenant` once per request/connection; even a bug that forgets a `WHERE tenant_id = ?` clause can't leak cross-tenant rows, because the database itself enforces it.

## Pattern: encrypting a sensitive column (app-layer, KMS-backed)

```sql
-- store ciphertext, never the raw value
ALTER TABLE users ADD COLUMN ssn_encrypted bytea;
```

Encrypt/decrypt in the application layer using a KMS-backed key (AWS KMS, GCP KMS, Vault transit) — so the database itself never holds a usable plaintext value or the key to unlock it, and a DB-only breach doesn't expose the sensitive field.

## Quick self-audit before a client handoff or prod deploy

1. Grep the schema for columns named/likely to hold `ssn`, `dob`, `password`, `token`, `card`, `email`, `phone`, `address` — confirm each has an encryption/hashing story or a documented reason it doesn't need one.
2. For every tenant-scoped table, confirm RLS is enabled or the app-layer equivalent is enforced everywhere, not just in the "main" query path.
3. Try to fetch another tenant's resource by guessing/incrementing an ID as an authenticated user of a different tenant — confirm it's rejected.
4. Confirm the app's runtime DB credential can't run `DROP TABLE` or `ALTER TABLE`.
