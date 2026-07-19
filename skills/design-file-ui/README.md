# Design File UI skill

Portable Agent Skill for designing, implementing, and critiquing excellent frontend UI. Covers marketing and promotional surfaces and workspace tools (dashboards, admin, data UI, mobile tool shells). Tool agnostic and stack agnostic. When Default File UI is present in a project, prefer kit discovery before inventing chrome.

**Canonical source for publish:** this folder (`skills/design-file-ui/` inside `@default-file/ui`).

## UI copy rule

When the skill builds frontend UI, user-facing strings must not contain hyphens, em dashes, or en dashes. See **UI copy constraints** in `SKILL.md`.

## Install (any Agent Skills compatible tool)

```bash
# Open skills ecosystem
npx skills add itsvigneshv/default-file-ui --skill design-file-ui

# Kit CLI
df-ui skills install design-file-ui
```

Install targets depend on the consumer tool (for example `.agents/skills/`). Do not treat any one editor path as required.

## Surface modes

The skill must classify one mode before preflight:

| Mode | Example ask |
|---|---|
| `marketing` | Redesign this landing page / award style pitch |
| `workspace` | Design a SaaS billing admin / analytics dashboard |
| `mobileTool` | Build a mobile web triage app |

## Manual invoke examples

- `/design-file-ui`
- "Redesign this landing page using the Design File UI skill"
- "Critique this UI for brand hierarchy and CTA clarity"
- "Design a SaaS admin for managing invoices"
- "Critique this dashboard for task clarity and density"
- "Build a mobile web app shell for support triage"

## Routing validation matrix

Use these prompts in a fresh agent turn after install. Pass only if the skill attaches, mode is correct, and the output meets the gate.

| Prompt type | Example | Pass if |
|---|---|---|
| Marketing critique | Critique this UI for brand hierarchy and CTA clarity | Mode marketing; marketing scores + top 3 structural + sequence + non goals |
| Marketing redesign | Redesign this landing page using the Design File UI skill | Mode marketing; preflight + section map + critique contract |
| Workspace design | Design a SaaS billing admin with invoice table and filters | Mode workspace; shell map + workspace preflight + workspace critique axes |
| Mobile tool | Build a mobile web triage app for support tickets | Mode mobileTool; region plan + responsive app rules |
| Ambiguous polish | Make this page look better | Mode classified from context; finish gate blocks paint only freeform |

## Adherence notes

- Critique and redesign must load `references/critique.md` before findings.
- The critique output contract is inlined in `SKILL.md` so the format cannot be skipped.
- Composition reference is marketing only; workspace work must load `workspace.md`.
- Cards, app patterns, and responsive app references are mandatory for those tasks.
- When Default File UI is present, open `references/kit.md` and discover components/tokens before inventing chrome.

## Research sources

- Marketing corpus: `research/awards-ui/` (in the UX Tools app repo when developing locally)
- Workspace corpus: `research/workspace-ui/`
