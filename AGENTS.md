# AGENTS.md — CPU Lab project instructions

This file is project law for every agent working in this repository. Read it together with `DESIGN.md` before changing anything.

## What this project is

CPU Lab is a standalone, browser-based CPU scheduling visualiser for an Operating Systems course: a single page with an interactive workbench (process queue + algorithm selection), an animated Gantt chart, performance metrics, a process results table, an algorithm comparison chart, and a short learning section. It is plain HTML/CSS/JavaScript — no framework, no build step, no server.

**Current mission: redesign the page into the "Dispatch" design language defined in `DESIGN.md`** — a light, near-monochrome, instrument-grade look (paper, ink, one signal red) that reads as a deliberate schedule board rather than a generated dashboard. `DESIGN.md` is the single source of truth for every visual decision; it wins over skill suggestions, tool output, or personal habit.

## Files

| File | Role |
|---|---|
| `index.html` | Structure + inline SVG sprite + document metadata |
| `styles.css` | All styling; organized in labelled zones (see ownership map) |
| `app.js` | All behaviour; scheduling logic is frozen (see constraints) |
| `DESIGN.md` | The design language: tokens, components, bans, acceptance checklist |
| `AGENTS.md` | This file: process, workflow, ownership, quality gates |
| `README.md` | Human-facing usage notes |
| `.agents/skills/` | Installed design skills (read-only) |
| `.opencode/agents/` | The agent roster (read-only) |

## Hard constraints

1. **Behaviour parity.** The six algorithms and their results, deterministic tie-breaking, playback, comparison, CSV export, validation rules (arrival ≥ 0 integer, burst ≥ 1 integer, priority ≥ 0 integer, unique IDs, ≤ 30 processes, positive integer quantum for RR) must not change. Presentation may improve (inline error surfacing, announcements); logic may not.
2. **Three files + docs.** Keep `index.html`, `styles.css`, `app.js` as the app. No new app files.
3. **No dependencies.** No frameworks, libraries, icon packages, or CDNs. The only external asset stays the Google Fonts stylesheet, and the page must remain fully usable offline via fallback stacks.
4. **Runs by double-click.** Opening `index.html` in a browser must keep working. Keep relative paths.
5. **No generated-content inventions.** No fake stats, fake version stamps, fake social proof, or decorative meta (times, coordinates, versions). Real content only.
6. **Accessibility is a floor, not a feature.** See `DESIGN.md` §Accessibility.

## Commands

PowerShell on Windows — use `;` not `&&` / `||`.

```powershell
# Serve locally (then open http://localhost:8787/)
python -m http.server 8787

# Syntax check the script
node --check app.js

# Taste skill checks (run from project root, while the server is up for inspect)
node .agents/skills/design-taste-frontend/scripts/lint.mjs --app index.html styles.css app.js
node .agents/skills/design-taste-frontend/scripts/inspect.mjs --app http://localhost:8787/
```

## The agent roster

| Agent | Mode | Purpose |
|---|---|---|
| `design-orchestrator` | primary (default) | Plans, delegates, integrates, runs the verification loop |
| `design-director` | subagent | Direction memo; final holistic review. Advisory, no edits |
| `layout-specialist` | subagent | Shell, grid, spacing, rhythm, responsive |
| `color-specialist` | subagent | Tokens, palette, contrast, state colors |
| `typography-specialist` | subagent | Fonts, type scale, figures, casing |
| `icon-specialist` | subagent | Inline SVG set, brand mark, glyph removal |
| `interaction-specialist` | subagent | States, forms, feedback, UX copy |
| `motion-specialist` | subagent | Transitions, playback motion, reduced motion |
| `accessibility-specialist` | subagent | WCAG, semantics, keyboard, ARIA |
| `design-verifier` | subagent | Adversarial verification vs DESIGN.md. No edits |

## Standard redesign workflow

1. **Recon** — read `DESIGN.md`, `AGENTS.md`, and all three source files; confirm the behaviour baseline.
2. **Direction memo** — `design-director` produces the section-by-section composition plan (Mode A).
3. **Implement** — run writers **one at a time**, in this order: `layout-specialist` → `color-specialist` → `typography-specialist` → `icon-specialist` → `interaction-specialist` → `motion-specialist` → `accessibility-specialist`. After each, the orchestrator reviews the diff against DESIGN.md before launching the next.
4. **Verify** — `design-verifier` runs the full pass (lint, inspect, checklist, anti-slop sweep, behaviour smoke test). Read-only checks may run in parallel.
5. **Fix loop** — dispatch each FAIL / unjustified WARN to the owning specialist; re-verify. Maximum three rounds; report anything unresolved with evidence.
6. **Close** — `design-director` Mode B holistic review; orchestrator reports what changed, what was verified, and any deviations.

