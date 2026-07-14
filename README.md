# Default File UI

Owned design system for Default File. Color scales, tokens, components, and motion. Open source. Open code. Use this to build on Default File UI in your own projects.

## Quick start (CLI)

Scaffold a new app with Default File UI already wired:

```bash
npx --yes -p github:itsvigneshv/default-file-ui#main df-ui init -t next
```

Templates: `next`, `vite`, `react-router`, `tanstack-start`, `astro`, `react`.

Configure an existing React app:

```bash
npx --yes -p github:itsvigneshv/default-file-ui#main df-ui init
```

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

Install path for catalog tools that support GitHub registries:

`itsvigneshv/default-file-ui/<item>`

## Color scale modes

Set on `<html>`:

- `data-df-color-scale="detailed"` (default): fine neutral steps
- `data-df-color-scale="compact"`: usual anchors

## License

Licensed under the MIT license.
