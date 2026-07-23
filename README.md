# Default File UI

Owned design system for Default File: color scales, tokens, components, and motion. Use it in your own projects.

## Quick start (CLI)

Scaffold a new app with Default File UI already wired:

```bash
npx --yes -p github:itsvigneshv/default-file-ui#main df-ui init -t next
```

Templates: `next`, `vite`, `react-router`, `tanstack-start`, `astro`, `react`.

Configure an existing React app (also writes `df.json`, the project map):

```bash
npx --yes -p github:itsvigneshv/default-file-ui#main df-ui init
```

Add components (copy-source) into your app, resolving dependencies:

```bash
npx --yes -p github:itsvigneshv/default-file-ui#main df-ui add button
```

Inspect the detected framework and `df.json`:

```bash
npx --yes -p github:itsvigneshv/default-file-ui#main df-ui info
```

Discover the kit (human or agent):

```bash
df-ui list --json
df-ui show button --json
df-ui search "toast select" --json
df-ui cover "settings form with select, switch, and toast" --json
df-ui tokens --group radius --json
df-ui docs colors
df-ui docs overview
df-ui skills list --json
df-ui skills install design-file-ui
```

Agent skill (skills.sh-compatible):

```bash
npx skills add itsvigneshv/default-file-ui --skill design-file-ui
```

`show` returns full prop tables from `docs/api` (name, type, default, description).

Commands honor the active package manager. With pnpm, yarn, or bun use the
matching runner (`pnpm dlx`, `yarn dlx`, `bunx`). Pass `--color-scale compact`
to `init` to record a compact scale in `df.json`.

## MCP for AI hosts

Stdio MCP so any host that supports MCP can inspect and install the kit:

```bash
df-ui mcp
```

Example host config:

```json
{
  "mcpServers": {
    "default-file-ui": {
      "command": "npx",
      "args": [
        "--yes",
        "-p",
        "github:itsvigneshv/default-file-ui#main",
        "df-ui",
        "mcp"
      ]
    }
  }
}
```

Tools: `list_components`, `get_component`, `list_tokens`, `search_kit`, `check_coverage`, `get_docs`, `list_skills`, `get_skill`, `install_skill`, `init_project`, `add_components`.

Agent brief: [docs/agents.md](./docs/agents.md).

## Color system

Install color scales, semantic tokens, and utilities without components.

Package entry:

```bash
npm install github:itsvigneshv/default-file-ui#main
```

```css
@import "@default-file/ui/css/df-color-system.css";
```

Copy-source:

```bash
df-ui add color-system
```

```css
@import "@/default-file-ui/css/df-color-system.css";
```

Component peer packages are optional when you only import the color system CSS. See `df-ui docs colors` and `df-ui tokens --group color-scale`.

## Install (full kit)

```bash
npm install github:itsvigneshv/default-file-ui#main
```

Component peers: `react`, `react-dom`, `lucide-react` (and `rough-notation` for TextMark).

```css
@import "@default-file/ui/css/df-index.css";
```

```ts
import { Button } from "@default-file/ui/components/df-button"
```

`df-index.css` includes the color system, plus reset, animations, and component styles.

## Registry (copy source)

Root `registry.json` lists installable items. Built payloads live under `public/r/` after `npm run df:registry`.

GitHub registry path: `itsvigneshv/default-file-ui/<item>`

| Item | Purpose |
|---|---|
| `color-system` | Scales, tokens, utilities |
| `foundation` | Kit CSS entry, component styles, hooks, `cn` (depends on `color-system`) |
| component names | UI primitives (each depends on `foundation`) |

Machine-readable prop docs: `docs/api/`. Catalogue metadata: `docs/catalog.json`.

## Color scale modes

Primitive scales always define both palettes with an infix density marker:

- `--df-neutral-detailed-500`
- `--df-neutral-compact-500`

Unscoped aliases (`--df-neutral-500`) follow the mode on `<html>`:

- `data-df-color-scale="detailed"` (default): aliases point at detailed
- `data-df-color-scale="compact"`: aliases point at compact

Utility classes (`bg-neutral-500`, etc.) use the unscoped aliases, so they
follow the host mode. Use the infix tokens when you need a specific palette
regardless of mode.

## Token layers

Primitives live under `--df-*` (scales for color, type, space, radius, shadow, motion, opacity, z-index, control sizes, breakpoints, touch targets). Semantic tokens (`--background`, `--border`, `--overlay-*`, `--brand-ink`, `--z-overlay`, ...) name intent and point at primitives. Kit CSS and components resolve chrome through these vars only.

Responsive tokens and utilities:

- Breakpoints: `--df-breakpoint-sm` to `--df-breakpoint-3xl` (from `BREAKPOINTS` in `scripts/df-theme.mjs`).
- Utility variants: `sm:` to `3xl:` (min-width), `max-sm:` to `max-3xl:` (max-width), `@sm:` to `@3xl:` and `@container`.
- Touch targets: `--df-touch-target-min`, `--df-touch-target-comfortable`.
- Density: host `data-df-density` (`cozy`, `comfortable`, or `compact`) sets `--df-control-height-*`. Related sizes use `--df-affordance-size-*`, `--df-slider-track-height`, `--df-tabs-segment-min-height-*`, and `--df-switch-track-*`. Authors use semantic `size` props (`default` or `md` for mid-size by family). Color-scale `compact` is palette-only.
- Safe-area: `--df-safe-area-inset-*`. Hosts compose `--df-overlay-inset-top` and `--df-overlay-inset-bottom` with sticky chrome.

## License

Licensed under the MIT license.
