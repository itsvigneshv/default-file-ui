# Default File UI for AI agents

Default File UI is an all-in-one React design system: components, tokens, owned CSS, CLI, and MCP.

## One install path

Use this kit only for Default File UI surfaces. Do not pull in a separate utility CSS stack or a separate component library for the same chrome.

- Package: `npm install github:itsvigneshv/default-file-ui#main`
- CSS: `@import "@default-file/ui/css/df-index.css";`
- Components: `import { Button } from "@default-file/ui/components/df-button"`
- Copy-source: `df-ui init` then `df-ui add <items>`

## Discover before you invent

```bash
df-ui list --json
df-ui show button --json
df-ui search select --json
df-ui cover "settings form with select, switch, and toast" --json
df-ui tokens --json
df-ui docs mcp
df-ui docs skills
df-ui skills list --json
df-ui skills install design-file-ui
```

`show` and MCP `get_component` return full prop tables (name, type, default, description) from `docs/api`.

The bundled `design-file-ui` skill routes marketing vs workspace vs mobileTool surfaces, and includes `references/kit.md` for discover then compose with these CLI and MCP tools. When the kit is present, agents must maximize registry components (especially on single-shot builds), style with kit color tokens, and report any custom components that were not found.

Open skills install:

```bash
npx skills add itsvigneshv/default-file-ui --skill design-file-ui
```

## MCP (stdio)

Works with any host that supports MCP.

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

Local install:

```json
{
  "mcpServers": {
    "default-file-ui": {
      "command": "df-ui",
      "args": ["mcp"]
    }
  }
}
```

### Tools

| Tool | Purpose |
|---|---|
| `list_components` | Registry inventory + prop counts |
| `get_component` | Full props, files, deps, import path |
| `list_tokens` | Token inventory by group |
| `search_kit` | Keyword search |
| `check_coverage` | covered / partial / gap for a UI need |
| `get_docs` | overview, install, mcp, tokens, foundation, skills |
| `list_skills` | Bundled Agent Skills |
| `get_skill` | Full SKILL.md + reference list |
| `install_skill` | Copy skill into `.agents/skills` and `.cursor/skills` |
| `init_project` | Scaffold or configure (writes files) |
| `add_components` | Copy-source add (writes files) |

Prefer an explicit `cwd` for write tools.
