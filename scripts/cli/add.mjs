import path from "node:path"

import { RAW_BASE } from "./constants.mjs"
import { readDfConfig, defaultBaseDir } from "./df-config.mjs"
import { exists, readText, writeText } from "./fs-utils.mjs"

const LOCAL_PKG = "node_modules/@default-file/ui"

export async function addCommand(args) {
  const options = parseAddArgs(args)

  if (options.help || options.items.length === 0) {
    printAddHelp()
    return
  }

  const cwd = path.resolve(options.cwd)
  const config = readDfConfig(cwd)
  const baseDir = options.dir ?? config?.baseDir ?? defaultBaseDir(cwd)

  const registry = await loadRegistry(cwd)
  const resolved = resolveItems(registry, options.items)

  const npmDeps = new Set()
  let written = 0

  for (const item of resolved) {
    for (const dep of item.dependencies ?? []) npmDeps.add(dep)
    for (const file of item.files ?? []) {
      const source = await readSource(cwd, file.path)
      const dest = destinationFor(cwd, baseDir, file.path)
      writeText(dest, source)
      written += 1
      console.log(`  + ${path.relative(cwd, dest)}`)
    }
  }

  console.log(
    `\nAdded ${resolved.length} item(s), ${written} file(s) under ${path.join(
      baseDir,
      "default-file-ui"
    )}.`
  )
  if (npmDeps.size > 0) {
    console.log(
      `Install peer packages if missing: ${[...npmDeps].join(", ")}`
    )
  }
  printNextSteps(resolved)
}

export function resolveItems(registry, names) {
  const byName = new Map(registry.items.map((item) => [item.name, item]))
  const out = new Map()
  const visiting = new Set()

  function visit(name) {
    if (out.has(name)) return
    if (visiting.has(name)) {
      throw new Error(`Circular registryDependencies involving "${name}".`)
    }
    const item = byName.get(name)
    if (!item) {
      const available = registry.items.map((i) => i.name).join(", ")
      throw new Error(`Unknown item "${name}". Available: ${available}`)
    }
    visiting.add(name)
    for (const dep of item.registryDependencies ?? []) visit(dep)
    visiting.delete(name)
    out.set(name, item)
  }

  for (const name of names) visit(name)
  return [...out.values()]
}

function printNextSteps(resolved) {
  const hasUi = resolved.some((item) => item.type === "registry:ui")
  const names = new Set(resolved.map((item) => item.name))

  if (hasUi) {
    console.log(
      `\nImport from your alias, for example:\n  import { Button } from "@/default-file-ui/components/df-button"\n`
    )
    return
  }

  if (names.has("foundation")) {
    console.log(
      `\nImport kit CSS, for example:\n  @import "@/default-file-ui/css/df-index.css";\n`
    )
    return
  }

  if (names.has("color-system")) {
    console.log(
      `\nImport the color system CSS, for example:\n  @import "@/default-file-ui/css/df-color-system.css";\n`
    )
  }
}

function destinationFor(cwd, baseDir, sourcePath) {
  const relative = sourcePath.replace(/^src\//, "")
  return path.join(cwd, baseDir, "default-file-ui", relative)
}

async function loadRegistry(cwd) {
  const local = path.join(cwd, LOCAL_PKG, "registry.json")
  if (exists(local)) return JSON.parse(readText(local))
  const res = await fetch(`${RAW_BASE}/registry.json`)
  if (!res.ok) {
    throw new Error(`Could not load registry.json (HTTP ${res.status}).`)
  }
  return res.json()
}

async function readSource(cwd, relPath) {
  const local = path.join(cwd, LOCAL_PKG, relPath)
  if (exists(local)) return readText(local)
  const res = await fetch(`${RAW_BASE}/${relPath}`)
  if (!res.ok) {
    throw new Error(`Could not fetch ${relPath} (HTTP ${res.status}).`)
  }
  return res.text()
}

function parseAddArgs(args) {
  const options = { items: [], cwd: process.cwd(), dir: null, help: false }
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === "-h" || arg === "--help") options.help = true
    else if (arg === "--cwd") options.cwd = args[++i] ?? process.cwd()
    else if (arg === "--dir") options.dir = args[++i] ?? null
    else if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`)
    else options.items.push(arg)
  }
  return options
}

function printAddHelp() {
  console.log(`
Usage:
  df-ui add <item> [<item> ...]

Copies registry items (and their dependencies) into your app under
<baseDir>/default-file-ui, reading baseDir from df.json when present.

Examples:
  df-ui add color-system
  df-ui add button
  df-ui add select toast
  df-ui add button --dir app
`)
}
