# DESIGN.md — Dispatch

**The design language of CPU Lab.** This document is the committed direction and the single source of truth for every visual decision on this page. Skills, tools, and habit are subordinate to it. Every rule below exists to be verifiable; the acceptance checklist in Appendix B is the contract.

---

## 1. What this is, and what it refuses to be

CPU Lab is redesigned as a **schedule board from a machine room**: white sheets on a cool paper desk, black ink structure, and exactly one red signal that marks what is live. Light theme, near-monochrome, flat, precise.

The world is borrowed from the subject itself. Gantt charts began as industrial scheduling instruments; dispatch boards, railway timetables, and operating-systems textbook figures share one virtue — *you can read the schedule at a glance*. The design takes that honesty (ruled alignment, labeled cells, numbers that line up) and refuses its nostalgia (no cream paper, no serif display, no rubber stamps, no broadsheet cosplay).

Two looks are explicitly refused:

- **The generated dashboard** (the current page): dark navy, neon cyan/violet, gradient glows, colored metric cards, rainbow categories, glowing buttons, pulse dots.
- **The fashionable "fix"**: cream ground + terracotta accent + serif display + hairline everywhere. That combination is now the most recognizable generated aesthetic of all — adopting it would repeat the mistake with better manners.

Dispatch is neither. It is paper and ink with one signal, an engineering typeface, and structure carried by space and alignment rather than ornament.

## 2. Principles

1. **Structure is the decoration.** Space, alignment, and hierarchy do the work. Ornaments are removed, not restyled.
2. **One signal.** Red marks only what is live, active, focused, or wrong. Everything else is ink on paper.
3. **Numbers are the texture.** This page is mostly numbers; they must align, tabulate, and read at a glance.
4. **Flat and precise.** No shadows (except the toast), no gradients, no blur, no glows. Hairline borders, near-square corners.
5. **Quiet chrome, loud data.** Panels recede; the Gantt chart and result figures carry all emphasis.
6. **Every state designed.** Hover, focus, active, disabled, empty, error, playing, finished — none missing, none improvised.

## 3. Banned (non-negotiable)

Grouped; each item is checkable with a text search or an inspector run.

- **Color and effects:** gradients of any kind; glow or colored shadows; backdrop blur / glassmorphism; any second chromatic hue; decorative color on chrome (icons, headers, borders, card edges).
- **Shape:** border-radius over 4px (2px is the standard, 0 on chart bars); pill / lozenge shapes; floating rounded containers; icons inside rounded tinted squares.
- **Typography:** `text-transform: uppercase` anywhere; tracked-out capitals; eyebrow / kicker labels above headings; sizes outside the scale in §5; text below 11px absolute (12px normal minimum); a third font family; serif display faces.
- **Structure:** section index numbers ("01 /"); decorative status dots or pulses; card hover lifts; entrance animations on load or scroll; fake meta (version stamps, local times, coordinates, "©2026 — scroll"); centered hero text stacks; ornament lines (crosshairs, dashed guides, crop marks).
- **Iconography:** emoji; unicode glyph icons (`⌁ ▶ ↺ ⇄ ＋ × ↓ ● Ⅱ`); mixed icon families; icons under 16px in controls.
- **Copy:** marketing vocabulary (unlock, supercharge, seamless, elevate, effortless, cutting-edge, powerful); exclamation marks; "not just X — it's Y"; descriptions that explain the interface instead of the subject; invented proof or statistics.
- **Code:** `transition: all`; `ease-in` on UI motion; animating layout properties (width/height/top/left/padding) except the documented one-shot comparison-bar reveal; raw hex colors outside `:root`.

## 4. Color

### 4.1 Tokens (canonical)

| Token | Value | Usage |
|---|---|---|
| `--paper` | `#F4F5F6` | Page ground, masthead |
| `--surface` | `#FFFFFF` | Panels, sheets, schedule cells |
| `--surface-sunken` | `#F1F2F4` | Wells, tracks, formula chips, empty states |
| `--ink` | `#17191C` | Primary text, primary button fill, data ink |
| `--ink-2` | `#565C63` | Secondary text |
| `--ink-3` | `#6B7178` | Labels, captions, ticks (≥ 4.5:1 on surface) |
| `--line` | `#E3E6E8` | Hairline borders, row rules |
| `--line-strong` | `#C7CCD1` | Stronger separation: table header rule, chart cell borders |
| `--control-border` | `#8E959C` | Input/select/button boundaries (≥ 3:1 on surface) |
| `--signal` | `#BE2A20` | The one hue: live/active, focus ring, WT series, error |
| `--signal-deep` | `#8F1F17` | Pressed red, red text on tints |
| `--signal-soft` | `#FAEDEA` | Faint red ground: the active results row only |
| `--idle-a` / `--idle-b` | `#EDEFF1` / `#F7F8F9` | Idle hatch stripes |
| `--shadow-float` | `0 1px 2px rgba(23,25,28,.07), 0 10px 28px rgba(23,25,28,.09)` | Toast only |

