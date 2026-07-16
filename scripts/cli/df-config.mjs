import path from "node:path"

import { DEFAULT_RADIUS, DF_JSON } from "./constants.mjs"
import { exists, readText, writeText } from "./fs-utils.mjs"

/**
 * @typedef {object} DfConfig
 * @property {import("./constants.mjs").Framework} framework
 * @property {import("./constants.mjs").InstallMode} installMode
 * @property {import("./constants.mjs").ColorScale} colorScale
 * @property {string} radius
 * @property {string} baseDir
 * @property {{ ui: string, lib: string }} aliases
 * @property {string | null} css
 */

/**
 * Prefer a `src` directory when present; otherwise write at the project root.
 * @param {string} cwd
 */
export function defaultBaseDir(cwd) {
  return exists(path.join(cwd, "src")) ? "src" : "."
}

/**
 * @param {string} cwd
 * @returns {DfConfig | null}
 */
export function readDfConfig(cwd) {
  const file = path.join(cwd, DF_JSON)
  if (!exists(file)) return null
  try {
    return JSON.parse(readText(file))
  } catch {
    return null
  }
}

/**
 * @param {string} cwd
 * @param {DfConfig} config
 */
export function writeDfConfig(cwd, config) {
  const file = path.join(cwd, DF_JSON)
  writeText(file, `${JSON.stringify(config, null, 2)}\n`)
  return file
}

/**
 * Build a config object with sane defaults.
 * @param {string} cwd
 * @param {import("./constants.mjs").Framework} framework
 * @param {{ installMode?: import("./constants.mjs").InstallMode, colorScale?: import("./constants.mjs").ColorScale, radius?: string, css?: string | null }} [options]
 * @returns {DfConfig}
 */
export function buildDfConfig(cwd, framework, options = {}) {
  const baseDir = defaultBaseDir(cwd)
  return {
    framework,
    installMode: options.installMode ?? "package",
    colorScale: options.colorScale ?? "detailed",
    radius: options.radius ?? DEFAULT_RADIUS,
    baseDir,
    aliases: {
      ui: "@/default-file-ui",
      lib: "@/lib",
    },
    css: options.css ?? null,
  }
}
