# CPU Lab — Scheduling Visualizer

A standalone, browser-based CPU scheduling simulator for an Operating Systems project.

## Run it

1. Extract the project folder.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, or Safari).
3. Add processes or click **Load example**.
4. Select one of the six algorithms and click **Run simulation**.
5. Use the playback controls to animate the Gantt chart.
6. Select algorithms in the comparison section and click **Compare selected**.

No build step, package manager, server, or API key is required. The Google Fonts import is optional; the page falls back to system sans-serif and monospace fonts when offline.

## Included algorithms

- First Come, First Served (FCFS)
- Shortest Job First — non-preemptive
- Shortest Remaining Time First (SRTF) — preemptive SJF
- Priority Scheduling — non-preemptive
- Priority Scheduling — preemptive
- Round Robin (RR)

## Scheduling assumptions

- One CPU; no I/O blocking and zero context-switch overhead.
- Arrival times, burst times, priorities, and time quantum are integers.
- Burst time and time quantum must be positive. Arrival time and priority may be zero.
- A smaller priority value means a higher priority.
- Equal selection keys are resolved by earlier arrival and then input order. For preemptive algorithms, the running process is retained on an exact tie.
- Idle intervals appear in the Gantt chart.
- Average turnaround, waiting, and response times are arithmetic means over all processes.
- CPU utilization is total CPU busy time divided by elapsed time from the first arrival to the final completion.

## Files

- `index.html` — application markup and structure
- `styles.css` — all styling (the "Dispatch" design language)
- `app.js` — all behaviour (scheduling logic, playback, comparison, CSV export)
- `DESIGN.md` — the design language: tokens, components, rules, acceptance checklist
- `AGENTS.md` — agent workflow, ownership map and quality gates
- `README.md` — usage instructions and algorithm assumptions

## Design workflow

The page is being redesigned into the **Dispatch** design language (see `DESIGN.md`): a light,
near-monochrome schedule-board look — paper, ink, one signal red. Project-local agents live in
`.opencode/agents/`; `design-orchestrator` is the default agent and delegates to specialists
(layout, color, typography, icons, interaction, motion, accessibility) plus a verifier.
Design skills are installed under `.agents/skills/`.

To run a redesign session: start a new session in this project and give the design-orchestrator
the one-shot redesign prompt (or any smaller design task). It reads `AGENTS.md` and `DESIGN.md`,
delegates, and verifies before reporting.
