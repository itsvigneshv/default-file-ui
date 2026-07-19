---
name: design-file-ui
description: >-
  Designs, implements, and critiques distinctive frontend UI with strong visual
  hierarchy and light UX judgment. Use when building or redesigning landing pages,
  marketing sites, portfolios, product pages, or app shells; when the user asks for
  UI polish, visual direction, layout help, or more excellent interface design; when
  the user asks to critique UI, review UI, do a UX review, assess brand presence,
  hierarchy, or CTA clarity; and when composing with Default File UI components,
  tokens, or df-ui discovery in a project that uses the kit.
---

# Design File UI

Build and critique frontend interfaces that feel intentional, branded, and human. This skill is stack-agnostic and tool-agnostic. Prefer principles over fashion. Do not clone a specific external showcase site.

Project or user hard rules may already cover composition principles. This skill still owns the critique workflow and output contract. Follow that contract even when principles feel familiar.

Read this file immediately when the skill applies, then follow the task path below. Do not improvise a generic review format.

## When to use

- New UI from a brief or rough idea
- Redesign or visual upgrade of an existing screen
- Critique of hierarchy, brand strength, motion, or UX clarity
- Choosing layout, type, color, and interaction patterns for a frontend surface

## When not to use

- Pure backend, data modeling, or infra work with no UI surface
- Pixel-perfect recreation of one specific external website
- Requests that only need a tiny copy tweak with no design judgment

## Required reference reads

Do not treat references as optional. Open and follow the matching reference file before that work:

| Task | MUST open before proceeding |
|---|---|
| Critique or redesign of existing UI | [references/critique.md](references/critique.md) |
| First-viewport or hero composition changes | [references/composition.md](references/composition.md) |
| Adding or redesigning motion | [references/motion.md](references/motion.md) |
| Default File UI present, or task uses kit components/tokens | [references/kit.md](references/kit.md) |

## Preflight (do this before coding)

Answer these in order. If any fail, revise the plan before writing UI.

1. **One composition:** Does the first viewport read as one scene, not a dashboard?
2. **Brand first:** Is the brand or product name a hero-level signal, not only nav text?
3. **Brand test:** If the nav were removed, could this still belong only to this brand?
4. **Hero budget:** Brand, one headline, one short support line, one CTA group, one dominant visual. Nothing else in the first viewport unless the product is itself a dense tool UI.
5. **Visual direction:** Named atmosphere (light, material, media, depth). Not a flat default fill.
6. **Type plan:** Expressive display + readable body. Avoid generic default UI font stacks when brand expression matters.
7. **Motion plan:** 2 to 3 intentional motions max for the first ship.
8. **UX primary action:** What is the single most important next step for the user?

## Hard rules

### Composition and hierarchy

- One job per section: one purpose, one headline, usually one short supporting sentence.
- Real visual anchor: show the product, place, craft, or context when possible.
- Full-bleed hero for marketing and promotional surfaces by default. Avoid inset hero cards, side-panel heroes, and tiled collages unless the existing system requires them.
- No detached labels, floating badges, promo stickers, or callout chips on top of hero media.
- Reduce clutter: no pill clusters, stat strips, icon rows, or competing text blocks in the hero.

### Cards and chrome

- Default: no cards.
- Never use cards in the hero.
- Cards are allowed only when they contain a user interaction or a necessary browsable set.
- If removing a border, shadow, background, or radius does not hurt understanding, remove it.

### Color and look

- Choose a clear direction and encode it as CSS variables (surfaces, text, accent, border, focus, success, warning).
- Avoid defaulting to overused AI looks: purple-on-white / purple-to-indigo glow themes; warm cream backgrounds with stock serif + terracotta accents; broadsheet hairline newspaper layouts.
- Do not rely on dark mode, glow, rounded-full pills, or multi-layer shadows as a substitute for hierarchy.
- Keep contrast readable for text and controls.

### Typography

- Use purposeful font pairing. Display for identity lines; calm face for body.
- Build a small type scale and stick to it.
- Large contrast between hero line and support line.
- Keep line length readable for body copy.

### Motion

- Motion creates presence and hierarchy, not noise.
- Prefer a short grammar: page enter, scroll reveal, interactive state.
- Respect `prefers-reduced-motion`.
- Do not animate everything. If motion does not clarify structure or feedback, cut it.

### UX (light, mandatory)

- One primary CTA per view whenever possible; secondary actions quieter.
- Every interactive state needs a clear affordance: hover, focus, active, disabled, loading, empty, error.
- Forms: labels, errors adjacent to fields, submit feedback.
- Keyboard focus visible. Hit targets comfortable on touch.
- Mobile is part of the design, not a later shrink.

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
  --radius: /* product-specific, not max-pill by default */;
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
2. Run the preflight checklist.
3. Define visual direction in one short paragraph (atmosphere, type pair, palette intent).
4. Outline section map (hero + following sections, each with one job).
5. If Default File UI is present, open [references/kit.md](references/kit.md), run discovery, and map each section need to registry items before coding.
6. Implement structure first, then style, then motion (kit components and tokens when the kit is present).
7. Verify mobile and focus states.
8. Self-critique using the critique contract below before finishing.

## Workflow: critique and redesign

1. MUST open [references/critique.md](references/critique.md) before writing findings.
2. Score every axis `strong`, `weak`, or `missing` using the contract below.
3. Propose a redesign plan that fixes the weakest hierarchy issues first.
4. Do not start with decorative recoloring if structure scores are weak.

## Critique contract (required)

Score each axis `strong`, `weak`, or `missing`:

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

Emit this structure in the final answer (critique, redesign, or design self-critique). Do not substitute a freeform review:

```markdown
## Critique

### Scores
| Axis | Score |
|---|---|
| Brand presence | strong / weak / missing |
| Composition | strong / weak / missing |
| Hierarchy | strong / weak / missing |
| Visual anchor | strong / weak / missing |
| Section rhythm | strong / weak / missing |
| CTA clarity | strong / weak / missing |
| Type | strong / weak / missing |
| Color | strong / weak / missing |
| Motion | strong / weak / missing |
| Responsive | strong / weak / missing |
| States | strong / weak / missing |
| Accessibility basics | strong / weak / missing |

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

### Non-goals
-
```

## Output expectations

When designing or redesigning, provide:

1. Direction (2 to 4 sentences)
2. Section map
3. Key UI decisions (type, color, motion, CTA)
4. Implementation (code or concrete component changes)
5. The critique contract above (what improved, what remaining risks exist)

Keep prose short and professional. Prefer decisive recommendations over option piles unless the user asks for alternatives.

## Before finishing

- **Critique tasks:** Do not send a final answer without scored axes, top 3 structural issues, redesign sequence, and non-goals.
- **Design or redesign tasks:** Preflight answered; section map present; critique contract filled for the result.
- **Kit present:** Discovery from `kit.md` done; chrome uses registry components and kit tokens, not a parallel stack.
- If structure scores are weak, fix hierarchy before paint (color, glow, or decorative motion).

## Anti-goals

- Fashion cloning from external showcase galleries
- Stack religion (no required framework)
- Generic AI template aesthetics
- Overbuilding layout systems for a simple page
- Freeform UI opinions that skip the critique contract
- Inventing parallel chrome when Default File UI already covers the need