### 4.2 Rules

- **One chromatic family.** If a viewport shows any hue other than the red family, it is a bug. (Exception: `--signal-soft`/`--signal-deep` are shades of the same family.)
- **Red budget.** Red appears only on: live/active marks, focus, errors, the active results row, the WT data series. About 5% of a viewport at most.
- **Contrast floors** (WCAG): body and label text ≥ 4.5:1; large text ≥ 3:1; control borders, focus indicators, and chart marks ≥ 3:1. The color-specialist computes and lists every pair; failures are fixed by adjusting the pair, never the requirement.
- **Color is never the only signal.** The active Gantt segment is also named in the state line; the active table row also reads "Executing" in the state line; errors carry text.
- **State derivation.** Hover on neutral controls = `--surface-sunken`; pressed red = `--signal-deep`; disabled = 45% opacity with no transform; selection background = `--signal-soft` with `--ink` text.

## 5. Typography

**Families (exactly two):**

- **IBM Plex Sans** 400 / 500 / 600 — all interface and content text.
- **IBM Plex Mono** 400 / 500 — data only: PIDs, numeric inputs, metric values, the time readout, ruler ticks, segment captions, formula chips.

Load with `preconnect` + one Google Fonts `css2` stylesheet link in `index.html`; declare system fallback stacks (`system-ui...` / `ui-monospace, "Cascadia Mono", Consolas...`) so the page stays fully usable offline.

**Scale — five text sizes, three data sizes, nothing between:**

| Role | Spec |
|---|---|
| Page title (h1) | `clamp(26px, 2.6vw, 34px)` / 600 / 1.2 / -0.01em — at most two lines at every width |
| Section heading (h2) | 22px / 600 / 1.25 |
| Panel title (h3) | 16px / 600 / 1.3 |
| Lead | 16px / 400 / 1.55, `--ink-2`, max 72ch |
| Body / UI | 14px / 400 / 1.5 |
| Small | 12px / 400–500 / 1.4, `--ink-3` — labels, captions, table headers |
| Data-lg | 28px / 500 mono — metric values |
| Data | 14px mono — PIDs, numeric inputs, time readout, formulas; `--tabular-nums` everywhere numbers change or align |
| Data-xs | 11–12px mono — ruler ticks, segment duration captions, bar values |

**Rules:** sentence case everywhere (acronyms stay caps: CPU, FCFS, SJF, SRTF, RR, TAT, WT, RT, CSV); no uppercase transform; no letter-spaced caps; table numerics are sans with tabular figures, right-aligned; the algorithm briefing headline uses the h2 size; minimum 12px except the documented 11px micro-data role.

## 6. Layout

- **Container:** 1200px max; padding 32px (desktop) / 20px (≤720px).
- **Gutter:** one value — 24px desktop, 16px mobile — used horizontally and vertically.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Section rhythm: 64px desktop, 48px mobile.
- **Radii:** 2px standard; 0 on chart bars.
- **Separation order:** space first, tone step second, hairline third. No ornament lines.

**Page map (top → bottom):** masthead → intro → 01 workbench → 02 metrics strip → 03 Gantt → 04 results → 05 comparison → 06 learn → footer.

**Section head pattern:** h2 + optional one-line description (14px `--ink-2`, ≤ 72ch) stacked below; no indices, no eyebrows, no right-side meta except live result data (the metrics caption).

**Composition per section:**

- **Masthead:** sticky, `--paper`, hairline bottom, 64px. Brand left (schedule glyph + "CPU Lab" 15px/600); nav right, 3 links at 14px, hover to `--ink`.
- **Intro:** left-anchored; h1 + one 16px sentence; max 760px. Nothing else — no status chips, dots, or buttons.
- **Workbench:** two panels, `7fr / 5fr`, 24px gap; stacks ≤ 1024px. Inputs left, algorithm briefing right.
- **Metrics strip:** one container (surface + hairline + 2px radius) split into four cells by 1px vertical dividers; 2×2 at ≤ 720px with correct dividers.
- **Gantt:** full-width panel; head with title + domain description left and the legend right; controls row; horizontal scroll lives inside the panel only.
- **Results:** full-width panel with the results table (§7).
- **Comparison:** full-width panel; head with the section's primary button; checkbox row; legend; chart; best-result callout; footnote.
- **Learn:** three columns divided by 1px hairlines, no outer container; formula chips as sunken wells; the model-assumptions footnote at 12px `--ink-3`, ≤ 90ch.
- **Footer:** hairline top, 12px `--ink-3`, two sides, sentence case.

