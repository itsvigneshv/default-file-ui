# Default File UI kit usage

Use this playbook when the project includes Default File UI. Discover live registry data; do not invent a parallel component set or paste a stale catalog from memory.

## Detect the kit

Treat Default File UI as present when any of these are true:

- `@default-file/ui` appears in `package.json` dependencies or the app imports from `@default-file/ui/...`
- `df.json` exists (copy-source / CLI project config)
- `df-ui` CLI or the Default File UI MCP server is available

If none apply, skip this file and use the agnostic implementation path in `SKILL.md`.

## Discover before you invent

Preferred order (CLI or matching MCP tools):

1. **Coverage:** `df-ui cover "<UI need>"` / MCP `check_coverage`
2. **Search:** `df-ui search <keyword>` / `search_kit`
3. **Component detail:** `df-ui show <name>` / `get_component` (props, defaults, import path, files, deps)
4. **Tokens:** `df-ui tokens` / `list_tokens` for chrome values (color, space, type, radius, motion)
5. **Docs:** `df-ui docs foundation` (or `install` / `tokens`) / MCP `get_docs` when CSS entry or packaging is unclear

Optional inventory: `df-ui list` / `list_components`.

Map each section of the UI to registry items before writing new chrome. Prefer `covered` or `partial` matches from `cover` over custom controls.

## Compose rules

- Prefer registry components for interactive chrome (buttons, inputs, selects, dialogs, menus, toasts, and similar).
- Theme UI chrome with semantic utilities and `var(--...)` tokens from the kit. Do not hardcode design literals for surfaces, type sizes, radii, borders, or shadows.
- Do not introduce a second component library or utility CSS stack for the same surfaces.
- In package mode, import from `@default-file/ui/components/df-*` and ensure kit CSS is loaded (`@import "@default-file/ui/css/df-index.css"` or the project's existing kit CSS entry).
- In copy-source mode, install missing items with `df-ui add <items>` / MCP `add_components` before recreating them by hand.
- Keep composition and hierarchy decisions from `SKILL.md`. The kit supplies parts; it does not replace brand, hero budget, or critique rules.

## Import pattern

```ts
import { Button } from "@default-file/ui/components/df-button"
```

Use the `importPath` from `df-ui show <name>` when unsure. Respect registry dependencies returned by `show` / `get_component`.

## Anti-goals

- Hardcoded hex, px, rem, or raw shadows for kit chrome
- Recreating kit primitives under an app `components/ui` (or similar) tree
- Inventing a second design system alongside Default File UI for the same product surface
- Skipping discovery and guessing prop names or variants from memory
