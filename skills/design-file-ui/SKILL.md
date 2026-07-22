---
name: design-file-ui
description: >-
  Designs, implements, and critiques distinctive frontend UI with strong visual
  hierarchy and light UX judgment. Use when building or redesigning landing pages,
  marketing sites, portfolios, product pages, brand campaigns, SaaS dashboards,
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
- Never use hyphens (`-`) inside ordinary English UI copy. Prefer spaced words, commas, periods, colons, or semicolons.
- Examples of bad UI copy: `Best-in-class`, `Real-time sync`, `Sign-in`, `AI-powered`, `Jan–Mar`, `Design — Build`.
- Examples of good UI copy: `Best in class`, `Realtime sync`, `Sign in`, `AI powered`, `Jan to Mar`, `Design. Build.`

**Allowed exceptions** (not ordinary English marketing compounds):

- Keyboard chords and shortcut labels: `Ctrl K`, `Cmd S`, `Shift Enter`
- Technical identifiers shown as data: model IDs, version tags, API names, file names, code tokens
- Established product or brand names that legally include a hyphen
- Code, class names, file paths, URLs, and CSS identifiers (never subject to this rule)

If unsure whether a string is English UI copy or a technical token, prefer spaced English for labels and buttons; keep the technical form for data cells and monospace IDs.

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
| `marketing` | Landing, pitch, portfolio, brand campaign, or promotional product page |
| `workspace` | SaaS dashboard, admin, analytics, CRM, settings, data tool, desktop app shell |
| `mobileTool` | Mobile web app, thumb first tool UI, or responsive tool shell as the deliverable |

If the brief mixes modes (for example a marketing page that embeds a product screenshot), classify by the **surface being built**, not the surrounding page type.

**Mixed briefs:** Pick one primary mode for the deliverable. Do not bleed rules across modes.

- Marketing page with an embedded product screenshot → `marketing` (screenshot is media, not an admin shell)
- Logged in app that includes a small promotional banner → `workspace` (banner stays quiet; no hero theater)
- One ask that includes both a landing and an admin → deliver as separate surfaces, each with its own mode line; never use one mode's rules for the other

Misclassification checks:

- "Brand campaign landing" → `marketing`
- "SaaS billing admin" → `workspace`
- "Mobile web triage app" → `mobileTool`

Do not apply marketing hero budget rules to workspace or mobileTool surfaces. Do not apply dashboard chrome to marketing heroes.

## Step 0b: Classify brief class (required)

After mode, classify how the brief is specified. Emit a second line:

`Brief: spec | problem` plus one short rationale.

| Class | Choose when |
|---|---|
| `spec` | The user listed screens, sections, components, or a near complete UI inventory to implement |
| `problem` | The user described a job, domain, or operator goal and left IA, workflows, and visualizations to the agent |

Rules:

- **spec:** Fidelity to the listed inventory matters. Still apply mode rules, authorship, hierarchy, and critique.
- **problem:** Invent the information architecture, workflows, interaction patterns, and visualizations. Fail if the result is a generic dashboard with no justified triage or decision model.
- If the brief mixes both (a business problem plus a short component list), prefer `problem` for IA invention and treat the list as non binding hints.

For `problem` briefs, emit a **decision model** before the section or shell map (four short lines):

1. What needs attention
2. Why it happened (or how to see why)
3. What gets worse if ignored
4. What action the operator should take

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
5. **Visual authorship:** Named concept (atmosphere + one signature move). Not a default template look.
6. **Type plan:** Expressive display + readable body. Avoid generic default UI font stacks when brand expression matters.
7. **Motion plan:** 2 to 3 intentional motions max for the first ship.
8. **UX primary action:** What is the single most important next step for the user?

### Workspace / mobileTool preflight

1. **Primary task:** Can you name the job of this view in one short line?
2. **Decision model (problem briefs):** Attention, why, if ignored, action stated?
3. **Shell regions:** Nav, context, primary canvas, optional inspector, overlays defined?
4. **Focal canvas:** Is there one primary focal region with quieter chrome?
5. **Density plan:** Information priority clear; adaptive fill if the canvas would otherwise sit empty?
6. **Visual authorship:** Named concept + one non default signature (type, surface, accent, or data emphasis)?
7. **Data and states:** Filters/search (if any), empty, loading, and error planned?
8. **Collection choice:** Table/rows vs cards justified by task?
9. **Type ladder:** Page title, section title, label, meta, and numeric/data steps distinct?
10. **Nav completeness:** Every nav destination is either a real view or a deliberate empty state with a next action (no dead stubs)?
11. **Mobile region plan:** For `mobileTool` or required narrow widths, are regions redrawn (sheets/sequence), not only shrunk?
12. **Motion as feedback:** 2 to 3 short feedback or region motions named; recipes from [references/motion.md](references/motion.md); no theater before use?
13. **Primary action in chrome:** Is the most important action obvious and reachable?

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