**Rules:** one left edge from h1 to footer; panels sharing a row share a bottom edge; nothing stretches over void; grid arithmetic must close (write the sums in the report).

## 7. Components

| Component | Spec | States |
|---|---|---|
| Buttons | Heights 36 / 32 / 28px; radius 2px; 14px/500; padding 0 14px. Primary = `--ink` fill, paper text. Secondary = surface + 1px `--control-border`. Quiet = text only. Danger = quiet, red on hover. Icon-only = 28×28 with a 16px icon | hover (surface-sunken / ink lighten), active scale .97 @120ms, focus 2px signal ring +2 offset, disabled 45% no transform |
| Inputs / selects | Height 36px; radius 2px; white; 1px `--control-border`; padding 0 10px; 14px; numeric inputs mono | focus: border `--ink` + 2px signal ring; error: border `--signal` + 12px `--signal-deep` message below, `aria-describedby` + `aria-invalid`; disabled 45% |
| Checkboxes | 16px; `accent-color: var(--ink)`; label 14px `--ink-2`; 8px gap; row wraps | focus ring on the control; hover label to `--ink` |
| Panels | `--surface`; 1px `--line`; radius 2px; no shadow. Head: 20px 22px, hairline bottom. Title 16/600 + optional 14px `--ink-2` description (domain facts only) | — |
| Tables | Header 12px `--ink-3` sentence case, no fill, `--line-strong` rule below; rows 44px; `--line` rules; numerics right-aligned tabular; identity column gets the most width | row hover = `--surface-sunken`; active row = `--signal-soft` with `--signal-deep` identity (during playback) |
| Metrics strip | Label 12px `--ink-3`; value 28px mono 500 `--ink`; sub-note 12px `--ink-3`; empty value renders `—` | values update in place, no animation |
| Legend | Swatch = the mark itself, scaled (busy = white cell with border; active = red square; idle = hatched square; TAT = ink square; WT = red square) + 12px `--ink-2` label | — |
| Wells | `--surface-sunken`, radius 2px — formula chips, comparison callout, empty states | — |
| Toast | `--ink` ground, paper text, 14px, radius 2px, `--shadow-float`; bottom-right, 16px inset on mobile | enter/exit 200ms translateY(8px) + opacity, transition-based (interruptible), `role="status"` |
| Scrollbars | Thin; thumb `--line-strong` on `--surface-sunken` | — |

## 8. Data visualization

The Gantt chart is the product's signature element; it must read like a schedule strip cut from a dispatch board.

**Gantt chart**

- Track: 56px tall on `--surface-sunken` with a 1px `--line` border; unit width 40–64px, minimum track width 650px; horizontal scroll inside the panel only.
- Busy cells: `--surface` fill, 1px `--line-strong` borders; PID label mono 12px/500 `--ink` centered; duration caption mono 11px `--ink-3`, hidden when the cell is under 44px wide.
- Active cell (the executing process): `--signal` fill, paper text, duration at 75% white, `--signal-deep` border. One active cell at a time; **no glow, no pulse**.
- Idle cells: the hatch pattern (`--idle-a`/`--idle-b`); a mono 11px "idle" caption shown when the cell is at least 56px wide.
- Playhead: 2px `--signal` line with an 8px square cap; `pointer-events: none`; linear movement only.
- Ruler: 28px; ticks mono 11px `--ink-3` with 5px marks at `#A9AFB6`-equivalent (`--line-strong`).
- **No per-process colors.** Process identity comes from labels. The `COLORS` array and `colorFor()` are retired; every busy cell is the same neutral treatment.

**Comparison chart**

- Row label 14px `--ink-2` (readable names, not codes); two bars per row: TAT `--ink` fill, WT `--signal` fill; height 12px, square corners, track `--surface-sunken`.
- Values in a fixed right column, mono 12px tabular, right-aligned — one right edge per card.
- Reveal: one-shot `transform: scaleX()` from origin left, 200ms `--ease-out`; no repeat on hover or scroll.
- Legend swatches: 10px squares matching the fills exactly.

**Numbers**

