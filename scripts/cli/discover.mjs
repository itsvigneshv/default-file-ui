import fs from "node:fs"

import { kitFileExists, kitPath, readKitJson } from "./kit-root.mjs"

/** Capability tags used by search and coverage matching. */
const CHAPTER_TAGS = {
  actions: ["action", "button", "cta", "submit", "click"],
  inputs: [
    "form",
    "input",
    "field",
    "control",
    "select",
    "toggle",
    "switch",
    "slider",
    "checkbox",
    "radio",
    "search",
    "filter",
  ],
  feedback: ["toast", "message", "alert", "status", "badge", "tooltip", "hint"],
  overlays: ["popover", "menu", "dropdown", "panel", "modal", "dialog", "overlay"],
  structure: ["layout", "section", "tabs", "separator", "scroll", "card", "text"],
  chrome: ["toolbar", "dock", "floating", "tool", "controls", "bar"],
}

const NEED_SYNONYMS = [
  {
    patterns: /\b(modal|dialog|drawer|sheet)\b/i,
    gap: "Dedicated modal, dialog, drawer, or sheet primitive",
    suggestion:
      "Compose overlays with popover or options-panel, or build a custom dialog on kit tokens.",
    related: ["popover", "options-panel", "overlay-hint"],
  },
  {
    patterns: /\b(table|data.?grid|datagrid)\b/i,
    gap: "Table or data-grid primitive",
    suggestion: "Build tables with owned markup and kit tokens (text, border, muted).",
    related: ["scroll-area", "separator", "badge"],
  },
  {
    patterns: /\b(checkbox|radio)\b/i,
    gap: "Standalone checkbox or radio primitive",
    suggestion: "Use choice-chip, toggle-group, content-switcher, or select/option-list for choices.",
    related: ["choice-chip", "toggle-group", "content-switcher", "select", "option-list"],
  },
  {
    patterns: /\b(collapse|disclosure)\b/i,
    gap: "Standalone disclosure primitive outside Accordion",
    suggestion: "Use accordion for expandable sections, or compose with panel-section for custom shells.",
    related: ["accordion", "panel-section", "separator"],
  },
  {
    patterns: /\b(avatar|breadcrumb|pagination|skeleton|progress|spinner)\b/i,
    gap: "Specialty chrome not yet in the registry",
    suggestion: "Compose with badge, separator, and kit tokens, or request a registry item.",
    related: ["badge", "separator", "overlay-hint"],
  },
]

let cached = null

function loadBundle() {
  if (cached) return cached

  const registry = readKitJson("registry.json")
  const catalog = kitFileExists("docs", "catalog.json")
    ? readKitJson("docs", "catalog.json")
    : null
  const apiIndex = kitFileExists("docs", "api", "index.json")
    ? readKitJson("docs", "api", "index.json")
    : null

  const catalogByName = new Map(
    (catalog?.components ?? []).map((item) => [item.name, item])
  )

  const items = (registry.items ?? []).map((item) => {
    const meta = catalogByName.get(item.name)
    const chapter = meta?.chapter ?? (item.type === "registry:style" ? "foundation" : null)
    const title = item.title ?? meta?.title ?? item.name
    const description = item.description ?? meta?.description ?? ""
    const tags = buildTags(item, meta, chapter, title, description)
    const coverTerms = buildCoverTerms(item.name, title, chapter)
    return {
      name: item.name,
      type: item.type,
      title,
      description,
      chapter,
      registryDependencies: item.registryDependencies ?? meta?.registryDependencies ?? [],
      dependencies: item.dependencies ?? meta?.dependencies ?? [],
      files: (item.files ?? []).map((file) => ({
        path: file.path,
        target: file.target,
        type: file.type,
      })),
      importPath: meta?.importPath ?? null,
      propCount: meta?.propCount ?? 0,
      tags,
      coverTerms,
    }
  })

  cached = { registry, catalog, apiIndex, items, byName: new Map(items.map((i) => [i.name, i])) }
  return cached
}

