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