- Integers print as integers; averages 2 decimals; utilization 1 decimal + `%`; always tabular; thousands separators where a count could exceed 999.
- Units are spelled once in the label ("time units"), never repeated per value.
- Empty values print an em dash `—`, never a zero or a fake placeholder.

## 9. Iconography

- **One family:** hand-picked inline SVG on a 24px grid, 1.5px stroke, round caps and joins, `stroke: currentColor`, `fill: none` — except the brand mark.
- **Delivery:** one hidden `<svg>` sprite in `index.html`; icons referenced via `<use>`. The select chevron is a CSS `background-image` data URI.
- **Sizes:** 16px in controls, 20px where the control is the primary transport action; icon buttons are 28–32px targets.
- **Inventory (exact set, nothing more):** `play`, `pause`, `step-forward`, `reset`, `compare`, `download`, `plus`, `close`, select chevron.
- **Brand mark — the schedule glyph:** three horizontal bars of different lengths on a 24px grid; two in `--ink`, the shortest in `--signal`. It must read clearly at 24px and sits left of the "CPU Lab" wordmark. Never a black square with a letter.
- **Handling:** decorative icons `aria-hidden="true"` + `focusable="false"`; icon-only buttons carry `aria-label`; no icon that merely repeats the adjacent word; zero unicode glyph icons in any rendered string.

## 10. Motion

Motion exists for feedback and comprehension. The playback animation is the only piece of real motion and it is content: linear, precise, honest.

- **Durations:** press/color 120ms; hover/state change 160ms; toast and one-shot bar reveal 200ms. UI motion stays under 300ms, always.
- **Easings:** `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`; `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. Never `ease-in`; never `linear` except the playback itself.
- **Properties:** `transform`, `opacity`, `background-color`, `border-color`, `color` only. No layout animation outside the documented bar reveal.
- **Press feedback:** subtle scale (`0.97`) on every pressable element, 120ms.
- **Hover transitions gated:** `@media (hover: hover) and (pointer: fine)`.
- **Playback:** playhead moves linearly with no easing; segment activation is a 160ms background/border change — no glow, no pulse, no scale.
- **Toast:** interruptible transitions (not keyframes), same direction in and out, `@starting-style` where supported with a graceful fallback.
- **Forbidden:** entrance animations on load or scroll; staggered hero reveals; infinite decorative loops; bounce; hover lifts; animating width/height/top/left.
- **Reduced motion:** inside `@media (prefers-reduced-motion: reduce)` all ornamental transitions are off; in `app.js`, playback renders discrete one-unit steps (no sub-unit interpolation of the playhead) while play / step / reset all keep working. The preference is read live (`matchMedia`), not cached.

## 11. Accessibility (floor)

- **Contrast:** per §4 — 4.5:1 text, 3:1 large text, 3:1 control boundaries and focus indicators. Verified numerically by the color-specialist, spot-checked by the verifier.
- **Focus:** a visible 2px `--signal` ring with 2px offset on every interactive element, on every surface, never obscured by the sticky masthead.
- **Structure:** `header` / `nav` / `main` / `footer` landmarks; exactly one `h1`; heading levels descend without skips; `html lang`; title and meta description kept truthful.
- **Controls:** every input has a programmatically associated label; field errors are linked via `aria-describedby` with `aria-invalid="true"`; icon-only buttons have accessible names; disabled uses the attribute, not just styling.
- **Live regions:** the toast stays `role="status"`; simulation and comparison completion are announced politely; the playback readout (`T = n`) is never announced per frame.
- **Keyboard:** every control operable in visual order; the Gantt scroll area is focusable (`tabindex="0"` + `aria-label`) so it can be scrolled without a mouse.
- **Targets:** ≥ 24px minimum, 32px preferred, comfortable spacing.
- **Zoom / reflow:** no loss at 200% zoom or 320px width; tables may scroll inside their own wrapper; the shell never scrolls horizontally.
- **Color is never the sole carrier:** §4.2.

## 12. Voice and copy

- Sentence case headings, labels, buttons; acronyms stay caps.
- Plain verbs; buttons name their action (final set): **Run simulation**, **Add process**, **Load example**, **Clear all**, **Compare selected**, **Export CSV**, **Play**, **Pause**, **Step**, **Reset**.
- Domain accuracy first: turnaround time, waiting time, response time, time quantum, preemption, ready queue — never simplified into wrong words.
- Descriptions state domain facts ("Each block is one continuous CPU allocation; width is proportional to duration."), never interface instructions ("Add processes and define how the CPU should schedule them." — banned).
- Empty states: one useful sentence with the next action. Errors: what is wrong and what is valid. No exclamation marks, no marketing vocabulary, no invented proof, no em-dash chains.

---

## Appendix A — tokens (paste-ready)

```css
:root {
  --paper: #F4F5F6;
  --surface: #FFFFFF;
  --surface-sunken: #F1F2F4;
  --ink: #17191C;
  --ink-2: #565C63;
  --ink-3: #6B7178;
  --line: #E3E6E8;
  --line-strong: #C7CCD1;
  --control-border: #8E959C;
  --signal: #BE2A20;
  --signal-deep: #8F1F17;
  --signal-soft: #FAEDEA;
  --idle-a: #EDEFF1;
  --idle-b: #F7F8F9;
  --shadow-float: 0 1px 2px rgba(23,25,28,.07), 0 10px 28px rgba(23,25,28,.09);
  --radius: 2px;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --idle-hatch: repeating-linear-gradient(135deg, var(--idle-a) 0 5px, var(--idle-b) 5px 10px);
}

