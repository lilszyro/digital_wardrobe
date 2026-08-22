<!-- .agents/skills/t-design-frontend/REFERENCE.md -->
# t-design-frontend — reference

What each brand file controls, which values are valid, and what to teach at
the moment of use. The backend validates all of this at boot
(`backend/src/core/brand/loader.py`, schemas in
`backend/src/core/brand/schemas.py`); a bad file **stops the app starting**,
which is why the gate must be green before any commit.

## Where look-and-feel lives (the levers)

| Customer asks for… | Edit | Notes |
|---|---|---|
| App colours / fonts (whole brand) | `brands/<slug>/theme.json` | Affects every tenant of the brand |
| One tenant's colour/logo only | tenant DB row | **Not file-editable — handoff to T** |
| Which tabs, their order, labels | `brands/<slug>/navigation.json` | Selection from plugin-declared tabs |
| Hide a whole feature (screens+tabs+perms) | `brands/<slug>/brand.config.json` | Subtractive flags |
| App name, bundle ids, domain | `brands/<slug>/brand.json` | Store identity — coordinate with T |
| Public marketing page text/colours | `frontend/apps/marketing/src/lib/tenant-config.ts` | Per-tenant slugs must match backend |
| Screen layout (reorder/hide sections) | `brands/<slug>/screens/*.json` | **Not loaded yet (slice s9)** — handoff |

Theme cascade (teach this): **Platform → Brand → Tenant**. Platform defaults
live in `backend/src/core/sdui/platform_theme.json`; the Brand file overrides
them; the tenant DB row overrides only `primary_color` and `logo_url`. So a
Brand edit is the *default* for all its tenants, not a per-tenant override.

## brands/<slug>/brand.json — identity (required)

```json
{
  "slug": "dan-jjm",            // MUST equal the directory name (boot check)
  "display_name": "Dan JJM",
  "ios_bundle_id": "",           // store identity — owner: T
  "android_package": "com.danjjm.app",
  "domain": "danjjm.local"
}
```
Changing identity fields affects store packaging — treat as T-coordinated.

## brands/<slug>/theme.json — theme (required)

```json
{
  "primary_color": "#0f766e",
  "logo_url": null,
  "theme_tokens": {
    "color.primary": "#0f766e",
    "color.accent": "#f97316",
    "font.body": "Inter"
  }
}
```
- Colours are hex strings. Keep `primary_color` and `color.primary` in sync.
- **Known consumed tokens today:** `color.primary`, `color.accent`,
  `font.body`. Adding a *new* token key validates fine but **does nothing**
  until a frontend component consumes it — that's a core change (handoff).
  Teach: config is only half a feature; the consumer is the other half.
- Accessibility: check contrast of `color.primary` on white and on itself as
  a button with white text (aim ≥ 4.5:1 for text). Offer Cecy a compliant
  alternative when the customer's pick fails.

## brands/<slug>/navigation.json — tab selection (optional)

```json
{ "tabs": [ { "id": "home" }, { "id": "feed", "title": "Updates" } ] }
```
- Semantics: **selection + order + relabel** over the tabs plugins declare.
  Valid ids today: `home`, `curriculum`, `feed`, `timetable`, `messages`.
- An unknown id is **skipped with only a backend log warning** — a typo
  silently drops a tab. Always verify visually after editing.
- Omitting the file = all declared tabs in default order. Omitting a tab
  hides it (users can still reach feature screens by other links unless the
  feature is flag-disabled — teach the difference: nav is *visibility*,
  flags are *capability*).
- `title` relabels; `icon` accepts an icon key (mobile currently maps a
  fixed set — check `frontend/apps/mobile/app/(app)/_layout.tsx` ICON_MAP).

## brands/<slug>/brand.config.json — feature flags (optional)

```json
{ "features": { "curriculum": false, "booking": false } }
```
- Default is **on**; flags are **subtractive only** (they can never grant).
  Disabling `x` removes: its nav tabs, its `x.*` capabilities, and its
  screens (which then 404 exactly like screens that never existed —
  fail-closed, nothing to probe).
- Known namespaces: `curriculum`, `booking`, `feed`, `communicator`.
- **`feed` cannot be disabled** — the home screen is feed-owned; the config
  is rejected at boot. Handoff if a brand genuinely needs no feed.
- Missing file = everything enabled (dan-jjm today). If Cecy edits flags,
  prefer creating an explicit file over relying on defaults — auditability.

## frontend/apps/marketing/src/lib/tenant-config.ts

Typed, code-first public-site branding keyed by tenant slug. Rules:
- `slug` values MUST match backend tenant slugs (they key the public API).
- Keep the file's existing shape (`TenantBrand` interface); TypeScript strict
  + `make gate` (frontend typecheck/tests) guard it.
- 80-col lines, `// filepath` first-line comment stays, `readonly` stays.
- This file is duplicated truth (colours also exist in DB/theme.json) — flag
  divergence to Cecy when you see it, and keep values consistent within the
  change.

## How cross-brand safety works (teach once per session)

1. `tests/unit/core/brand/test_all_brands_validate.py` loads **every**
   `brands/<slug>/` dir — a broken brand fails the gate even if untouched.
2. Builder/navigation/theme unit tests pin dan-jjm vs medapp divergence.
3. Each brand deploys as its own Cell (own backend, DB, project), so runtime
   blast radius is per-brand — but a config error is a *boot* error, which
   is why the gate + a local boot (`make dev BRAND=…`) must both pass.
4. The scope guard (`scripts/check_design_scope.sh`) keeps a change to one
   brand so review and rollback stay trivial.

## Quick smoke without a browser

```bash
# Backend up via `make dev BRAND=<slug>`; then:
curl -s http://localhost:8000/health/ready
make token   # dev-seeded login; then call the manifest with the token to
             # inspect navigation[] and theme values as the app receives them
```
