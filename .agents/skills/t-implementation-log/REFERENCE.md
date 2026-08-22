# Implementation Log — full reference

The complete format, worked examples, and edge cases behind
[SKILL.md](SKILL.md). Load this when you need the exact template or hit a case
the core workflow doesn't cover.

## Design intent (why each field exists)

The log serves three readers, and every rule traces to one of them:

| Reader | Needs | Field that serves it |
|---|---|---|
| An **auditing agent** | Verify the work was done and is correct | Command(s), Key output, Result/FAILED |
| The **human, later** | Revise what happened; learn the tooling | Command(s), Key output |
| The **human, learning** | Understand the model's conceptual thinking | **Reasoning** |
| **Anyone debugging a recurrence** | Compare this failure to a past one | **verbatim** FAILED stderr |

So: evidence over narration. Capture what carries a decision; link to artifacts
for the rest. Never paste a full dump — it buries the load-bearing line.

## File header template

```markdown
# NNN <commit subject>

Branch: <branch> | Started: <UTC timestamp> | Operators: <id>, <id>
```

## Step block — every field

```markdown
## HH:MM:SSZ YYYY-MM-DD | <identifier> | <action, one line>

**Reasoning:** <why this approach/command was chosen — the conceptual thinking.
1–3 lines. Name the alternative you rejected if it's instructive.>

**Command(s):**
​```bash
<exact command(s), verbatim — copy/pasteable>
​```

**Key output:** <only the load-bearing values: counts, rates, revisions, paths,
the test summary line. NOT the full output.>
​```
<the few lines that matter>
​```

**Result:** ok — <one-line meaning of the outcome for the task>
```

### Field rules

- **Reasoning is mandatory for substantive steps.** It is the field that lets a
  human learn *how the model thinks*, not just what it typed. For a trivial step
  (e.g. `mkdir`) one short clause is fine; for a design choice, explain the
  trade-off. Skip it only for purely mechanical steps where the action line is
  self-explanatory.
- **Key output is mandatory, not optional.** "ok" alone is acceptable only when
  a step genuinely produces no value (e.g. creating a directory). Anything that
  reports state — a query, an audit, a test run, a build — records the numbers
  that carry the decision.
- **Command(s) are verbatim and copy-pasteable.** A future reader reproduces the
  step from this field. Include the SQL/script body if that *is* the command.
- **Timestamps**: `date -u '+%H:%M:%SZ %Y-%m-%d'`, fresh per step, strictly
  increasing. No reusing one reading. No backfilling unless tagged.

## Failure block

Replace **Result** with **FAILED** and add **Fix/decision**:

```markdown
## 09:14:22Z 2026-06-13 | G55 | run alembic migration

**Reasoning:** Schema must be at head before ingesting, or upserts hit missing columns.

**Command(s):**
​```bash
poetry run alembic upgrade head
​```

**FAILED:** verbatim stderr (the lines that name the error):
​```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError)
  could not connect to server: Connection refused
  Is the server running on host "localhost" (127.0.0.1) and accepting
  TCP/IP connections on port 5432?
​```

**Fix/decision:** Postgres container was down. Proposed `make db-up` to TSZ
(below), re-ran `alembic upgrade head` → `INFO ... running upgrade -> 0010, head`. ok.
```

Paste the error **verbatim**. A paraphrase ("connection failed") destroys the
one thing this block is for: letting the next run compare "same failure, or new
one?"

## Human-in-the-loop (tmux) block

Some commands must not run inside the agent:

- **Git writes** — commit, push, branch, merge, rebase, reset, checkout, stash.
  The human owns git; the agent only drafts the commit message.
- **Credential / secret access** — auth logins, reading credential files,
  anything that prints tokens or keys.
- **Destructive / irreversible** — DB drops/restores, bulk deletes,
  force-pushes.

Pattern — propose, human runs, agent logs the result:

```markdown
## 09:20:01Z 2026-06-13 | G55 | [PROPOSED — TSZ tmux] start local Postgres

**Reasoning:** Migration failed because the DB container was down; this is a
state change to the local stack, so TSZ runs it.

**Command(s):**
​```bash
make db-up
​```
(awaiting TSZ)

## 09:21:40Z 2026-06-13 | G55 | local Postgres up (ran: TSZ tmux)

**Key output:**
​```
Container db  Started
​```

**Result:** ok — Postgres reachable on 5432; re-running the migration next.
```

## Lifecycle and naming

- Path: `docs/implementation-logs/<branch>/NNN_<slug>-log.md`.
- `NNN`: zero-padded, increments per branch. Find the next by listing the
  branch's log directory.
- `<slug>`: kebab-case of the commit subject; keep it short.
- The `-log` suffix is **mandatory**.
- One file per commit; the file ships **in** that commit.
- If `docs/implementation-logs/<branch>/` is absent, **confirm with the user,
  then create it** — this skill is meant to bootstrap repos new to the pattern.

## Identifier rules

- Every entry is attributed to an operator identifier (agent or human).
- If you start without one, **ask and confirm** before acting or logging.
- Identifiers are assigned by the human, not chosen by the agent. Never invent.
- Multiple operators may write to one file (e.g. an agent and the human, or two
  agents); each entry names whoever performed that step.

## Worked mini-example (top of a real file)

```markdown
# 001 resume and verify baseline

Branch: feature-x | Started: 07:18:50Z 2026-06-13 | Operators: G55, TSZ

## 07:18:50Z 2026-06-13 | G55 | snapshot current DB state

**Reasoning:** The plan assumes data is current; verify before trusting it.
Read-only inspection, safe to run myself.

**Command(s):**
​```bash
poetry run python scripts/inspect_db.py
​```

**Key output:**
​```
races: 412,003 rows | latest r_date 2026-04-08
results coverage: 96.1%
​```

**Result:** ok — data ends 2026-04-08, ~2 months stale; catch-up needed (next step).
```

## Capturing output from manual / tmux command runs

When a command runs in the human's shell (the tmux-handoff rule above), capture
its full output to a **gitignored run-logs directory** so the agent can read it
without the human pasting large output — and so a reboot doesn't lose it
(`/tmp` is wiped on reboot and is often outside the agent's readable workspace).

- **Location:** `.run-logs/<branch>/` at the repo root, **gitignored**. These are
  transient raw captures, *not committed* — the committed implementation log
  holds the extracted Key output.
- **Name** each capture with a per-step counter within the work package:
  `<NN>_<step>.log` — `001_backup_dryrun`, `002_backup`, `003_sync_dryrun`, …
  The counter is independent of the impl-log *file's* number. The **executor
  proposes the exact command including this path**, and the human runs it
  **verbatim**, so the filename always matches the impl-log entry that awaits it.
- **Pattern** — preserves the *command's* exit code (via `pipefail`), not `tee`'s:

```bash
mkdir -p .run-logs/<branch>
log=.run-logs/<branch>/<NNN>_<step>.log
bash -o pipefail -c "<command> 2>&1 | tee '$log'"; echo "exit=$?" | tee -a "$log"
```

- **Credentials are preserved.** Profile/ADC selectors (e.g. gcloud
  `CLOUDSDK_CONFIG`) are environment variables, inherited by the `bash -c`
  subshell — the wrapper does not change which account/project is used.
- The agent reads `.run-logs/<branch>/<NNN>_<step>.log`, writes the load-bearing
  lines into the impl log as **Key output**, and may discard the raw file.

Add `.run-logs/` to the repo's `.gitignore` once per repo.
