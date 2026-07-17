#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const REGISTRY_PATH = path.join(ROOT, "registry.json")
const OUT_DIR = path.join(ROOT, "public", "r")

function readFile(rel) {
  const abs = path.join(ROOT, rel)
  return fs.readFileSync(abs, "utf8")
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

const catalog = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"))
ensureDir(OUT_DIR)

for (const item of catalog.items) {
  const files = (item.files ?? []).map((f) => {
    const content = readFile(f.path)
    return {
      path: f.path,
      type: f.type ?? "registry:file",
      content,
      target: f.target,
    }
  })

  const payload = {
    name: item.name,
    type: item.type,
    title: item.title ?? item.name,
    description: item.description ?? "",
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    files,
  }

  const out = path.join(OUT_DIR, `${item.name}.json`)
  fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n")
  console.log("wrote", path.relative(ROOT, out))
}

console.log(`Built ${catalog.items.length} registry items`)
