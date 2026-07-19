---
name: design-file-ui
description: >-
  Designs, implements, and critiques distinctive frontend UI with strong visual
  hierarchy and light UX judgment. Use when building or redesigning landing pages,
  marketing sites, portfolios, product pages, award style pitches, SaaS dashboards,
  admin tools, app shells, data tables, filters, settings, or mobile web apps; when
  the user asks for UI polish, visual direction, layout help, or more excellent
  interface design; when the user asks to critique UI, review UI, do a UX review,
  assess brand presence, hierarchy, CTA clarity, task clarity, or density; and when
  composing with Default File UI components, tokens, or kit CLI discovery in a project
  that uses the kit.
---

# Design File UI

Build and critique frontend interfaces that feel intentional, branded, and human. This skill is stack agnostic and tool agnostic. Prefer principles over fashion. Do not clone a specific external showcase site.

Project or user hard rules may already cover composition principles. This skill still owns mode routing, the critique workflow, and the output contract. Follow that contract even when principles feel familiar.

Read this file immediately when the skill applies, then follow the task path below. Do not improvise a generic review format.

## UI copy constraints (required)

When implementing or rewriting **user-facing frontend UI** (headlines, subheads, body, labels, buttons, nav, empty states, errors, toasts, placeholders, table headers, tooltips, alt text, and similar visible strings):

- Never use em dashes (`—`) or en dashes (`–`).
- Never use hyphens (`-`) inside that visible copy. Prefer spaced words, commas, periods, colons, or semicolons.
- Examples of bad UI copy: `Best-in-class`, `Real-time sync`, `Sign-in`, `AI-powered`, `Jan–Mar`, `Design — Build`.
- Examples of good UI copy: `Best in class`, `Realtime sync`, `Sign in`, `AI powered`, `Jan to Mar`, `Design. Build.`

These rules apply to strings rendered in the UI. They do not ban hyphens in code, class names, file paths, URLs, or CSS identifiers.

## When to use

- New UI from a brief or rough idea
- Redesign or visual upgrade of an existing screen
- Critique of hierarchy, brand strength, task clarity, motion, or UX clarity
- Choosing layout, type, color, and interaction patterns for a frontend surface
- SaaS dashboards, admin tools, tables, filters, settings, and mobile tool UI

## When not to use

- Pure backend, data modeling, or infra work with no UI surface
- Pixel perfect recreation of one specific external website
- Requests that only need a tiny copy tweak with no design judgment

## Step 0: Classify surface mode (required)

Before preflight, classify exactly one primary mode. Emit it as a single line:

`Mode: marketing | workspace | mobileTool` plus one short rationale.

| Mode | Choose when the surface being built is |
|---|---|
| `marketing` | Landing, pitch, portfolio, brand campaign, award style promotional page |
| `workspace` | SaaS dashboard, admin, analytics, CRM, settings, data tool, desktop app shell |
| `mobileTool` | Mobile web app, thumb first tool UI, or responsive tool shell as the deliverable |

If the brief mixes modes (for example a marketing page that embeds a product screenshot), classify by the **surface being built**, not the surrounding page type.

Misclassification checks:

- "Award winning landing" → `marketing`
- "SaaS billing admin" → `workspace`
- "Mobile web triage app" → `mobileTool`

Do not apply marketing hero budget rules to workspace or mobileTool surfaces. Do not apply dashboard chrome to marketing heroes.

## Required reference reads

Do not treat references as optional. Open and follow the matching reference file before that work:

| Task | MUST open before proceeding |
|---|---|
| Critique or redesign of existing UI | [references/critique.md](references/critique.md) |
| `marketing` first viewport or hero composition | [references/composition.md](references/composition.md) |
| `workspace` or `mobileTool` shell / density / dashboard | [references/workspace.md](references/workspace.md) |
| Cards, boards, table vs card decisions | [references/cards.md](references/cards.md) |
| Forms, tables, filters, tool navigation | [references/app-patterns.md](references/app-patterns.md) |
| `mobileTool` or narrow tool layout | [references/responsive-app.md](references/responsive-app.md) |
| Adding or redesigning motion | [references/motion.md](references/motion.md) |
| Default File UI present, or task uses kit components/tokens | [references/kit.md](references/kit.md) |

## Preflight (do this before coding)

Answer the checklist for the classified mode. If any item fails, revise the plan before writing UI.

### Marketing preflight