function buildTags(item, meta, chapter, title, description) {
  const tags = new Set()
  tags.add(item.name)
  if (item.type) tags.add(item.type.replace(/^registry:/, ""))
  if (chapter) {
    tags.add(chapter)
    for (const tag of CHAPTER_TAGS[chapter] ?? []) tags.add(tag)
  }
  for (const word of `${title} ${description}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)) {
    tags.add(word)
  }
  return [...tags]
}

/** Tight terms for coverage: name parts, title words, chapter labels only. */
function buildCoverTerms(name, title, chapter) {
  const terms = new Set()
  terms.add(name)
  for (const part of name.split("-").filter((w) => w.length > 2)) terms.add(part)
  for (const word of title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)) {
    terms.add(word)
  }
  if (chapter) terms.add(chapter)
  return [...terms]
}

/** List registry items, optionally filtered by type or chapter. */
export function listComponents({ type, chapter } = {}) {
  const { items } = loadBundle()
  return items.filter((item) => {
    if (type && item.type !== type && item.type !== `registry:${type}`) return false
    if (chapter && item.chapter !== chapter) return false
    return true
  })
}

/** Load prop API JSON for a registry item, or null when missing. */
export function loadComponentApi(name) {
  const slug = name
  if (!kitFileExists("docs", "api", `${slug}.json`)) return null
  return readKitJson("docs", "api", `${slug}.json`)
}

/** Registry item plus prop API when docs/api/<name>.json exists. */
export function showComponent(name) {
  const { byName } = loadBundle()
  const item = byName.get(name)
  if (!item) return null
  const apiDoc = loadComponentApi(name)
  return {
    ...item,
    api: apiDoc?.api ?? null,
    docsDescription: apiDoc?.description ?? item.description,
  }
}

/** Ranked keyword search over names, titles, descriptions, and tags. */
export function searchKit(query, { limit = 20 } = {}) {
  const q = String(query ?? "").trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/[^a-z0-9]+/).filter(Boolean)
  const { items } = loadBundle()

  const scored = items
    .map((item) => {
      const hay = [
        item.name,
        item.title,
        item.description,
        item.chapter ?? "",
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase()
      let score = 0
      if (item.name === q) score += 100
      if (item.name.includes(q)) score += 40
      if (item.title.toLowerCase().includes(q)) score += 30
      for (const term of terms) {
        if (item.name.includes(term)) score += 12
        if (hay.includes(term)) score += 4
        if (item.tags.includes(term)) score += 6
      }
      return { item, score }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))

  return scored.slice(0, limit).map((row) => ({
    name: row.item.name,
    title: row.item.title,
    type: row.item.type,
    chapter: row.item.chapter,
    description: row.item.description,
    score: row.score,
    propCount: row.item.propCount,
  }))
}

function matchNeedToItems(needText, items) {
  const text = needText.toLowerCase()
  const terms = new Set(text.split(/[^a-z0-9]+/).filter((t) => t.length > 2))
  const matched = []

  for (const item of items) {
    if (item.name === "foundation") continue
    let reason = null
    if (terms.has(item.name) || text.includes(item.name.replace(/-/g, " "))) {
      reason = `Named ${item.title}`
    } else {
      for (const term of item.coverTerms ?? []) {
        if (term === item.chapter) continue
        if (terms.has(term)) {
          reason = `Matches ${term}`
          break
        }
      }
    }
    if (reason) matched.push({ name: item.name, title: item.title, reason })
  }

  // Stable unique by name
  const seen = new Set()
  return matched.filter((row) => {
    if (seen.has(row.name)) return false
    seen.add(row.name)
    return true
  })
}

/** Coverage report for a free-text UI need (covered, partial, or gap). */
export function checkCoverage(need) {
  const query = String(need ?? "").trim()
  const { items, byName } = loadBundle()
  const matched = matchNeedToItems(query, items)
  const gaps = []

  for (const rule of NEED_SYNONYMS) {
    if (!rule.patterns.test(query)) continue
    // Record a gap when the need matches and the kit has no dedicated item.
    const dedicatedMissing = !items.some((item) => rule.patterns.test(item.name))
    if (dedicatedMissing) {
      gaps.push({
        need: rule.gap,
        suggestion: rule.suggestion,
        related: rule.related.filter((name) => byName.has(name)),
      })
    }
  }

  // Form surfaces: suggest core form primitives when form-like language appears
  if (/\b(form|settings|profile|login|signup)\b/i.test(query)) {
    for (const name of ["input", "label", "button"]) {
      if (!matched.some((m) => m.name === name) && byName.has(name)) {
        matched.push({
          name,
          title: byName.get(name).title,
          reason: "Common form control",
        })
      }
    }
  }

  let status = "gap"
  if (matched.length > 0 && gaps.length === 0) status = "covered"
  else if (matched.length > 0) status = "partial"

  const installNames = matched.map((m) => m.name)
  return {
    query,
    status,
    matched,
    gaps,
    installHint:
      installNames.length > 0 ? `df-ui add ${installNames.join(" ")}` : null,
    summary:
      status === "covered"
        ? `Kit covers this surface with ${matched.length} item(s).`
        : status === "partial"
          ? `Kit partially covers this surface (${matched.length} match(es), ${gaps.length} gap(s)).`
          : "No strong registry matches. Review gaps and compose with foundation tokens.",
  }
}

/** Install, MCP, tokens, and foundation guidance shipped with the kit. */
export function getDocs(topic = "overview") {
  const key = String(topic || "overview").toLowerCase()
  const docs = {
    overview: {
      topic: "overview",
      title: "Default File UI",
      body: [
        "Default File UI is an all-in-one React design system: components, tokens, owned CSS, and install CLI.",
        "One install path. Do not add a separate utility CSS stack or a separate component kit for Default File UI surfaces.",
        "Package import: @import \"@default-file/ui/css/df-index.css\"; then import components from @default-file/ui/components/df-*.",
        "Copy-source: df-ui init, then df-ui add <items>. Foundation installs CSS, hooks, and cn.",
        "AI hosts: run df-ui mcp (stdio) to inspect components, props, tokens, coverage, skills, and install.",
      ].join("\n"),
    },
    install: {
      topic: "install",
      title: "Install",
      body: [
        "Scaffold: npx --yes -p github:itsvigneshv/default-file-ui#main df-ui init -t next",
        "Existing app: df-ui init (writes df.json; supports --framework, --color-scale, --radius, --corner-shape, --install-mode)",
        "Add components: df-ui add button select",
        "Agent skill: npx skills add itsvigneshv/default-file-ui --skill design-file-ui (or df-ui skills install design-file-ui)",
        "Package mode peers: react, react-dom, lucide-react",
        "CSS: @import \"@default-file/ui/css/df-index.css\";",
      ].join("\n"),
    },
    mcp: {
      topic: "mcp",
      title: "MCP",
      body: [
        "Start: df-ui mcp (stdio). Works with any MCP-capable host.",
        "Tools: list_components, get_component, list_tokens, search_kit, check_coverage, get_docs, list_skills, get_skill, install_skill, init_project, add_components.",
        "get_component returns full prop tables from docs/api when available.",
        "Host config example: command df-ui, args [\"mcp\"] (or npx -p github:itsvigneshv/default-file-ui#main df-ui mcp).",
      ].join("\n"),
    },
    skills: {
      topic: "skills",
      title: "Skills",
      body: [
        "Bundled Agent Skill: design-file-ui (principles for distinctive frontend UI).",
        "Open ecosystem: npx skills add itsvigneshv/default-file-ui --skill design-file-ui",
        "Kit CLI: df-ui skills list | show design-file-ui | install design-file-ui",
        "install copies into .agents/skills and .cursor/skills in the project.",
        "MCP: list_skills, get_skill, install_skill.",
      ].join("\n"),
    },
    tokens: {
      topic: "tokens",
      title: "Tokens",
      body: [
        "Primitives use --df-* names (color, type, space, radius, shadow, motion, opacity, z-index, control sizes).",
        "Semantic tokens (--background, --border, --brand-ink, ...) point at primitives.",
        "Color scale modes: data-df-color-scale=\"detailed\" (default) or \"compact\" on <html>.",
        "Use df-ui tokens to list machine-readable token names from the kit CSS.",
      ].join("\n"),
    },
    foundation: {
      topic: "foundation",
      title: "Foundation",
      body: [
        "Foundation is the registry:style item: CSS layers, tokens, hooks, and cn.",
        "Install first for copy-source setups: df-ui add foundation",
        "Package mode pulls the same CSS via @default-file/ui/css/df-index.css.",
      ].join("\n"),
    },
  }

  if (docs[key]) return docs[key]
  return {
    topic: key,
    title: "Unknown topic",
    body: `Unknown docs topic "${key}". Use one of: ${Object.keys(docs).join(", ")}.`,
    available: Object.keys(docs),
  }
}

/** High-level kit inventory for agents (counts, chapters, prop totals). */
export function kitSummary() {
  const { items, apiIndex } = loadBundle()
  const ui = items.filter((i) => i.type === "registry:ui")
  const totalProps = (apiIndex?.components ?? []).reduce(
    (n, c) => n + (c.propCount ?? 0),
    0
  )
  return {
    name: "@default-file/ui",
    itemCount: items.length,
    uiCount: ui.length,
    componentsWithApi: apiIndex?.components?.length ?? 0,
    totalProps,
    chapters: [...new Set(ui.map((i) => i.chapter).filter(Boolean))],
  }
}

/** Parse token CSS into grouped name lists for df-ui tokens. */
export function parseTokenIndex() {
  const tokensPath = kitPath("src", "css", "df-tokens.css")
  const scalesPath = kitPath("src", "css", "df-color-scales.css")
  const files = [tokensPath, scalesPath].filter((p) => fs.existsSync(p))
  const byGroup = new Map()

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, "utf8")
    const matches = text.matchAll(/--([a-zA-Z0-9-]+)\s*:/g)
    for (const match of matches) {
      const name = `--${match[1]}`
      const group = tokenGroup(name)
      if (!byGroup.has(group)) byGroup.set(group, new Set())
      byGroup.get(group).add(name)
    }
  }

  const groups = [...byGroup.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([group, set]) => ({
      group,
      count: set.size,
      tokens: [...set].sort(),
    }))

  return {
    source: ["src/css/df-tokens.css", "src/css/df-color-scales.css"],
    groupCount: groups.length,
    tokenCount: groups.reduce((n, g) => n + g.count, 0),
    groups,
  }
}

function tokenGroup(name) {
  if (name.startsWith("--df-neutral") || name.startsWith("--df-brand")) return "color-scale"
  if (
    [
      "--background",
      "--foreground",
      "--card",
      "--popover",
      "--primary",
      "--secondary",
      "--muted",
      "--accent",
      "--destructive",
      "--border",
      "--input",
      "--ring",
      "--brand-ink",
    ].some((prefix) => name === prefix || name.startsWith(`${prefix}-`))
  ) {
    return "semantic-color"
  }
  if (name.startsWith("--radius") || name.includes("corner-shape")) return "radius"
  if (name.startsWith("--df-text") || name.startsWith("--df-font")) return "typography"
  if (name.startsWith("--df-space") || name === "--spacing-unit") return "spacing"
  if (name.includes("shadow")) return "shadow"
  if (name.includes("ease") || name.includes("duration") || name.includes("motion")) {
    return "motion"
  }
  if (name.includes("opacity") || name.startsWith("--df-opacity")) return "opacity"
  if (name.startsWith("--z-") || name.includes("z-index") || name.startsWith("--df-z")) {
    return "z-index"
  }
  if (name.includes("control") || name.includes("touch")) return "control"
  if (name.includes("border-width") || name.includes("outline")) return "border"
  if (name.startsWith("--chart")) return "chart"
  if (name.startsWith("--df-")) return "df-primitive"
  return "other"
}

/** Token inventory by group. Pass includeTokens or a group to expand names. */
export function listTokens({ group, includeTokens = false } = {}) {
  const index = parseTokenIndex()
  const filtered = group
    ? index.groups.filter((g) => g.group === group)
    : index.groups
  // Full token arrays are large (color scales). Expand when a group is selected
  // or when includeTokens is true.
  const expand = Boolean(group) || includeTokens
  return {
    source: index.source,
    groupCount: filtered.length,
    tokenCount: filtered.reduce((n, g) => n + g.count, 0),
    groups: filtered.map((entry) =>
      expand
        ? entry
        : {
            group: entry.group,
            count: entry.count,
            sample: entry.tokens.slice(0, 12),
          }
    ),
  }
}