### Visual authorship (required)

Name a **visual concept** in 1 to 2 sentences: atmosphere plus one signature move. Encode it in variables and type.

- Reject the default template look unless the brief explicitly asks for it: dark bordered panels + cyan or electric blue accent + flat Inter-like UI type as the whole identity.
- Require at least one non default signature: distinctive type pairing, surface language (material, grid, ink, terminal, editorial), accent strategy, or data emphasis pattern.
- Marketing: authorship may live in hero, type, and media.
- Workspace / mobileTool: brand stays quiet in chrome; authorship lives in materials, hierarchy, and how data is emphasized, not in campaign heroes.
- Fail outputs that only look like "a professional dark enterprise dashboard" with no named concept.

### Color and look

- Choose a clear direction and encode it as CSS variables (surfaces, text, accent, border, focus, success, warning).
- Avoid defaulting to overused AI looks: purple on white / purple to indigo glow themes; warm cream backgrounds with stock serif + terracotta accents; broadsheet hairline newspaper layouts.
- Workspace extras to avoid: purple gradient sidebars, glass panels everywhere, identical three stat metric cards as fake sophistication, chart junk, icon only unlabeled nav, generic dark SaaS card stacks with a single cyan accent as the only idea.
- Do not rely on dark mode, glow, fully rounded pills, or multi layer shadows as a substitute for hierarchy.
- Keep contrast readable for text and controls. Status color needs text or a legend.

### Typography

- Marketing: purposeful display + calm body; large hero contrast.
- Workspace: calm readable UI type; density friendly; still use a clear ladder (see below).
- Keep line length readable for body copy.

**Workspace type ladder (minimum distinct steps):**

1. Page title
2. Section title
3. Control / column label
4. Body or metadata
5. Numeric or data (monospace allowed)

Fail flat UIs where page title and support line sit at similar size and weight.

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
3. Classify brief class (Step 0b) and emit `Brief: …`.
4. For `problem` briefs, emit the decision model (attention, why, if ignored, action).
5. Run the matching preflight checklist.
6. Define visual authorship: concept paragraph plus one named signature move (not a generic template).
7. Outline map: marketing section map, or workspace shell map (and mobile region plan when needed). For `problem` briefs, invent IA; do not wait for a component list.
8. Open required references for the mode and task.
9. If Default File UI is present, open [references/kit.md](references/kit.md), run discovery, and map needs to registry items before coding.
10. Implement structure first, then style, then motion (kit components and tokens when the kit is present).
11. Verify narrow layout, type ladder, adaptive density, and focus states.
12. Self critique using the matching critique contract below.
13. If any axis is `weak` or `missing`, apply at least one improve pass that fixes the top structural issues before finishing. Do not end on scores alone.

## Workflow: critique and redesign

1. Classify surface mode (Step 0) and brief class (Step 0b).
2. MUST open [references/critique.md](references/critique.md) before writing findings.
3. Score every axis for that mode `strong`, `weak`, or `missing` using the contract below.
4. For every `weak` or `missing` axis, cite concrete evidence (region, module, or pattern), not a vague adjective.
5. Write findings from an **enterprise professional** perspective (see voice rules below).
6. Propose a redesign plan that fixes the weakest structure or task issues first.
7. Do not start with decorative recoloring if structure scores are weak.
8. For redesign asks: implement the first improve pass, or list exact file-level changes if code is out of scope.

## Critique contract (required)

Use the axis set for the classified mode. Score each axis `strong`, `weak`, or `missing`.

### Enterprise professional findings voice (required)

Critique findings, structural issues, quick wins, and improve pass notes must read like an enterprise product and UX review, not a portfolio or design gallery comment.

Write each finding as:

1. **Observation** — what is present or missing in the UI (concrete region or pattern)
2. **Impact** — effect on task completion, decision speed, risk, trust, or operability
3. **Recommendation** — the structural change to make next