1. **One composition:** Does the first viewport read as one scene, not a dashboard?
2. **Brand first:** Is the brand or product name a hero level signal, not only nav text?
3. **Brand test:** If the nav were removed, could this still belong only to this brand?
4. **Hero budget:** Brand, one headline, one short support line, one CTA group, one dominant visual. Nothing else in the first viewport.
5. **Visual direction:** Named atmosphere (light, material, media, depth). Not a flat default fill.
6. **Type plan:** Expressive display + readable body. Avoid generic default UI font stacks when brand expression matters.
7. **Motion plan:** 2 to 3 intentional motions max for the first ship.
8. **UX primary action:** What is the single most important next step for the user?

### Workspace / mobileTool preflight

1. **Primary task:** Can you name the job of this view in one short line?
2. **Shell regions:** Nav, context, primary canvas, optional inspector, overlays defined?
3. **Focal canvas:** Is there one primary focal region with quieter chrome?
4. **Density plan:** Information priority clear (not marketing whitespace, not decorative noise)?
5. **Data and states:** Filters/search (if any), empty, loading, and error planned?
6. **Collection choice:** Table/rows vs cards justified by task?
7. **Mobile region plan:** For `mobileTool` or required narrow widths, are regions redrawn (sheets/sequence), not only shrunk?
8. **Motion as feedback:** 2 to 3 short feedback or region motions; no theater before use?
9. **Primary action in chrome:** Is the most important action obvious and reachable?

## Hard rules

### Mode scoped composition

**Marketing**

- One job per section: one purpose, one headline, usually one short supporting sentence.
- Real visual anchor: show the product, place, craft, or context when possible.
- Full bleed hero for promotional surfaces by default. Avoid inset hero cards, side panel heroes, and tiled collages unless the existing system requires them.
- No detached labels, floating badges, promo stickers, or callout chips on top of hero media.
- Reduce clutter: no pill clusters, stat strips, icon rows, or competing text blocks in the hero.
- No dashboard chrome on a marketing or brand page.

**Workspace / mobileTool**

- Task first; brand quiet in chrome.
- One focal canvas; subordinate chrome.
- No marketing hero theater on admin, settings, or triage views.
- Prefer inspector/drawer for triage speed when appropriate.
- Design empty, loading, and error with the happy path.

### Cards and chrome

- Default: no decorative cards.
- Marketing: never use cards in the hero; cards only for interaction or a necessary browsable set.
- Workspace: cards only as interaction containers or justified collections; otherwise tables/rows. Open [references/cards.md](references/cards.md) for table vs card decisions.
- If removing a border, shadow, background, or radius does not hurt understanding or selection, remove it.

### Color and look

- Choose a clear direction and encode it as CSS variables (surfaces, text, accent, border, focus, success, warning).
- Avoid defaulting to overused AI looks: purple on white / purple to indigo glow themes; warm cream backgrounds with stock serif + terracotta accents; broadsheet hairline newspaper layouts.
- Workspace extras to avoid: purple gradient sidebars, glass panels everywhere, identical three stat metric cards as fake sophistication, chart junk, icon only unlabeled nav.
- Do not rely on dark mode, glow, fully rounded pills, or multi layer shadows as a substitute for hierarchy.
- Keep contrast readable for text and controls. Status color needs text or a legend.

### Typography

- Marketing: purposeful display + calm body; large hero contrast.
- Workspace: calm readable UI type; small intentional scale; density friendly.
- Keep line length readable for body copy.

### Motion

- Marketing: presence, light scroll continuity, feedback.
- Workspace / mobileTool: feedback, region change, progress. Open [references/motion.md](references/motion.md).
- Respect `prefers-reduced-motion`.
- Do not animate everything. If motion does not clarify structure or feedback, cut it.

### UX (light, mandatory)

- One primary action per view whenever possible; secondary actions quieter.
- Every interactive state needs a clear affordance: hover, focus, active, disabled, loading, empty, error.
- Forms: labels, errors adjacent to fields, submit feedback. Open [references/app-patterns.md](references/app-patterns.md) for forms, tables, and filters.
- Keyboard focus visible. Hit targets comfortable on touch.
- Mobile is part of the design. For tools, open [references/responsive-app.md](references/responsive-app.md).
- Visible UI copy must follow **UI copy constraints** (no hyphens, em dashes, or en dashes in rendered strings).

## Implementation guidance (agnostic)

Use the project's existing design system when one exists. Otherwise:

```css
:root {
  --bg: /* atmosphere base */;
  --surface: /* panels if truly needed */;
  --text: /* primary text */;
  --muted: /* secondary text */;
  --accent: /* decisive action */;
  --border: /* hairline only when needed */;
  --font-display: /* expressive family */;
  --font-body: /* readable family */;
  --space-1: /* tight */;
  --space-2: /* default */;
  --space-3: /* section */;
  --radius: /* product specific, not max pill by default */;
  --ease: /* shared motion curve */;
  --dur: /* short shared duration */;
}
```