## Ownership map

Ownership means responsibility for that surface; the orchestrator serializes all writes.

| Zone (styles.css sections) | Primary owner |
|---|---|
| `01 tokens` | color-specialist |
| `02 base / reset` | layout-specialist |
| `03 typography` | typography-specialist |
| `04 shell + layout` | layout-specialist |
| `05 components` (buttons, inputs, panels, tables, toast) | interaction-specialist (visual states) + color-specialist (values) |
| `06 workbench` | layout-specialist |
| `07 metrics strip` | layout-specialist + typography-specialist |
| `08 gantt` | color-specialist + motion-specialist |
| `09 results` | typography-specialist |
| `10 comparison` | color-specialist |
| `11 learn + footer` | typography-specialist |
| `12 responsive` | layout-specialist |
| `13 motion + reduced-motion` | motion-specialist |
| Focus / a11y utilities | accessibility-specialist |
| SVG sprite + brand mark (`index.html`) | icon-specialist |
| `app.js` presentation surfaces | the specialist owning that surface; scheduling logic owned by nobody (frozen) |

Cross-zone change: request it through the orchestrator; never silently edit outside your zone.

## Skill usage

Load skills by ID with the skill tool; read only the references a task needs.

| Skill ID | Best used for | Key entry points |
|---|---|---|
| `impeccable` | Design craft, critique, audit, polish, DESIGN.md context | `.agents/skills/impeccable/scripts/impeccable.cmd context` (Windows); references in `.agents/skills/impeccable/reference/` (`critique`, `audit`, `polish`, `typeset`, `layout`, `colorize`, `animate`, `clarify`) |
| `ui-ux-pro-max` | Searchable rules: styles, palettes, type, UX guidelines, icons, charts | `python .agents/skills/ui-ux-pro-max/scripts/search.py "<2-5 terms>" --domain <product\|style\|color\|typography\|google-fonts\|chart\|ux\|landing\|icons\|motion\|gsap>`; `references/pro-rules.md` |
| `design-taste-frontend` | Anti-slop house style; browser inspector; references | `node .agents/skills/design-taste-frontend/scripts/lint.mjs --app <files>`; `inspect.mjs --app <url>`; references `tells.md`, `app-screens.md`, `type.md`, `colour.md`, `layout.md`, `motion.md`, `critique.md`, `copy.md` |
| `emil-design-eng` | Component polish, animation decisions, review tables | The SKILL.md itself; fetch it before reviewing motion or building states |
| `browser` | In-app browser: snapshots, screenshots, console, a11y checks | Load before the first browser tool call; always target an explicit tab ID |

Notes:

- Do **not** run `draw.mjs` to deal a new direction, and do **not** run `ui-ux-pro-max --design-system --persist`. The direction is committed in `DESIGN.md`. Inspector and lint runs for verification are expected and welcome.
- When a skill suggests something `DESIGN.md` bans (or vice versa), `DESIGN.md` wins, full stop. When a skill's result conflicts with a hard constraint here, this file wins.
- The Taste skill's general page rules are looser in its own app-screen chapter (quiet borders, small sentence-case labels, repeated panels, mono numerals are normal for app screens). This project is an app screen; read `references/app-screens.md` before overriding anything.

## Quality gates (definition of done)

A design change is done when all of the following hold:

1. Zero FAILs from `design-verifier`; every WARN either fixed or defended in writing.
2. Zero console errors; behaviour smoke test passes (load example → run → play/step/reset → compare → remove process).
3. Layout intact at 1440 / 1024 / 768 / 390 widths: no horizontal scroll of the shell, no ragged rows, no dead strips, no content loss at 200% zoom.
4. `DESIGN.md` acceptance checklist fully PASS-ing.
5. Anti-slop sweep clean: no gradients, glows, uppercase transforms, glyph icons, radii over 4px, `transition: all`, `ease-in` transitions, text under 11px, fake meta.
6. The diff is surgical: no dead CSS, no leftover legacy tokens, no orphaned class names in any of the three files.

## Working agreements

- Read before you write; never guess a class name, ID, or message string.
- Keep edits in your zone; report cross-zone needs instead of making them.
- Never edit `.agents/`, `.opencode/`, or `opencode.json`.
- Never run destructive git commands, never `git push`, never install packages.
- When the facts disagree with your assumption, the facts win; say so in your report.
