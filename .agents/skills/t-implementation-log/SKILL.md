---
name: t-implementation-log
description: Keep a structured, auditable implementation log while doing work, for any role (executor, auditor, planner, or other). One log file per commit; one structured block per step capturing the exact command, its key output, the result or verbatim error, AND the reasoning behind the choice. Use when the user asks to "keep an implementation log", "log this work", "log my interactions", "work with logged interactions", set up logged execution, asks an agent to work under an audit trail, or names this skill (also by its legacy name implementation-log).
---

# t-implementation-log

Binds: git-policy (the human commits; §"Commands you must not run" below is
the autonomy contract), comprehension (the log is evidence a human can
defend), coding-explanation (Reasoning lines teach at the moment of use).
Model-neutral: any agent loads this file directly and follows it.

Keep a timeline log of your work that a **different agent can audit** and a
**human can learn from** — not just *what* ran, but *what it produced* and *why
you chose it*. The log is evidence, not narration.

Why this exists: the reader (an auditor, or the human, weeks later) must be able
to (1) revise what was done, (2) learn which commands are used and what they
return, and (3) follow the conceptual thinking behind each step. Verbatim errors
let failures be compared across runs.

This skill is self-contained — it carries its own format and needs no other repo
file. Read [REFERENCE.md](REFERENCE.md) for the full block template, worked
examples, and edge cases.

## Startup checks — do these BEFORE any work or logging

1. **Identifier.** Every log entry is attributed to an operator identifier (a
   short handle, e.g. `OF5`, `G55`, `CO48`, `TSZ`). **If you have not been given
   one, ask the user and confirm it before acting or logging. Never invent one.**
2. **Branch & folder.** Determine the current branch. The log lives at
   `docs/implementation-logs/<branch>/NNN_<slug>-log.md`:
   - `NNN` = zero-padded sequence per branch (`001`, `002`, …).
   - `<slug>` = kebab-case of the commit subject.
   - The **`-log` suffix is mandatory** so a log-only file is identifiable.
   - **If `docs/implementation-logs/<branch>/` does not exist, confirm with the
     user, then create it.** Do not assume a repo has used this pattern before.
3. **One file per commit.** Start a fresh file when work toward a new commit
   starts. The file is included in the commit it documents.
4. **Open the file** with the header (see template) before the first step.

## The logging loop — log as you go, never in a batch at the end

For every substantive step, immediately after its command(s) run:

1. Get a **fresh timestamp**: `date -u '+%H:%M:%SZ %Y-%m-%d'`. Use that exact
   value. Never reuse one reading across steps; timestamps must strictly
   increase. Backfilling is forbidden — if genuinely unavoidable (crash
   recovery), tag the header `[BACKFILLED]` and say why.
2. Append a **structured block** with these fields (full spec in REFERENCE.md):

   ```markdown
   ## HH:MM:SSZ YYYY-MM-DD | <identifier> | <action, one line>

   **Reasoning:** <why this approach/command — the conceptual thinking, 1–3 lines>

   **Command(s):**
   ​```bash
   <exact command(s), verbatim>
   ​```

   **Key output:** <load-bearing values only — counts, rates, paths, the
   summary line — NEVER the full dump>

   **Result:** ok — <one-line meaning>
   ```

3. **On failure**, replace **Result** with **FAILED** carrying the *verbatim*
   stderr (the lines that name the error, copied exactly, never paraphrased),
   then **Fix/decision:** what you changed and the re-run outcome.

## Commands you must not run yourself (human-in-the-loop)

Git **writes** (the human commits — agents never write git), credential/secret
access, and destructive/irreversible operations must run in the human's shell.
For those: write the step tagged `[PROPOSED — <human> tmux]` with the exact
command and stop; the human runs it; you read the output and append the
**Key output / Result / FAILED** fields tagged `(ran: <human> tmux)`.

## Closing the file

End the file with the drafted commit message — **you draft it, the human runs
`git commit`**:

```markdown
## Concluding commit message

<subject>

What:
- <functionality delivered>

Why:
- <the reason / gap closed>

Verified:
- <evidence: which checks passed, with the numbers>
```

`Verified:` claims must trace to **Key output** captured above — an auditor
rejects a "Verified" line no logged output supports.

## Self-check before you finish

- Identifier confirmed; folder created/confirmed if it was missing.
- Every step has Reasoning, Command(s), Key output, and Result/FAILED.
- Timestamps are real and strictly increasing; no untagged backfill.
- Errors are verbatim, not summarised.
- No git writes were performed by the agent.