- Structure with real landmarks and headings.
- Theme through variables, not scattered literals.
- Keep components boring when the composition is expressive.
- Match existing system conventions when editing inside a codebase.

## Using with Default File UI

When the project uses Default File UI (`@default-file/ui`), or the task needs kit components or tokens:

1. MUST open [references/kit.md](references/kit.md) before inventing UI chrome.
2. Discover before invent: `cover` / `search` / `show` / `tokens` (CLI or MCP), then compose with registry items and kit tokens.

If the kit is absent, skip `kit.md` and use the agnostic implementation path above.

## Workflow: design and implement

1. Restate the user goal and primary action.
2. Classify surface mode (Step 0) and emit `Mode: …`.
3. Run the matching preflight checklist.
4. Define visual direction in one short paragraph (atmosphere, type pair, palette intent).
5. Outline map: marketing section map, or workspace shell map (and mobile region plan when needed).
6. Open required references for the mode and task.
7. If Default File UI is present, open [references/kit.md](references/kit.md), run discovery, and map needs to registry items before coding.
8. Implement structure first, then style, then motion (kit components and tokens when the kit is present).
9. Verify narrow layout and focus states.
10. Self critique using the matching critique contract below before finishing.

## Workflow: critique and redesign

1. Classify surface mode (Step 0).
2. MUST open [references/critique.md](references/critique.md) before writing findings.
3. Score every axis for that mode `strong`, `weak`, or `missing` using the contract below.
4. Propose a redesign plan that fixes the weakest structure or task issues first.
5. Do not start with decorative recoloring if structure scores are weak.

## Critique contract (required)

Use the axis set for the classified mode. Score each axis `strong`, `weak`, or `missing`.

### Marketing axes

1. Brand presence
2. Composition
3. Hierarchy
4. Visual anchor
5. Section rhythm
6. CTA clarity
7. Type
8. Color
9. Motion
10. Responsive
11. States
12. Accessibility basics

### Workspace / mobileTool axes

1. Task clarity
2. Shell clarity
3. Hierarchy / density
4. Data scan path
5. Navigation findability
6. Primary action clarity
7. Cards / collections discipline
8. Type
9. Color
10. Motion (feedback)
11. Responsive / mobileTool fitness
12. States + accessibility basics

Emit this structure in the final answer (critique, redesign, or design self critique). Do not substitute a freeform review. Replace the score rows with the axis set for the mode:

```markdown
## Mode
marketing | workspace | mobileTool : <one line rationale>

## Critique

### Scores
| Axis | Score |
|---|---|
| <mode axis 1> | strong / weak / missing |
| … | … |

### Top 3 structural issues
1.
2.
3.

### Top 3 quick wins
1.
2.
3.

### Redesign sequence
structure -> type/color -> motion -> states

### Non goals
-
```

## Output expectations

When designing or redesigning, provide:

1. Mode line
2. Direction (2 to 4 sentences)
3. Section map (marketing) or shell map (workspace / mobileTool)
4. Key UI decisions (type, color, motion, primary action, table vs card when relevant)
5. Implementation (code or concrete component changes)
6. The critique contract above (what improved, what remaining risks exist)

Keep prose short and professional. Prefer decisive recommendations over option piles unless the user asks for alternatives.

## Before finishing

- **Mode:** Classified and stated. Marketing rules not applied to workspace; dashboard chrome not applied to marketing heroes.
- **Critique tasks:** Do not send a final answer without scored axes for the correct mode, top 3 structural issues, redesign sequence, and non goals.
- **Design or redesign tasks:** Matching preflight answered; section or shell map present; critique contract filled for the result.
- **Kit present:** Discovery from `kit.md` done; chrome uses registry components and kit tokens, not a parallel stack.
- **UI copy:** Every user-facing string in the implemented UI has no hyphens, em dashes, or en dashes.
- If structure scores are weak, fix hierarchy or task clarity before paint (color, glow, or decorative motion).

## Anti goals

- Fashion cloning from external showcase galleries
- Stack religion (no required framework)
- Generic AI template aesthetics (marketing or workspace flavors)
- Overbuilding layout systems for a simple page
- Freeform UI opinions that skip the critique contract
- Inventing parallel chrome when Default File UI already covers the need
- Using an award landing as a template for a logged in admin
- Using a dense admin as a template for a brand campaign hero
