import path from "node:path"

import { frameworkLabel } from "./constants.mjs"
import { detectFramework, readPackageJson } from "./detect.mjs"
import { readDfConfig } from "./df-config.mjs"

/**
 * @param {string[]} args
 */
export function infoCommand(args) {
  const cwd = path.resolve(parseCwd(args))

  const pkg = readPackageJson(cwd)
  const detected = detectFramework(cwd)
  const config = readDfConfig(cwd)

  console.log(`\nDefault File UI — project info\n`)
  console.log(`  Directory:  ${cwd}`)
  console.log(`  package.json: ${pkg ? "found" : "not found"}`)
  console.log(
    `  Detected framework: ${detected ? frameworkLabel(detected) : "unknown"}`
  )

  if (config) {
    console.log(`\n  df.json:`)
    console.log(`    framework:   ${config.framework}`)
    console.log(`    installMode: ${config.installMode}`)
    console.log(`    colorScale:  ${config.colorScale}`)
    console.log(`    baseDir:     ${config.baseDir}`)
    console.log(`    css:         ${config.css ?? "n/a"}`)
  } else {
    console.log(`\n  df.json: not found. Run \`df-ui init\` to create it.`)
  }
  console.log("")
}

/**
 * @param {string[]} args
 */
function parseCwd(args) {
  const index = args.indexOf("--cwd")
  if (index !== -1 && args[index + 1]) return args[index + 1]
  return process.cwd()
}
