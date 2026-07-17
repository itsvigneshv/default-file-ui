#!/usr/bin/env node
import fs from "node:fs"
import { BREAKPOINTS } from "./df-theme.mjs"

const target = new URL("../src/css/df-components.css", import.meta.url)
let css = fs.readFileSync(target, "utf8")
const original = css

function value(token) {
  const max = token.match(/^max-(.+)$/)
  if (max) {
    const base = BREAKPOINTS[max[1]]
    if (!base) throw new Error(`df:breakpoints: unknown breakpoint "${max[1]}"`)
    return ["max-width", `${parseInt(base, 10) - 1}px`]
  }
  const base = BREAKPOINTS[token]
  if (!base) throw new Error(`df:breakpoints: unknown breakpoint "${token}"`)
  return ["min-width", base]
}

let count = 0
css = css.replace(
  /@media \((?:min|max)-width:\s*[\d.]+px\) \{ \/\* df-bp:([\w-]+) \*\//g,
  (_full, token) => {
    const [feature, px] = value(token)
    count += 1
    return (
      "@media (" +
      feature +
      ": " +
      px +
      ") { /* df-bp:" +
      token +
      " */"
    )
  }
)

if (css !== original) {
  fs.writeFileSync(target, css)
  console.log(`df:breakpoints: resolved ${count} tagged media query(ies) from BREAKPOINTS`)
} else {
  console.log(`df:breakpoints: ${count} tagged query(ies) already in sync`)
}
