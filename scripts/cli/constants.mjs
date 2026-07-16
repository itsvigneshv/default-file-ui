/** @typedef {"next" | "vite" | "react-router" | "tanstack-start" | "astro" | "laravel" | "react"} Framework */

/** @type {Framework[]} */
export const FRAMEWORKS = [
  "next",
  "vite",
  "react-router",
  "tanstack-start",
  "astro",
  "laravel",
  "react",
]

export const PACKAGE_SPEC = "github:itsvigneshv/default-file-ui#main"
export const CSS_IMPORT = `@import "@default-file/ui/css/df-index.css";`
export const CSS_IMPORT_JS = `import "@default-file/ui/css/df-index.css"`

/** Project map written by init and read by add. */
export const DF_JSON = "df.json"

/** Raw source base for pulling registry items when the package is not installed. */
export const RAW_BASE =
  "https://raw.githubusercontent.com/itsvigneshv/default-file-ui/main"

/** @typedef {"detailed" | "compact"} ColorScale */
/** @type {ColorScale[]} */
export const COLOR_SCALES = ["detailed", "compact"]

/** @typedef {"package" | "registry"} InstallMode */
/** @type {InstallMode[]} */
export const INSTALL_MODES = ["package", "registry"]

/** Default corner radius token (matches df-tokens.css `--radius`). */
export const DEFAULT_RADIUS = "0.625rem"

/**
 * @param {string} value
 */
export function isColorScale(value) {
  return COLOR_SCALES.includes(/** @type {ColorScale} */ (value))
}

/**
 * @param {string} value
 */
export function isInstallMode(value) {
  return INSTALL_MODES.includes(/** @type {InstallMode} */ (value))
}

/**
 * A CSS length usable for --radius: a rem/em/px value, or bare `0`.
 * @param {string} value
 */
export function isRadius(value) {
  return /^(0|\d*\.?\d+(rem|em|px))$/.test(String(value).trim())
}

/**
 * @param {Framework} framework
 */
export function isFramework(framework) {
  return FRAMEWORKS.includes(/** @type {Framework} */ (framework))
}

/**
 * @param {Framework} framework
 */
export function frameworkLabel(framework) {
  switch (framework) {
    case "next":
      return "Next.js"
    case "vite":
      return "Vite"
    case "react-router":
      return "React Router"
    case "tanstack-start":
      return "TanStack Start"
    case "astro":
      return "Astro"
    case "laravel":
      return "Laravel (Inertia + React)"
    case "react":
      return "React"
    default:
      return framework
  }
}
