# Workspace and dashboard composition

Use this file when surface mode is `workspace` or `mobileTool`. Do not apply marketing hero budget rules here.

If mode is `marketing`, stop and open [composition.md](composition.md) instead.

## First question

What is the single primary task of this view (triage, monitor, configure, create, review)?

If you cannot answer in one short line, fix scope before styling.

## Shell map template

Define regions before components:

1. **Navigation:** sidebar, top nav, tabs, or command palette entry points
2. **Context bar:** project switcher, breadcrumbs, date range, view switcher
3. **Primary canvas:** table, board, document, chart set, or thread
4. **Inspector (optional):** detail pane, properties, customer context
5. **Overlays:** modals, sheets, toasts, command palette

Rules:

- One focal canvas. Chrome stays quieter than the canvas.
- Brand is quiet (mark, product name in chrome), not a hero headline.
- Prefer inspector/drawer over a full route when triage speed matters.
- Do not place marketing heroes, logo walls, or promotional badge stickers in tool views.

## Density

- Ops and triage UIs may be dense. Use a tight, even rhythm.
- Do not fake luxury marketing whitespace in queues.
- Do not pack decoration into the gaps; air should separate groups of meaning.
- Align numbers and statuses for scan (especially money and counts).

## Scan path

Pick one primary scan model and commit:

- **List/table first:** title/key → status → meta
- **Board:** column headers → card titles → badges
- **Dashboard:** one monitoring question → supporting charts/tables
- **Three pane:** list → thread/canvas → inspector

Avoid equal weight widget wallpaper on home.

## Brand in tools

- Pass if product work is the loudest signal and brand chrome stays calm.
- Fail if a campaign headline or full bleed hero displaces the task.
- Dark themes need real contrast, not glow as a substitute.

## Dashboard home

Good homes:

- Show the next real work (queue, deploys, conversations) or one clear monitoring question
- Keep date/range and environment controls with the canvas
- Limit overview modules; each must earn a click through to a deeper view

Bad homes:

- Three identical metric cards as fake sophistication
- Charts without units, legends, or a question they answer
- Sample data presented as live data without a sample label

## Patterns to avoid (workspace)

- Purple gradient sidebars and glass panels as default identity
- Icon only unlabeled nav
- Nested cards inside cards
- Marketing section stories (hero → proof → offer) used as app IA
- Scroll jacking or cinematic delays before the tool is usable
