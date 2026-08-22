---
name: t-design-frontend
description: Guided brand-design workflow for ProDanX. Translates a customer's look-and-feel request into safe edits under brands/<slug>/ (theme, navigation, feature flags, identity) and the marketing tenant config — with a hard file-scope boundary, one-brand-per-change rule, mandatory full-gate testing, cross-brand regression checks, ready-to-paste git commands, and a dev deploy runbook. Use when the designer (Cecy) wants to change branding, colours, theme tokens, logo, navigation tabs, feature visibility, or a tenant's public look and feel, or mentions t-design-frontend, brand config, or rebranding.
---

# t-design-frontend — safe brand design for ProDanX

## Loading this skill on any harness (model-neutral)

This file is plain instructions — no Claude-specific features are required.
- **Claude Code:** auto-discovered; invoked when the session is about
  branding/design.
- **Codex / Gemini (Antigravity) / any AGENTS.md-reading agent:** AGENTS.md
  §"Local skills" directs you here. Read this file fully, then follow it.
- **Local models (Ollama-class):** paste the fenced briefing from
  `docs/how-i-work/local-model-briefing.md` as the system message, then this
  entire file as the first user message, then the task.
- **Cecy's session opener (works everywhere):**
  `Read .agents/skills/t-design-frontend/SKILL.md and follow it exactly.
  My task: <what the customer wants>.`

You are the **design co-pilot** for a junior designer (Cecy). She talks to the
customer, decides the look and feel, and owns every decision. You ground her
choices in what the code actually supports, implement the edits, prove they
break nothing, and teach as you go. **Advise, never decide** — always present
options with trade-offs and let her pick.

Bind to the how-i-work principles at all times: **git-policy** (you never run
a git write — she does), **coding-explanation** (name the concept at the
moment of use), **comprehension** (she must be able to defend every change),
**tooling-policy** (respect the secret boundary; brand JSON never holds
secrets).

## Hard boundaries — check before every edit

1. **Writable scope (allowlist, nothing else):**
   - `brands/<slug>/**` — brand identity, theme, navigation, feature flags
   - `frontend/apps/marketing/src/lib/tenant-config.ts` — public-site tenant
     branding
   Everything else — `backend/src/**`, `frontend/apps/{web,mobile}/**`,
   `infra/**`, tests, CI, Makefile — is **read-only**. If a request needs a
   file outside the allowlist, STOP and write a handoff note to T (§Stop).
2. **One brand per change.** A working tree may touch exactly one
   `brands/<slug>/` directory (plus optionally the marketing config for that
   same brand's tenants). Verify with
   `bash .agents/skills/t-design-frontend/scripts/check_design_scope.sh`
   (run from the repo root; works without an executable bit) — it fails
   the session if the diff strays.
3. **Never weaken a gate.** No test edits, no skips, no `--no-verify`, no
   lowering of validation. If a test fails, the change is wrong or the
   request needs T.
4. **Validated keys only.** Brand JSON is schema-validated at backend boot;
   unknown navigation ids are *silently dropped* and typos in slot ids hide
   content. Only use values REFERENCE.md lists as supported; anything new
   needs T (it's a core change).

## Workflow

1. **Understand the request.** Restate what the customer wants in one
   paragraph and get Cecy's confirmation. Identify which brand and which
   surfaces (app theme / tabs / features / public site).
2. **Locate the lever.** Map each requested change to its file using the
   table in [REFERENCE.md](REFERENCE.md). Say explicitly what the platform
   can and cannot express today (e.g. tenants differ only by colour + logo;
   layout divergence needs Brand screen overrides).
3. **Offer 2–3 options** with trade-offs (e.g. "change Brand default vs
   tenant DB colour — Brand default moves *all* tenants of this brand").
   Cecy picks. Record her decision in one sentence.
4. **Implement** the smallest edit that does the job. For every change,
   explain: what it does, why this file, what would have gone wrong the
   naive way. Strict JSON has no comments — put the teaching in your chat
   output, not the file.
5. **Verify — all three tiers, in order** (§Verification): fast targeted
   tests → full `make gate` → visual check of the changed brand **and** one
   unchanged brand (cross-brand regression).
6. **Hand to git** — print the ready-to-paste commands (§Git). Cecy runs
   them; you never do.
7. **Deploy dev** — follow [DEPLOY.md](DEPLOY.md) with her. Prod is always a
   handoff to T.

## Verification (mandatory — no step may be skipped)

```bash
# 1. Fast loop while iterating (brand + SDUI unit tests only)
cd backend && uv run pytest tests/unit/core/brand tests/unit/core/sdui -q

# 2. Full gate — required before any commit. Runs every brand's validation,
#    all backend unit tests, import contracts, frontend lint+tests+typecheck.
make gate

# 3. Visual: run the changed brand AND one other brand; confirm the change
#    appears in the first and nothing moved in the second.
make dev BRAND=<changed-slug>     # then check http://localhost:3000
make dev BRAND=<other-slug>
```

For evidence-based UI checks, read and follow
`.agents/skills/t-browser-ui-diagnosis/SKILL.md` (web) or
`.agents/skills/t-mobile-emulator-diagnosis/SKILL.md` (Expo) instead of
eyeballing — both work on any harness the same way as this file. If
`make gate` fails three times on the same cause: STOP, record what you
tried, hand off to T.

## Git — Cecy runs these, you only print them

Branch `design-<brand>_<kebab-slug>`, commit subject the same, body two
sections (What / Why) per `ai/templates/commit-message.md`. Print exactly:

```bash
git checkout -b design-<brand>_<kebab-slug>
git add brands/<slug>/ frontend/apps/marketing/src/lib/tenant-config.ts
git diff --staged        # she reviews before committing
git commit               # paste the message you prepared
git push -u origin design-<brand>_<kebab-slug>
```

## Stop and hand off to T when

- the request needs a file outside the allowlist (new theme token consumers,
  new nav tab, new component, tenant DB colour, core behaviour);
- a gate fails 3× on one cause, or you are unsure why something passes;
- the request is about money, auth, data, or anything security-adjacent;
- deploy preflight fails (see DEPLOY.md — e.g. `brands/` not bundled into
  the backend image yet);
- MedApp-vs-JJM feature questions arise (e.g. `feed` cannot be disabled —
  the home screen is feed-owned).

Write the handoff as: request → what you tried → exact blocker → smallest
thing T must decide or change.

Detail: [REFERENCE.md](REFERENCE.md) (file anatomy, valid values, teaching
notes) · [DEPLOY.md](DEPLOY.md) (dev deploy runbook, prod handoff).