:focus-visible { outline: 2px solid var(--signal); outline-offset: 2px; }
::selection { background: var(--signal-soft); color: var(--ink); }
```

## Appendix B — acceptance checklist

The verifier marks each item PASS / FAIL / N-A with evidence.

**Color**
1. No gradients, glows, colored shadows, or blur anywhere.
2. Exactly one chromatic family; red only in the roles of §4.2; every hex lives in `:root`.
3. All text/background pairs meet 4.5:1 (large text ≥ 3:1); control borders and focus ≥ 3:1 — with a computed table.
4. No color-only meaning.

**Typography**
5. Exactly IBM Plex Sans + IBM Plex Mono; fallback stacks present; old families fully removed.
6. Only the scale sizes in §5; no text below 12px except the 11px micro-data role.
7. Sentence case everywhere; zero `text-transform: uppercase`.
8. Tabular figures on every changing/aligning number; PIDs mono; metric values mono 28.
9. h1 ≤ 2 lines at 1440 / 768 / 390.

**Layout**
10. One container, one gutter, one left edge from h1 to footer; grid arithmetic closes.
11. Section rhythm per §6; separation by space, not ornament rules.
12. Workbench stacks at ≤ 1024; metrics become a correct 2×2 at ≤ 720; no horizontal shell scroll at 390.
13. No ragged rows, no panels over void, no dead strips.
14. Masthead sticky, solid, hairline; no floating pill nav.
15. Footer present and quiet.

**Components**
16. Buttons match §7 (heights, radius, primary/secondary/quiet/danger, press feedback, focus ring, disabled).
17. Inputs match §7 (36px, borders, focus, error pattern with aria linkage).
18. Panels without shadows; table spec applied (12px sentence-case headers, no fill, right-aligned numerics, average row by rule not tint).
19. Toast as spec'd; empty states as plain sentences inside the frame.
20. No icon in a tinted square anywhere.

**Data**
21. Gantt: neutral busy cells, one red active cell, hatched idle, red playhead, no per-process rainbow — `COLORS`/`colorFor` gone.
22. Comparison: ink TAT + red WT, square bars, value column right-aligned, one-shot reveal.
23. Numbers formatted per §8; em dash for empty.
24. Legends use the mark itself as swatch.

**Motion**
25. Durations/easings per §10; no `transition: all`; no `ease-in`; hover gated; no entrance/scroll animations.
26. Press feedback present on pressables.
27. Reduced motion: ornamental transitions off; playback steps discretely; play/step/reset work.

**Icons**
28. Exactly the §9 set; 1.5px stroke on 24 grid; sprite + `<use>`; chevron drawn.
29. Zero unicode glyph icons or emoji in rendered strings.
30. Brand schedule glyph in the masthead; icon-only buttons labelled.

**Accessibility**
31. Landmarks + single h1 + descending headings; inputs labelled; errors linked.
32. Focus visible everywhere, never obscured; keyboard walkthrough passes; Gantt scroll focusable.
33. Live regions correct; playback not announced per frame.
34. 200% zoom and 320px reflow lossless.
35. Targets ≥ 24px.

**Copy**
36. Button set and voice per §12; no banned vocabulary, no exclamation marks.
37. Panel descriptions are domain facts, not interface instructions.
38. Footer, footnote, empty states tightened; meaning intact.

**Code hygiene**
39. Behaviour parity smoke test passes (load example → run → play/step/reset → compare → export → remove).
40. Zero console errors; `node --check app.js` clean.
41. No dead CSS, no leftover legacy tokens, no orphaned classes in any of the three files.
