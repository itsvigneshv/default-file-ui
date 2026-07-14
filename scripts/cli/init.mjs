import path from "node:path"

import { applyKit } from "./apply.mjs"
import { FRAMEWORKS, frameworkLabel, isFramework } from "./constants.mjs"
import { detectFramework } from "./detect.mjs"
import { exists } from "./fs-utils.mjs"
import { assertProjectName, scaffoldProject } from "./scaffold.mjs"

/**
 * @param {string[]} args
 */
export async function initCommand(args) {
  const options = parseInitArgs(args)

  if (options.help) {
    printInitHelp()
    return
  }

  if (options.template) {
    if (!isFramework(options.template)) {
      throw new Error(
        `Unknown template "${options.template}". Use one of: ${FRAMEWORKS.join(", ")}`
      )
    }
    if (options.template === "laravel") {
      throw new Error(
        "Use `laravel new` + Inertia React, then run `df-ui init` inside that app."
      )
    }

    const name = options.name ?? `df-${options.template}-app`
    assertProjectName(name)
    const parent = path.resolve(options.cwd)
    const projectDir = scaffoldProject(options.template, name, parent)
    applyKit(projectDir, options.template)
    console.log(`\nNext:\n  cd ${name}\n  npm run dev\n`)
    return
  }

  const cwd = path.resolve(options.cwd)
  if (!exists(path.join(cwd, "package.json"))) {
    throw new Error(
      `No package.json in ${cwd}. Create an app first, or pass -t <framework> to scaffold.`
    )
  }

  const framework =
    options.framework && isFramework(options.framework)
      ? options.framework
      : detectFramework(cwd)

  if (!framework) {
    throw new Error(
      `Could not detect the framework. Pass --framework <${FRAMEWORKS.join("|")}>`
    )
  }

  console.log(`Detected ${frameworkLabel(framework)} in ${cwd}`)
  applyKit(cwd, framework)
}

/**
 * @param {string[]} args
 */
function parseInitArgs(args) {
  /** @type {{ template: string | null, framework: string | null, name: string | null, cwd: string, help: boolean }} */
  const options = {
    template: null,
    framework: null,
    name: null,
    cwd: process.cwd(),
    help: false,
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === "-h" || arg === "--help") options.help = true
    else if (arg === "-t" || arg === "--template") {
      options.template = args[++i] ?? null
    } else if (arg === "-f" || arg === "--framework") {
      options.framework = args[++i] ?? null
    } else if (arg === "-n" || arg === "--name") {
      options.name = args[++i] ?? null
    } else if (arg === "--cwd") {
      options.cwd = args[++i] ?? process.cwd()
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`)
    } else if (!options.name) {
      options.name = arg
    } else {
      throw new Error(`Unexpected argument: ${arg}`)
    }
  }

  return options
}

function printInitHelp() {
  console.log(`
Usage:
  df-ui init
  df-ui init -t <framework> [--name <dir>]
  df-ui init --framework <framework>

Scaffold a new app (-t), or configure Default File UI in the current project.

Templates:
  ${FRAMEWORKS.filter((f) => f !== "laravel").join(", ")}

Laravel: create the Inertia + React app first, then run init in that folder.

Examples:
  df-ui init -t next --name my-app
  df-ui init -t vite
  df-ui init --framework astro
`)
}
