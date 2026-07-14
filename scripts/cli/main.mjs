import { FRAMEWORKS } from "./constants.mjs"
import { initCommand } from "./init.mjs"

/**
 * @param {string[]} argv
 */
export async function run(argv) {
  const [command, ...rest] = argv

  if (!command || command === "-h" || command === "--help") {
    printHelp()
    return
  }

  if (command === "init") {
    await initCommand(rest)
    return
  }

  if (command === "frameworks") {
    console.log(FRAMEWORKS.join("\n"))
    return
  }

  throw new Error(`Unknown command "${command}". Run with --help.`)
}

function printHelp() {
  console.log(`
Default File UI CLI

Usage:
  df-ui <command>

Commands:
  init         Scaffold (-t) or configure an existing React app
  frameworks   List supported framework templates

Examples:
  npx --yes -p github:itsvigneshv/default-file-ui#main df-ui init -t next
  df-ui init
  df-ui init --framework vite
`)
}
