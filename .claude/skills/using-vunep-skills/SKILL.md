---
name: using-vunep-skills
description: How Vunep's shared skill system works — the personal (Tier 1) vs team-shared (Tier 2, vunep/skills) split, how to install/update skills via npx skills, and how to add a new one. Use when setting up a new project's skills, when a teammate asks how the skill system works, or when adding/updating a skill in vunep/skills.
metadata:
  tags: meta, skills, team-process, documentation
---

## When to use

Load this when setting up `.claude/skills/` for a new or existing project, when explaining to a teammate how the skill system works, or when adding/editing a skill in `vunep/skills` itself.

## The two-tier split

**Tier 1 — personal, never committed into a project repo.** Lives at `~/.agents/skills/` (symlinked into `~/.claude/skills/`) on an individual's own machine. These are personal bootstrapping tools that fire once when a project is created and rarely again — [[nextjs-starter-reuse]], [[gh-cli-repo-setup]]. A teammate on a different machine doesn't need "how Marc likes to reuse his personal starter" baked into a shared client project.

**Tier 2 — team-shared, lives in `vunep/skills`, committed into every project.** Engineering standards that need to apply identically across the whole team, for the life of a project: git/PR workflow, code review, security defaults, architecture principles, testing strategy, domain modeling, and this meta-skill itself. The test: does this fire on *every* relevant task for the *life* of the project (Tier 2), or once at project creation (Tier 1)?

## Installing into a project

Run once at a project's root — works the same whether it's a brand-new project or an existing one just joining the system:

```bash
npx skills add vunep/skills --skill '*' -a claude-code -y
```

This writes every skill in `vunep/skills` into `.claude/skills/` in the current project, as real files — **commit them to git**. That's what makes this work: anyone who clones the repo afterward gets the identical skill set automatically, with zero manual setup, because Claude Code auto-loads whatever is in `.claude/skills/`.

`vunep/skills` is a **private** GitHub repo — `npx skills add` uses the same git/`gh` authentication already configured on the machine running it, so this only works for someone who actually has collaborator access. It is not public, and registering it with a third-party skills index was deliberately not done (see [[new-project-intake]]'s context on why).

A `skills-lock.json` file is written alongside `.claude/skills/`, tracking each skill's source and a content hash — commit this too. It's the lockfile-equivalent for skills: it records exactly what version of each skill is installed.

## Installing only specific skills

```bash
npx skills add vunep/skills --skill secure-api-defaults --skill testing-strategy -a claude-code
```

## Updating to the latest version

Re-run the same install command. It pulls whatever is currently in `vunep/skills` and overwrites the local copies (they're plain files, not symlinks, when installed this way into a project — see the `--copy`/default behavior in non-interactive mode).

## Adding or editing a skill

1. Clone `vunep/skills` (or pull if already cloned).
2. Add a new `skills/<name>/SKILL.md`, or edit an existing one — same format as every skill in the set: YAML frontmatter (`name`, `description`, `metadata.tags`), then a body written as a checklist, a concrete before/after pattern where applicable, and a "quick self-audit" closing section. Cross-reference related skills with `[[skill-name]]` links rather than duplicating their content.
3. Commit and push directly to `main` (small team, no PR process on this repo yet — revisit if the team grows past a size where that's still appropriate).
4. Update `vunep/skills/README.md`'s "what's in here" list if it's a new skill.
5. Re-run the install command in any project that should pick up the change — installed copies don't auto-update; they're refreshed by re-running `npx skills add`.

## Who has access

Currently: `vunep` (repo owner) and `clebertmarctyson` (collaborator, write access). Add future teammates the same way — `gh api repos/vunep/skills/collaborators/<username> -X PUT -f permission=push` from the `vunep` account, then have them accept the resulting invitation from their own account.

## Checklist

- [ ] A new skill is genuinely Tier 2 (applies repeatedly, team-wide) before it goes in `vunep/skills` — a one-off personal tool belongs in `~/.agents/skills/` instead, per the split above.
- [ ] New/edited skills follow the established format — frontmatter, checklist, pattern, quick self-audit — not a different shape.
- [ ] A project's `.claude/skills/` and `skills-lock.json` are actually committed to git, not left untracked or gitignored — check `.gitignore` doesn't blanket-exclude `.claude/` (a real gap found and fixed on `nextjs-starter` itself: `.claude/*` with an explicit `!.claude/skills/` carve-out is required).
- [ ] A skill update in `vunep/skills` gets re-installed into active projects that need it, not left to silently drift out of date.

## Quick self-audit

1. Does `.claude/skills/` in this project actually exist as committed files, or is it gitignored/untracked?
2. Does `skills-lock.json`'s content match what's currently in `vunep/skills`, or has the source drifted since the last install?
3. For any new skill being added: would a different, unrelated project also genuinely want this applied automatically? If not, it's Tier 1, not Tier 2.
