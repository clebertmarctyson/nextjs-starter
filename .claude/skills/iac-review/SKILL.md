---
name: iac-review
description: Review checklist for Terraform/Pulumi/CloudFormation changes — catches state-file risk, accidentally public resources, drift, and destructive plans before apply. Use whenever writing or reviewing infrastructure-as-code, before running `terraform apply`/`pulumi up`, or when setting up a new environment.
metadata:
  tags: security, iac, terraform, pulumi, devops, cloud
---

## When to use

Load this whenever writing/reviewing Terraform, Pulumi, or CloudFormation, and always before running `apply`/`up` against a shared or production environment.

## Checklist

**State file safety**
- [ ] State is stored remotely (S3+DynamoDB lock, Terraform Cloud, Pulumi Cloud) — never local `.tfstate` committed to git or left on one engineer's laptop as the source of truth.
- [ ] Remote state backend has locking enabled, so two concurrent applies can't corrupt state.
- [ ] State storage itself is encrypted and access-restricted (state files often contain secrets/outputs in plaintext).
- [ ] `.tfstate`, `.tfstate.backup`, and `*.tfvars` (if they hold secrets) are in `.gitignore`.

**No accidental public exposure**
- [ ] Storage buckets/blobs default to private; public access is an explicit, reviewed exception, not the resource default.
- [ ] Databases/caches (RDS, Redis, etc.) are not publicly accessible (`publicly_accessible = false`) and sit in a private subnet.
- [ ] Security groups/firewall rules don't default to `0.0.0.0/0` on anything but a public web server's 80/443 — SSH/DB/admin ports scoped to specific IPs or a bastion/VPN.
- [ ] New resources with default/example credentials (e.g. `admin`/`admin`) fail review outright.

**Plan review discipline**
- [ ] `plan`/`preview` output is actually read before `apply`, specifically scanning for `-/+` (destroy and recreate) on anything stateful (databases, volumes) — a recreate on a stateful resource means data loss.
- [ ] Destructive changes to production require a second reviewer, not a solo apply.
- [ ] Environments (dev/staging/prod) use separate state files and, ideally, separate cloud accounts/projects — a `terraform destroy` in the wrong workspace shouldn't be possible by a single wrong flag.

**Secrets in IaC**
- [ ] No hardcoded secrets in `.tf`/`.yaml` files — pulled from a secret manager (`aws_secretsmanager_secret`, GCP Secret Manager, Vault) or passed via CI secret injection, not committed as a variable default.
- [ ] Terraform outputs marked `sensitive = true` where they carry secrets, so they don't print to CI logs.

**Drift & reproducibility**
- [ ] No manual console changes to resources managed by IaC — drift gets reconciled through code, not by editing the console and hoping the next apply doesn't fight it.
- [ ] Modules are pinned to specific versions (not `>= 1.0` unbounded), so an upstream module update doesn't silently change behavior on the next apply.

## Pattern: least-exposure defaults

```hcl
# WRONG — public by default, reviewer has to notice and object
resource "aws_s3_bucket_public_access_block" "example" {
  bucket                  = aws_s3_bucket.example.id
  block_public_acls       = false
  block_public_policy     = false
}

# RIGHT — private by default; public access needs a deliberate, separate, reviewed resource
resource "aws_s3_bucket_public_access_block" "example" {
  bucket                  = aws_s3_bucket.example.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

## Quick self-audit before applying to a shared/prod environment

1. Run `plan`/`preview`, grep the output for `destroy` or `-/+` — confirm every one is expected, especially on databases/volumes/anything with data.
2. Confirm the backend config points at the correct environment's state (wrong workspace = risk of touching the wrong environment).
3. Search the diff for hardcoded strings that look like secrets, and for security-group/firewall rules opening to `0.0.0.0/0`.
4. If this is the first apply for a new environment: confirm remote state + locking is configured before anything else gets created.
