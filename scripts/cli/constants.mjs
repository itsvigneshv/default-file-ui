
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

export const DF_JSON = "df.json"

export const RAW_BASE =
  "https://raw.githubusercontent.com/itsvigneshv/default-file-ui/main"

export const COLOR_SCALES = ["detailed", "compact"]

export const INSTALL_MODES = ["package", "registry"]

export const DEFAULT_RADIUS = "0.625rem"

/** Corner curve presets. Maps to `--df-corner-shape-*` in df-tokens.css. */
export const CORNER_SHAPES = ["round", "smooth"]

/** Classic circular arcs. Matches kit `--df-corner-shape` default. */
export const DEFAULT_CORNER_SHAPE = "round"

export function isColorScale(value) {
  return COLOR_SCALES.includes( (value))
}

export function isInstallMode(value) {
  return INSTALL_MODES.includes( (value))
}

export function isRadius(value) {
  return /^(0|\d*\.?\d+(rem|em|px))$/.test(String(value).trim())
}

export function isCornerShape(value) {
  return CORNER_SHAPES.includes(String(value))
}

/** CSS value written into the host stylesheet for `--df-corner-shape`. */
export function cornerShapeCssValue(shape) {
  return shape === "smooth"
    ? "var(--df-corner-shape-smooth)"
    : "var(--df-corner-shape-round)"
}

export function isFramework(framework) {
  return FRAMEWORKS.includes( (framework))
}

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
