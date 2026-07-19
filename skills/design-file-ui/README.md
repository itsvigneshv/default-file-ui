# Design File UI skill

Portable Agent Skill for designing, implementing, and critiquing excellent frontend UI. Tool-agnostic and stack-agnostic. When Default File UI is present in a project, prefer kit discovery before inventing chrome.

**Canonical source for publish:** this folder (`skills/design-file-ui/` inside `@default-file/ui`).

## Install (any Agent Skills-compatible tool)

```bash
# Open skills ecosystem
npx skills add itsvigneshv/default-file-ui --skill design-file-ui

# Kit CLI
df-ui skills install design-file-ui
```

Install targets depend on the consumer tool (for example `.agents/skills/`). Do not treat any one editor path as required.

## Manual invoke examples

- `/design-file-ui`
- "Redesign this landing page using the Design File UI skill"
- "Critique this UI for brand hierarchy and CTA clarity"

## Routing validation matrix

Use these prompts in a fresh agent turn after install. Pass only if the skill attaches and the output meets the gate.

| Prompt type | Example | Pass if |
|---|---|---|
| Critique | Critique this UI for brand hierarchy and CTA clarity | Skill attached; scores table + top 3 structural issues + redesign sequence + non-goals |
| Redesign | Redesign this landing page using the Design File UI skill | Preflight + section map + critique contract on the result |
| Ambiguous polish | Make this page look better | Skill still routes; critic or preflight appears (not a freeform paint-only pass) |

## Adherence notes

- Critique and redesign must load `references/critique.md` before findings.
- The critique output contract is inlined in `SKILL.md` so the format cannot be skipped.
- Composition and motion references are mandatory for hero and motion work respectively.
- When Default File UI is present, open `references/kit.md` and discover components/tokens before inventing chrome.
