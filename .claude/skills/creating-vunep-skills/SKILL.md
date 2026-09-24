---
name: creating-vunep-skills
description: The end-to-end procedure for whenever a new skill is requested — decide if it's actually worth creating (not a duplicate, not a one-off task), decide Tier 1 vs Tier 2, write it, sync it to the right place (vunep/skills via git for Tier 2, ~/.agents/skills locally for Tier 1), and for Tier 2 install it back via npx skills add so the requesting machine is actually synced, not just told it's done. Use whenever asked to create a new skill, or when a repeated task pattern looks like it should become one.
metadata:
  tags: meta, skills, team-process, automation
---

## When to use

Load this whenever a new skill is explicitly requested, or when a task is being repeated often enough that it looks like it should become a skill rather than being re-explained each time.

## Step 1 — Decide if it's actually worth creating

Don't create a skill just because one was asked for — check first:

- **Does an existing skill already cover this?** Search both Tier 1 (`~/.agents/skills/`) and Tier 2 (the current contents of `vunep/skills`) by topic, not just by exact name match — a differently-named skill can still cover the same ground. If there's real overlap, extend/edit the existing skill instead of creating a near-duplicate — this is [[modularity-dry-judgment]] applied to the skill system itself.
- **Is this durable, reusable knowledge, or a one-off task?** A skill is for something that will come up again — a convention, a checklist, a recurring pattern. "Fix this specific bug" or "write this one component" is a task, not a skill, no matter how it's phrased. If genuinely unsure whether something recurs enough to earn a skill, ask rather than assume — creating skill clutter has a real cost (a longer, noisier skill listing every session has to scan).
- **Is the scope narrow enough?** One topic per skill, per the same discipline used across the whole set (see e.g. how `architecture-*` and `modularity-*` are split rather than one giant "good code" skill). If the request is actually two or three distinct things, that's two or three skills, not one broad one.

If the answer to "does this deserve a new skill" is no, say so and explain why (points at the existing skill, or explains why it's a one-off) instead of creating something redundant.

## Step 2 — Decide the tier

- **Tier 1 (personal, `~/.agents/skills/`, symlinked to `~/.claude/skills/`, never committed to a project repo)**: fires once at project setup/bootstrap and rarely again, or is specific to this one person's own tooling/workflow across their own projects — e.g. [[nextjs-starter-reuse]], [[gh-cli-repo-setup]].
- **Tier 2 (team-shared, `vunep/skills`)**: fires repeatedly across the life of a project, and any teammate's agent should apply it the same way — the large majority of what's in this skill set.

The test: would a different, unrelated project or a different team member also genuinely want this applied automatically? If yes, Tier 2. If it's really just this person's own repeated setup habit, Tier 1.

## Step 3 — Write the skill

Same format as every skill in the set — no exceptions:

```markdown
---
name: kebab-case-name
description: One or two sentences — what it covers and a clear "Use when..." trigger. This is what the auto-load matching runs against, so be specific.
metadata:
  tags: comma, separated, topic, tags
---

## When to use
...

## Checklist
- [ ] ...

## Pattern (or similar concrete section — before/after code, a template, an example)
...

## Quick self-audit
1. ...
```

Cross-reference related existing skills with `[[skill-name]]` links rather than repeating their content.

## Step 4 — Sync it to the right place

**Tier 2** — never write directly into `~/.agents/skills/` or `~/.claude/skills/` first. The source of truth is the git repo:

```bash
cd <clone of vunep/skills>          # pull latest first if it already exists locally
mkdir -p skills/<name>
# write skills/<name>/SKILL.md
git add -A
git commit -m "Add <name> skill"
git push origin main
```

Confirm `gh auth status` shows the account with write access to `vunep/skills` active before pushing — switch with `gh auth switch --hostname github.com --user <account>` if needed.

**Tier 1** — write directly:

```bash
mkdir -p ~/.agents/skills/<name>
# write ~/.agents/skills/<name>/SKILL.md
ln -sf ../../.agents/skills/<name> ~/.claude/skills/<name>
```

No GitHub sync for Tier 1 — it's single-user, single-machine by design, there's no sync partner to keep in step with.

## Step 5 — Install it back locally (Tier 2 only) — this is the step that actually syncs the machine

Writing to `vunep/skills` isn't the finish line — the whole point is the requesting machine (and every project on it that wants it) actually has the skill installed, the same way a teammate would get it:

```bash
cd <any project that should have it, e.g. nextjs-starter>
npx skills add vunep/skills --skill <name> -a claude-code -y
```

Never hand-copy the new skill directly into a project's `.claude/skills/` — always go through this install step, so the same path a teammate would use is the one actually exercised and proven working (see [[favicon-icon-suite]]'s skill for why this discipline matters — it's how a broken sync gets caught immediately instead of only when someone else tries it).

Commit and push the resulting `.claude/skills/<name>/` + updated `skills-lock.json` in that project, same as any other skill install.

## Step 6 — Verify and report back

- Confirm the skill exists in `vunep/skills` on GitHub (`gh repo view vunep/skills` or check the commit landed).
- Confirm the install step actually added exactly the new skill directory locally, nothing else changed.
- Tell the user plainly: created (with tier), or not created (with the reason — duplicate of X, or not durable enough to be a skill) — don't silently skip either outcome.

## Checklist

- [ ] Checked for an existing overlapping skill before writing anything new.
- [ ] Confirmed this is durable/reusable, not a one-off task being mistaken for a skill.
- [ ] Tier decided using the "would an unrelated project/teammate also want this automatically" test.
- [ ] Written skill follows the standard format (frontmatter, checklist, concrete pattern, quick self-audit).
- [ ] Tier 2 skills are written into a `vunep/skills` clone and pushed — never created directly on the local machine first.
- [ ] Tier 2 skills are installed back via `npx skills add`, not hand-copied, and that install is committed in the target project.
- [ ] The user is told the actual outcome (created + tier, or explicitly not created + why).

## Quick self-audit

1. Could this new skill's content be reasonably merged into an existing one instead of standing alone? If so, was that actually considered, or skipped?
2. Does `git log` on `vunep/skills` show this skill's commit before any local `.claude/skills/` copy was created?
3. Does the target project's `skills-lock.json` reflect the new skill as installed from `vunep/skills`, confirming the sync round-trip actually completed?
