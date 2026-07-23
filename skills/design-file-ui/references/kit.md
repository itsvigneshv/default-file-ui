# Default File UI kit usage

Use this playbook when the project includes Default File UI. Discover live registry data; do not paste a stale catalog from memory or recreate covered controls by hand.

## Detect the kit

Treat Default File UI as present when any of these are true:

- `@default-file/ui` appears in `package.json` dependencies or the app imports from `@default-file/ui/...`
- `df.json` exists (copy source / CLI project config)
- `df-ui` CLI or the Default File UI MCP server is available

If none apply, skip this file and use the agnostic implementation path in `SKILL.md`.

## Maximize kit coverage (required)

When Default File UI is present, **use as many registry components as the UI need allows**. Discovery is mandatory before inventing chrome.

This matters most on **single-shot builds** (one prompt that asks to build a full page, flow, or app). On those asks, map the whole surface to kit items first. Do not freehand a full custom component tree when registry items already cover the controls.

When the user names specific kit components to add or compose, follow that list and still discover props/tokens with `show` / `get_component`.

## Discover before you invent

Preferred order (CLI or matching MCP tools):

1. **Coverage:** `df-ui cover "<UI need>"` / MCP `check_coverage`
2. **Search:** `df-ui search <keyword>` / `search_kit`
3. **Component detail:** `df-ui show <name>` / `get_component` (props, defaults, import path, files, deps)
4. **Tokens:** `df-ui tokens` / `list_tokens` for chrome values (color, space, type, radius, motion)
5. **Docs:** `df-ui docs foundation` (or `install` / `tokens`) / MCP `get_docs` when CSS entry or packaging is unclear

Optional inventory: `df-ui list` / `list_components`.

Map each section of the UI to registry items before writing new chrome. Prefer `covered` or `partial` matches from `cover` over custom controls.

For a single-shot build, run coverage (or search) against the full brief, then against each major region (nav, form, table, dialogs, toasts, and similar) so gaps are real registry gaps, not skipped discovery.

## When a control is missing

If discovery returns `gap` (or no useful `partial` / `covered` match) after `cover` and `search`:

1. You may create a custom or local component for that need.
2. Theme it with kit tokens and utilities when possible so it still fits the system.
3. **Report every custom creation to the user** before finishing (see report contract below).

Do not silently invent a custom Button, Input, Select, Dialog, Toast, Switch, Tabs, or other control that already exists in the registry.

## Custom component report (required)

Whenever you add any component, primitive, or control that is **not** a Default File UI registry item (package import or `df-ui add` copy), tell the user in the final answer.

Emit a short section:

```md
## Components not in Default File UI

- `<Name>` — needed for <purpose>; not found via `cover` / `search` (or no matching registry item). Created custom.
```

Rules:

- List every new custom component or significant custom control you introduced.
- If you created none, omit the section (or state that all interactive chrome came from the kit).
- On single-shot builds, this report is mandatory whenever any custom chrome was added.
- Saying "used the design system" is not enough if custom controls were also invented.

## Compose rules

- Prefer registry components for interactive chrome (buttons, inputs, selects, dialogs, menus, toasts, and similar).
- Theme UI chrome with semantic utilities and `var(--...)` tokens from the kit. Do not hardcode design literals for surfaces, type sizes, radii, borders, or shadows.
- In package mode, import from `@default-file/ui/components/df-*` and ensure kit CSS is loaded (`@import "@default-file/ui/css/df-index.css"` or the project's existing kit CSS entry).
- In copy source mode, install missing items with `df-ui add <items>` / MCP `add_components` before recreating them by hand.
- Keep composition and hierarchy decisions from `SKILL.md` for the classified surface mode. The kit supplies parts; it does not replace mode routing, marketing hero rules, workspace shell rules, or critique contracts.
- For workspace needs, discover tables, inputs, selects, dialogs, menus, sheets, and related registry items before inventing data or form chrome.

## Import pattern

```ts
import { Button } from "@default-file/ui/components/df-button"
```

Use the `importPath` from `df-ui show <name>` when unsure. Respect registry dependencies returned by `show` / `get_component`.

## Anti goals

- Hardcoded hex, px, rem, or raw shadows for kit chrome
- Hand-rolling controls that already exist in the registry
- Skipping discovery on a single-shot build and inventing a full custom chrome set
- Creating custom components without reporting them to the user
- Skipping discovery and guessing prop names or variants from memory
