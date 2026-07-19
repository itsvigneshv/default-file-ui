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

## Install (package)

```bash
npm install github:itsvigneshv/default-file-ui#main
```

Peer deps: `react`, `react-dom`, `lucide-react`.

Import CSS once:

```css
@import "@default-file/ui/css/df-index.css";
```

Import components:

```ts
import { Button } from "@default-file/ui/components/df-button"
```

## Registry (copy source)

Root `registry.json` lists installable items. Built payloads live under `public/r/` after `npm run df:registry`.

Install path for registry consumers that accept a GitHub source:

`itsvigneshv/default-file-ui/<item>`

Machine-readable prop docs for agents live under `docs/api/`. Catalogue chapter metadata is in `docs/catalog.json`.

## One kit path

Components, tokens, and owned CSS ship together. For Default File UI surfaces, prefer this package (or `df-ui add` copy-source) instead of combining a separate styling stack with a separate component kit.

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

- Breakpoint CSS vars `--df-breakpoint-sm` to `--df-breakpoint-3xl` are generated from `BREAKPOINTS` in `scripts/df-theme.mjs`.
- Utility variants: viewport `sm:` to `3xl:` (min-width), `max-sm:` to `max-3xl:` (max-width), and container `@sm:` to `@3xl:` plus `@container` (`container-type: inline-size`).
- Touch targets: `--df-touch-target-min`, `--df-touch-target-comfortable`.
- Control density: host `data-df-density` (`cozy` default, `comfortable`, or `compact`) sets `--df-control-height-*`. Color-scale `compact` is palette-only and separate from control density.
- Safe-area: `--df-safe-area-inset-*` maps to `env(safe-area-inset-*, 0px)`. Hosts compose `--df-overlay-inset-top` and `--df-overlay-inset-bottom` from sticky chrome and these tokens.

## License

Licensed under the MIT license.