Voice rules:

- Prefer operational language: triage, scan path, primary action, ownership, empty and error recovery, accessibility, consistency with the system
- Tie issues to business or operator outcomes when relevant (time to action, missed exception, ambiguous status, blocked workflow)
- Keep tone calm, specific, and decisive. No hype, no taste only judgments, no showcase or trend chasing
- Do not frame success as looking trendy, viral, or gallery ready. Frame success as clear hierarchy, reliable task flow, and branded craft that still serves work
- Marketing mode still covers brand and CTA, but judge them as go to market clarity and trust, not as contest styling
- Workspace and mobileTool findings prioritize task clarity, density, states, and risk of operator error over decorative authorship alone

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
10. Visual authorship
11. Motion (feedback)
12. Responsive / mobileTool fitness
13. States + accessibility basics

Emit this structure in the final answer (critique, redesign, or design self critique). Do not substitute a freeform review. Replace the score rows with the axis set for the mode:

```markdown
## Mode
marketing | workspace | mobileTool : <one line rationale>

## Brief
spec | problem : <one line rationale>

## Critique

### Scores
| Axis | Score |
|---|---|
| <mode axis 1> | strong / weak / missing |
| … | … |

### Top 3 structural issues
1. <issue>. Evidence: <region or pattern>. Impact: <task, risk, or decision effect>.
2.
3.

### Top 3 quick wins
1. <change> — <why it improves operability or clarity>
2.
3.

### Improve pass
<what you changed, or exact changes to make next>

### Redesign sequence
structure -> type/color -> motion -> states

### Non goals
-
```

For design and implement tasks with any `weak` or `missing` score, the **Improve pass** section is required and must reflect real changes (or explicit file-level edits), not a promise to fix later.

## Output expectations

When designing or redesigning, provide:

1. Mode line and Brief line
2. Decision model (required for `problem` briefs; optional for `spec`)
3. Visual authorship concept (2 to 4 sentences, including the signature move)
4. Section map (marketing) or shell map (workspace / mobileTool)
5. Key UI decisions (type ladder, color, motion, primary action, table vs card, adaptive density when relevant)
6. Implementation (code or concrete component changes)
7. The critique contract above, including enterprise professional findings (observation, impact, recommendation), evidence on weak axes, and an improve pass when scores are not all strong

Keep prose short and enterprise professional. Prefer decisive recommendations over option piles unless the user asks for alternatives.

## Before finishing

- **Mode and Brief:** Classified and stated. Marketing rules not applied to workspace; dashboard chrome not applied to marketing heroes.
- **Problem briefs:** Decision model present; IA invented from the job, not a generic component shopping list.
- **Visual authorship:** Concept and signature move named; default dark cyan SaaS template rejected unless requested.
- **Critique tasks:** Do not send a final answer without scored axes for the correct mode, evidence on each weak/missing axis, enterprise professional findings (observation, impact, recommendation), top 3 structural issues, redesign sequence, and non goals.
- **Design or redesign tasks:** Matching preflight answered; section or shell map present; critique contract filled; at least one improve pass applied when any axis is weak or missing.
- **Multi section IA:** No dead nav destinations; stubs must be real empty states with a next action, or the item must be removed from nav.
- **Adaptive density:** Primary canvas does not leave a large empty void without a deliberate fill choice.
- **Kit present:** Discovery from `kit.md` done; chrome uses registry components and kit tokens, not a parallel stack.
- **UI copy:** User-facing English strings follow UI copy constraints; allowed exceptions only as listed above.
- If structure scores are weak, fix hierarchy or task clarity before paint (color, glow, or decorative motion).

## Anti goals

- Fashion cloning from external showcase galleries
- Taste only or trend based findings with no task, risk, or operability impact
- Stack religion (no required framework)
- Generic AI template aesthetics (marketing or workspace flavors)
- Default dark enterprise dashboard with cyan accent and flat type as the whole identity
- Equal weight KPI wallpaper with no triage or decision model
- Sparse tables or canvases floating in unused viewport with no adaptive fill choice
- Overbuilding layout systems for a simple page
- Freeform UI opinions that skip the critique contract
- Inventing parallel chrome when Default File UI already covers the need
- Using a promotional landing as a template for a logged in admin
- Using a dense admin as a template for a brand campaign hero
- Treating a problem brief as a prompt to copy a generic dashboard template
