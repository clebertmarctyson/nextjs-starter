---
name: cloud-iam-least-privilege
description: Catches overly broad IAM policies, service roles, and cloud permissions before they ship. Use whenever creating or reviewing an IAM role/policy, a service account, a Terraform/Pulumi resource with an attached role, or any cloud credential (AWS/GCP/Azure) for an app, CI pipeline, or third-party integration.
metadata:
  tags: security, cloud, iam, aws, gcp, azure, devops
---

## When to use

Load this whenever writing or reviewing: an IAM policy/role (AWS), a service account + IAM binding (GCP), a managed identity/role assignment (Azure), CI/CD pipeline credentials, or any `AdministratorAccess`/`Owner`/`*`-scoped permission grant.

## The failure mode this prevents

The most common cloud breach amplifier isn't the initial compromise — it's that the compromised credential (a leaked CI token, an exploited app server, a phished dev laptop) had far more access than the thing it was attached to actually needed. A leaked S3-read-only key is an incident; a leaked key with `iam:*` or `AdministratorAccess` is a full account takeover.

## Checklist

- [ ] **No wildcard actions** (`"Action": "*"`, `roles/owner`, `Contributor` at subscription scope) on anything except a human break-glass account that's itself gated behind MFA + approval.
- [ ] **No wildcard resources** (`"Resource": "*"`) when the action touches data — scope to the specific bucket/table/queue ARN, not the whole account.
- [ ] **Service accounts/roles are single-purpose.** The Lambda that resizes images gets S3 read/write on *that bucket* — not S3 full access, not access to unrelated buckets "in case it's needed later."
- [ ] **CI/CD credentials are scoped to what that pipeline deploys.** A pipeline deploying a static site to one S3 bucket + CloudFront distribution should not also be able to modify IAM, VPCs, or unrelated services.
- [ ] **No long-lived static credentials where short-lived/federated ones work.** Prefer OIDC federation (GitHub Actions → AWS role assumption) over a static `AWS_ACCESS_KEY_ID` secret sitting in CI config.
- [ ] **Cross-account/cross-project access is explicit and audited**, not a broad trust policy that lets any principal in an org assume the role.
- [ ] **Human IAM users have MFA enforced**; break-glass/admin access requires it, no exceptions for "just this once."
- [ ] **Unused permissions get trimmed.** After a service has run for a while, check access-advisor / IAM Access Analyzer (AWS) or Policy Analyzer (GCP) for granted-but-unused permissions and remove them.

## Pattern: scope to resource, not service

```json
// WRONG — any Lambda with this role can touch every bucket in the account
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}

// RIGHT — scoped to exactly what this function does, on exactly its bucket
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::example-app-uploads/*"
}
```

GCP equivalent: bind a **custom role** with only the needed permissions to the service account on the specific resource, rather than granting `roles/editor` or `roles/owner` at the project level.

## Pattern: OIDC federation instead of static keys (GitHub Actions → AWS example)

```yaml
permissions:
  id-token: write   # required for OIDC
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::ACCOUNT_ID:role/ci-deploy-role
      aws-region: us-east-1
```

The assumed role's trust policy restricts *which* repo/branch can assume it, and the role itself carries only deploy-scoped permissions — no static secret to leak in the first place.

## Quick self-audit before a client handoff or prod deploy

1. For every service account/role in the project, ask: "if this credential leaked today, what's the blast radius?" If the answer is "the whole account," it's too broad.
2. Search IaC/console for `*` in `Action`, `Resource`, or role names like `Owner`/`Admin`/`Editor` attached to non-human principals.
3. Confirm CI/CD uses federated/short-lived credentials where the provider supports it (GitHub/GitLab OIDC → AWS/GCP/Azure).
4. Run the cloud provider's built-in unused-permissions report if the account has run long enough to have signal, and trim.
