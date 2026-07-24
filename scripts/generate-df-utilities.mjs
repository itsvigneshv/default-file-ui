#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

import {
  BLUR,
  BREAKPOINTS,
  breakpointMaxWidth,
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  LEADING,
  MAX_W,
  NON_UTILITY_ALLOWLIST,
  RADIUS,
  SHADOW_COMPAT,
  SPACING,
  TRACKING,
} from "./df-theme.mjs"

const VIEWPORT_MAX_VARIANTS = new Set(
  Object.keys(BREAKPOINTS).map((name) => `max-${name}`)
)
const CONTAINER_MIN_VARIANTS = new Set(
  Object.keys(BREAKPOINTS).map((name) => `@${name}`)
)
const RESPONSIVE_VARIANT_PATTERN =
  "dark|max-sm|max-md|max-lg|max-xl|max-2xl|max-3xl|sm|md|lg|xl|2xl|3xl|@sm|@md|@lg|@xl|@2xl|@3xl"

const ROOT = path.resolve(import.meta.dirname, "..")
const SRC = path.join(ROOT, "src")
const UI_SRC = path.join(ROOT, "node_modules/@default-file/ui/src")
const OUT = path.join(ROOT, "src/css/df-utilities.css")

function walk(dir, files = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of entries) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "css" ||
        entry.name === "default-file-ui" ||
        entry.name.startsWith("_compare")
      )
        continue
      walk(p, files)
    } else if (/\.(tsx|ts)$/.test(entry.name)) files.push(p)
  }
  return files
}

function isAllowedAtToken(token) {
  if (token === "@container") return true
  return /^@(?:sm|md|lg|xl|2xl|3xl):/.test(token)
}

function addTokens(set, str) {
  if (!str || typeof str !== "string") return
  for (const token of str.split(/\s+/)) {
    if (!token) continue
    if (token.includes("${")) continue
    if (token.startsWith("http")) continue
    if (token.includes("/legal") || token.includes("/tools") || token.includes("/api")) continue
    if (token.startsWith("@")) {
      if (isAllowedAtToken(token)) set.add(token)
      continue
    }
    if (
      /^(?:[a-z0-9][a-z0-9-]*:)*-?(?:[a-z][a-z0-9-]*|[a-z]+-\[[^\]]+\])/.test(token) ||
      token.includes("[") ||
      /\/\d+$/.test(token)
    ) {
      set.add(token)
    }
  }
}

function extractCallBodies(source, name) {
  const bodies = []
  const re = new RegExp(`\\b${name}\\(`, "g")
  let m
  while ((m = re.exec(source))) {
    let i = m.index + m[0].length
    let depth = 1
    while (i < source.length && depth > 0) {
      const ch = source[i]
      if (ch === "(") depth++
      else if (ch === ")") depth--
      i++
    }
    bodies.push(source.slice(m.index + m[0].length, i - 1))
  }
  return bodies
}

function addStringLiterals(set, body) {
  let depth = 0
  let i = 0
  while (i < body.length) {
    const ch = body[i]
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++
      i++
      continue
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth = Math.max(0, depth - 1)
      i++
      continue
    }
    if (depth === 0 && (ch === '"' || ch === "'" || ch === "`")) {
      const quote = ch
      let j = i + 1
      let value = ""
      while (j < body.length && body[j] !== quote) {
        if (body[j] === "\\" && quote === "`") {
          value += body[j] + (body[j + 1] ?? "")
          j += 2
          continue
        }
        if (quote === "`" && body[j] === "$" && body[j + 1] === "{") {
          value = null
          break
        }
        value += body[j]
        j++
      }
      if (value != null && body[j] === quote) addTokens(set, value)
      i = j + 1
      continue
    }
    i++
  }
}

function extractClasses(source) {
  const classes = new Set()

  for (const m of source.matchAll(/className\s*=\s*"([^"]*)"/g)) addTokens(classes, m[1])
  for (const m of source.matchAll(/className\s*=\s*'([^']*)'/g)) addTokens(classes, m[1])
  for (const m of source.matchAll(/className\s*=\s*\{`([^`]*)`\}/g)) addTokens(classes, m[1])
  for (const body of extractCallBodies(source, "cn")) addStringLiterals(classes, body)
  for (const body of extractCallBodies(source, "dfButtonClass"))
    addStringLiterals(classes, body)
  for (const m of source.matchAll(/(?:^|[\s,{])(?:\w*)[Cc]lass(?:Name)?\s*=\s*"([^"]*)"/g))
    addTokens(classes, m[1])
  for (const m of source.matchAll(/(?:^|[\s,{])(?:\w*)[Cc]lass(?:Name)?\s*=\s*'([^']*)'/g))
    addTokens(classes, m[1])

  return classes
}

function decodeArbitrary(value) {
  return value.replace(/\\_|_/g, (m) => (m === "\\_" ? "_" : " "))
}

function isGradientOrImage(value) {
  return (
    value.includes("gradient(") ||
    value.startsWith("linear") ||
    value.startsWith("radial") ||
    value.startsWith("conic") ||
    value.startsWith("url(")
  )
}

function escapeClass(name) {
  let out = ""
  for (let i = 0; i < name.length; i++) {
    const ch = name[i]
    const code = ch.charCodeAt(0)
    if (i === 0 && code >= 48 && code <= 57) {
      out += `\\${code.toString(16)} `
      continue
    }
    if (/[^a-zA-Z0-9_-]/.test(ch)) {
      out += `\\${ch}`
      continue
    }
    out += ch
  }
  return out
}

const OVERLAY_COLOR_NAMES = new Set(["white", "black"])

function colorValue(name, opacity) {
  const base = COLORS[name]
  if (!base) return null
  if (opacity == null) return base
  const pct = Number(opacity)
  if (base.startsWith("var(") && !OVERLAY_COLOR_NAMES.has(name)) {
    return `color-mix(in oklch, ${base} ${pct}%, var(--background))`
  }
  return `color-mix(in srgb, ${base} ${pct}%, transparent)`
}

function parseColorToken(rest) {
  const arb = rest.match(/^\[(.+)\](?:\/(\d+))?$/)
  if (arb) {
    const val = decodeArbitrary(arb[1])
    if (isGradientOrImage(val)) return null
    if (/^-?[\d.]+(?:px|rem|em|%|ch|ex|vh|vw|dvh|svh|lvh|cqw|cqh|lh)?$/i.test(val))
      return null
    if (arb[2]) return `color-mix(in srgb, ${val} ${arb[2]}%, transparent)`
    return val
  }
  const m = rest.match(/^([a-z0-9-]+)(?:\/(\d+))?$/)
  if (!m) return null
  return colorValue(m[1], m[2])
}

function spacing(val) {
  if (val in SPACING) return SPACING[val]
  if (val === "auto") return "auto"
  const arb = val.match(/^\[(.+)\]$/)
  if (arb) return decodeArbitrary(arb[1])
  const frac = val.match(/^(\d+)\/(\d+)$/)
  if (frac) return `${(Number(frac[1]) / Number(frac[2])) * 100}%`
  return null
}

function sizeValue(val) {
  const s = spacing(val)
  if (s != null) return s
  if (val === "full") return "100%"
  if (val === "fit") return "fit-content"
  if (val === "auto") return "auto"
  if (val === "min") return "min-content"
  if (val === "max") return "max-content"
  if (val === "svh") return "100svh"
  if (val === "dvh") return "100dvh"
  if (val === "screen") return "100vh"
  if (val === "px") return "var(--spacing-px)"
  return null
}

function declsFor(utility) {
  let important = false
  let u = utility
  if (u.startsWith("!")) {
    important = true
    u = u.slice(1)
  }

  const add = (obj) => {
    if (!important) return obj
    const out = {}
    for (const [k, v] of Object.entries(obj)) out[k] = `${v} !important`
    return out
  }

  const staticMap = {
    flex: { display: "flex" },
    "inline-flex": { display: "inline-flex" },
    grid: { display: "grid" },
    block: { display: "block" },
    inline: { display: "inline" },
    contents: { display: "contents" },
    hidden: { display: "none" },
    "flex-1": { flex: "1 1 0%" },
    "flex-col": { "flex-direction": "column" },
    "flex-row": { "flex-direction": "row" },
    "flex-wrap": { "flex-wrap": "wrap" },
    "flex-nowrap": { "flex-wrap": "nowrap" },
    "items-center": { "align-items": "center" },
    "items-start": { "align-items": "flex-start" },
    "items-end": { "align-items": "flex-end" },
    "items-stretch": { "align-items": "stretch" },
    "items-baseline": { "align-items": "baseline" },
    "justify-center": { "justify-content": "center" },
    "justify-between": { "justify-content": "space-between" },
    "justify-start": { "justify-content": "flex-start" },
    "justify-end": { "justify-content": "flex-end" },
    "self-center": { "align-self": "center" },
    "self-start": { "align-self": "flex-start" },
    "self-end": { "align-self": "flex-end" },
    "self-stretch": { "align-self": "stretch" },
    "shrink-0": { "flex-shrink": "0" },
    grow: { "flex-grow": "1" },
    "grow-0": { "flex-grow": "0" },
    "min-w-0": { "min-width": "0" },
    "min-h-0": { "min-height": "0" },
    "min-h-full": { "min-height": "100%" },
    "min-h-dvh": { "min-height": "100dvh" },
    "min-h-svh": { "min-height": "100svh" },
    "w-full": { width: "100%" },
    "w-fit": { width: "fit-content" },
    "w-auto": { width: "auto" },
    "w-px": { width: "var(--spacing-px)" },
    "h-full": { height: "100%" },
    "h-auto": { height: "auto" },
    "h-px": { height: "var(--spacing-px)" },
    "size-full": { width: "100%", height: "100%" },
    relative: { position: "relative" },
    absolute: { position: "absolute" },
    fixed: { position: "fixed" },
    sticky: { position: "sticky" },
    static: { position: "static" },
    isolate: { isolation: "isolate" },
    "inset-0": { inset: "0" },
    "inset-x-0": { left: "0", right: "0" },
    "inset-y-0": { top: "0", bottom: "0" },
    "top-0": { top: "0" },
    "top-1/2": { top: "50%" },
    "bottom-0": { bottom: "0" },
    "bottom-1/2": { bottom: "50%" },
    "left-0": { left: "0" },
    "left-1/2": { left: "50%" },
    "right-0": { right: "0" },
    "right-1/2": { right: "50%" },
    "pointer-events-none": { "pointer-events": "none" },
    "pointer-events-auto": { "pointer-events": "auto" },
    "select-none": { "user-select": "none" },
    "select-text": { "user-select": "text" },
    "overflow-hidden": { overflow: "hidden" },
    "overflow-auto": { overflow: "auto" },
    "overflow-visible": { overflow: "visible" },
    "overflow-x-auto": { "overflow-x": "auto" },
    "overflow-y-auto": { "overflow-y": "auto" },
    "overflow-x-hidden": { "overflow-x": "hidden" },
    "overscroll-none": { "overscroll-behavior": "none" },
    "touch-none": { "touch-action": "none" },
    "cursor-pointer": { cursor: "pointer" },
    "cursor-grab": { cursor: "grab" },
    "cursor-grabbing": { cursor: "grabbing" },
    "object-cover": { "object-fit": "cover" },
    "object-contain": { "object-fit": "contain" },
    "bg-cover": { "background-size": "cover" },
    "bg-center": { "background-position": "center" },
    "cursor-default": { cursor: "default" },
    "cursor-not-allowed": { cursor: "not-allowed" },
    "cursor-crosshair": { cursor: "crosshair" },
    "cursor-ns-resize": { cursor: "ns-resize" },
    "text-left": { "text-align": "left" },
    "text-center": { "text-align": "center" },
    "text-right": { "text-align": "right" },
    "text-balance": { "text-wrap": "balance" },
    "text-pretty": { "text-wrap": "pretty" },
    uppercase: { "text-transform": "uppercase" },
    capitalize: { "text-transform": "capitalize" },
    lowercase: { "text-transform": "lowercase" },
    truncate: {
      overflow: "hidden",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
    },
    "whitespace-nowrap": { "white-space": "nowrap" },
    "whitespace-pre-line": { "white-space": "pre-line" },
    "align-middle": { "vertical-align": "middle" },
    "font-mono": {
      "font-family": "var(--font-geist-mono), ui-monospace, monospace",
    },
    "font-sans": {
      "font-family": "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    },
    "font-heading": {
      "font-family": "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    },
    "tabular-nums": { "font-variant-numeric": "tabular-nums" },
    underline: { "text-decoration-line": "underline" },
    "no-underline": { "text-decoration-line": "none" },
    "underline-offset-2": {
      "text-underline-offset": "var(--df-underline-offset-sm)",
    },
    "underline-offset-3": {
      "text-underline-offset": "var(--df-underline-offset-md)",
    },
    "underline-offset-4": {
      "text-underline-offset": "var(--df-underline-offset)",
    },
    border: {
      "border-width": "var(--border-width-hairline)",
      "border-style": "solid",
    },
    "border-0": { "border-width": "0" },
    "border-2": {
      "border-width": "var(--border-width-thick)",
      "border-style": "solid",
    },
    "border-b": {
      "border-bottom-width": "var(--border-width-hairline)",
      "border-bottom-style": "solid",
    },
    "border-t": {
      "border-top-width": "var(--border-width-hairline)",
      "border-top-style": "solid",
    },
    "border-l": {
      "border-left-width": "var(--border-width-hairline)",
      "border-left-style": "solid",
    },
    "border-r": {
      "border-right-width": "var(--border-width-hairline)",
      "border-right-style": "solid",
    },
    "border-x-0": { "border-left-width": "0", "border-right-width": "0" },
    "border-t-0": { "border-top-width": "0" },
    "border-b-0": { "border-bottom-width": "0" },
    "border-l-0": { "border-left-width": "0" },
    "border-r-0": { "border-right-width": "0" },
    "border-transparent": { "border-color": "transparent" },
    "rounded-none": { "border-radius": "0" },
    "rounded-full": { "border-radius": "var(--radius-full)" },
    "shadow-none": { "box-shadow": "none" },
    "ring-0": { "box-shadow": "0 0 0 0 transparent" },
    "ring-1": {
      "box-shadow":
        "0 0 0 var(--ring-width) var(--df-ring-color, var(--ring))",
    },
    "ring-4": {
      "box-shadow":
        "0 0 0 var(--ring-width-lg) var(--df-ring-color, color-mix(in oklch, var(--ring) 50%, transparent))",
    },
    "outline-none": { outline: "none" },
    "outline-hidden": { outline: "none" },
    "outline-1": {
      "outline-width": "var(--border-width-hairline)",
      "outline-style": "solid",
    },
    antialiased: {
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",
    },
    "transition-colors": {
      "transition-property":
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
      "transition-duration": "150ms",
    },
    "transition-opacity": {
      "transition-property": "opacity",
      "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
      "transition-duration": "150ms",
    },
    "transition-transform": {
      "transition-property": "transform",
      "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
      "transition-duration": "150ms",
    },
    "transition-all": {
      "transition-property": "all",
      "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
      "transition-duration": "150ms",
    },
    "transition-none": { transition: "none" },
    "duration-100": { "transition-duration": "100ms" },
    "duration-150": { "transition-duration": "150ms" },
    "duration-200": { "transition-duration": "200ms" },
    "duration-300": { "transition-duration": "300ms" },
    "duration-500": { "transition-duration": "500ms" },
    "ease-in-out": {
      "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    "animate-spin": {
      animation: "df-spin var(--df-duration-spin) linear infinite",
    },
    "place-content-center": { "place-content": "center" },
    "aspect-square": { "aspect-ratio": "1 / 1" },
    "bg-clip-padding": { "background-clip": "padding-box" },
    "line-clamp-1": {
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": "1",
    },
    "bg-gradient-to-t": {
      "background-image": "linear-gradient(to top, var(--df-gradient-stops))",
    },
    "bg-gradient-to-b": {
      "background-image": "linear-gradient(to bottom, var(--df-gradient-stops))",
    },
    "mt-auto": { "margin-top": "auto" },
    "mx-auto": { "margin-left": "auto", "margin-right": "auto" },
    "ml-auto": { "margin-left": "auto" },
    "will-change-transform": { "will-change": "transform" },
    "will-change-auto": { "will-change": "auto" },
    "will-change-scroll": { "will-change": "scroll-position" },
    "will-change-contents": { "will-change": "contents" },
  }

  for (const [k, v] of Object.entries(FONT_WEIGHT)) {
    staticMap[`font-${k}`] = { "font-weight": v }
  }
  for (const [k, v] of Object.entries(TRACKING)) {
    staticMap[`tracking-${k}`] = { "letter-spacing": v }
  }
  for (const [k, v] of Object.entries(LEADING)) {
    staticMap[`leading-${k}`] = { "line-height": v }
  }
  for (const [k, v] of Object.entries(SHADOW_COMPAT)) {
    staticMap[k === "none" ? "shadow-none" : `shadow-${k}`] = {
      "box-shadow": v,
    }
  }
  for (const [k, v] of Object.entries(BLUR)) {
    staticMap[`backdrop-blur-${k}`] = { "backdrop-filter": `blur(${v})` }
    if (k !== "none") staticMap[`blur-${k}`] = { filter: `blur(${v})` }
  }

  if (staticMap[u]) return add(staticMap[u])

  let m = u.match(/^size-(.+)$/)
  if (m) {
    const v = sizeValue(m[1])
    if (v) return add({ width: v, height: v })
  }

  m = u.match(/^w-(.+)$/)
  if (m) {
    const v = sizeValue(m[1]) ?? MAX_W[m[1]]
    if (v) return add({ width: v })
    if (m[1] === "52") return add({ width: "13rem" })
  }
  m = u.match(/^h-(.+)$/)
  if (m) {
    const v = sizeValue(m[1])
    if (v) return add({ height: v })
  }
  m = u.match(/^min-w-(.+)$/)
  if (m) {
    const v = sizeValue(m[1])
    if (v) return add({ "min-width": v })
  }
  m = u.match(/^max-w-(.+)$/)
  if (m) {
    const v = MAX_W[m[1]] ?? sizeValue(m[1])
    if (v) return add({ "max-width": v })
  }
  m = u.match(/^min-h-(.+)$/)
  if (m) {
    const v = sizeValue(m[1])
    if (v) return add({ "min-height": v })
  }
  m = u.match(/^max-h-(.+)$/)
  if (m) {
    const v = sizeValue(m[1])
    if (v) return add({ "max-height": v })
  }

  m = u.match(
    /^-?(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap-x|gap-y|gap|scroll-mt|scroll-mb|top|bottom|left|right)-(.+)$/
  )
  if (m) {
    const [, prop, raw] = m
    const neg = u.startsWith("-") || raw.startsWith("-")
    const key = raw.startsWith("-") ? raw.slice(1) : raw
    let v = spacing(key)
    if (v != null) {
      if (neg && v !== "auto") v = `calc(${v} * -1)`
      const map = {
        p: { padding: v },
        px: { "padding-left": v, "padding-right": v },
        py: { "padding-top": v, "padding-bottom": v },
        pt: { "padding-top": v },
        pb: { "padding-bottom": v },
        pl: { "padding-left": v },
        pr: { "padding-right": v },
        m: { margin: v },
        mx: { "margin-left": v, "margin-right": v },
        my: { "margin-top": v, "margin-bottom": v },
        mt: { "margin-top": v },
        mb: { "margin-bottom": v },
        ml: { "margin-left": v },
        mr: { "margin-right": v },
        gap: { gap: v },
        "gap-x": { "column-gap": v },
        "gap-y": { "row-gap": v },
        "scroll-mt": { "scroll-margin-top": v },
        "scroll-mb": { "scroll-margin-bottom": v },
        top: { top: v },
        bottom: { bottom: v },
        left: { left: v },
        right: { right: v },
      }
      if (map[prop]) return add(map[prop])
    }
  }

  m = u.match(/^text-(.+)$/)
  if (m) {
    const rest = m[1]
    if (FONT_SIZE[rest]) {
      const [fs, lh] = FONT_SIZE[rest]
      return add({ "font-size": fs, "line-height": lh })
    }
    const arb = rest.match(/^\[(.+)\]$/)
    if (arb) {
      const val = decodeArbitrary(arb[1])
      if (
        val.startsWith("#") ||
        val.startsWith("oklch") ||
        val.startsWith("rgb") ||
        val.startsWith("hsl") ||
        val.startsWith("var(") ||
        val.startsWith("color-mix")
      ) {
        return add({ color: val })
      }
      return add({ "font-size": val })
    }
    const c = parseColorToken(rest)
    if (c) return add({ color: c })
  }

  m = u.match(/^bg-(.+)$/)
  if (m) {
    const rest = m[1]
    if (rest.startsWith("gradient-")) return null
    const arb = rest.match(/^\[(.+)\]$/)
    if (arb) {
      const val = decodeArbitrary(arb[1])
      if (isGradientOrImage(val)) {
        return add({ background: val })
      }
      return add({ "background-color": val })
    }
    const c = parseColorToken(rest)
    if (c) return add({ "background-color": c })
  }

  m = u.match(/^border-(.+)$/)
  if (m) {
    const rest = m[1]
    if (["t", "b", "l", "r", "x", "y", "0", "2", "4", "8"].includes(rest))
      return null
    const arb = rest.match(/^\[(.+)\]$/)
    if (arb) {
      const val = decodeArbitrary(arb[1])
      if (/^-?[\d.]+(?:px|rem|em|%)?$/i.test(val)) {
        return add({
          "border-width": /[a-z%]/i.test(val) ? val : `${val}px`,
          "border-style": "solid",
        })
      }
      return add({ "border-color": val })
    }
    const c = parseColorToken(rest)
    if (c) return add({ "border-color": c })
  }

  m = u.match(/^ring-(.+)$/)
  if (m) {
    const rest = m[1]
    if (["0", "1", "2", "4", "8"].includes(rest)) {
      return add({
        "box-shadow": `0 0 0 ${rest === "0" ? "0" : rest + "px"} var(--df-ring-color, color-mix(in oklch, var(--ring) 50%, transparent))`,
      })
    }
    const arb = rest.match(/^\[(.+)\]$/)
    if (arb && /^\d/.test(arb[1])) {
      return add({
        "box-shadow": `0 0 0 ${decodeArbitrary(arb[1])} var(--df-ring-color, color-mix(in oklch, var(--ring) 50%, transparent))`,
      })
    }
    const c = parseColorToken(rest)
    if (c)
      return add({
        "--df-ring-color": c,
        "box-shadow": `0 0 0 var(--ring-width) ${c}`,
      })
  }

  m = u.match(/^outline-(.+)$/)
  if (m) {
    const c = parseColorToken(m[1])
    if (c) return add({ "outline-color": c })
  }

  m = u.match(/^fill-(.+)$/)
  if (m) {
    const c = parseColorToken(m[1])
    if (c) return add({ fill: c })
  }

  m = u.match(/^decoration-(.+)$/)
  if (m) {
    const c = parseColorToken(m[1])
    if (c) return add({ "text-decoration-color": c })
  }

  m = u.match(/^from-(.+)$/)
  if (m) {
    const c = parseColorToken(m[1])
    if (c)
      return add({
        "--df-gradient-from": c,
        "--df-gradient-stops":
          "var(--df-gradient-from), var(--df-gradient-to, transparent)",
      })
  }
  m = u.match(/^via-(.+)$/)
  if (m) {
    const c = parseColorToken(m[1])
    if (c)
      return add({
        "--df-gradient-via": c,
        "--df-gradient-stops":
          "var(--df-gradient-from), var(--df-gradient-via), var(--df-gradient-to, transparent)",
      })
  }
  m = u.match(/^to-(.+)$/)
  if (m) {
    const c = parseColorToken(m[1])
    if (c) return add({ "--df-gradient-to": c })
  }

  m = u.match(/^rounded-(.+)$/)
  if (m) {
    const rest = m[1]
    if (RADIUS[rest]) return add({ "border-radius": RADIUS[rest] })
    const side = rest.match(/^(t|b|l|r|tl|tr|bl|br)-(.+)$/)
    if (side) {
      const rad =
        RADIUS[side[2]] ??
        (side[2].match(/^\[(.+)\]$/)
          ? decodeArbitrary(side[2].slice(1, -1))
          : null)
      if (rad) {
        const map = {
          t: {
            "border-top-left-radius": rad,
            "border-top-right-radius": rad,
          },
          b: {
            "border-bottom-left-radius": rad,
            "border-bottom-right-radius": rad,
          },
          l: {
            "border-top-left-radius": rad,
            "border-bottom-left-radius": rad,
          },
          r: {
            "border-top-right-radius": rad,
            "border-bottom-right-radius": rad,
          },
          tl: { "border-top-left-radius": rad },
          tr: { "border-top-right-radius": rad },
          bl: { "border-bottom-left-radius": rad },
          br: { "border-bottom-right-radius": rad },
        }
        if (map[side[1]]) return add(map[side[1]])
      }
    }
    const arb = rest.match(/^\[(.+)\]$/)
    if (arb) return add({ "border-radius": decodeArbitrary(arb[1]) })
  }

  m = u.match(/^opacity-(.+)$/)
  if (m) {
    const arb = m[1].match(/^\[(.+)\]$/)
    if (arb) return add({ opacity: decodeArbitrary(arb[1]) })
    if (/^\d+$/.test(m[1])) return add({ opacity: String(Number(m[1]) / 100) })
  }

  m = u.match(/^z-(.+)$/)
  if (m) {
    const arb = m[1].match(/^\[(.+)\]$/)
    if (arb) return add({ "z-index": decodeArbitrary(arb[1]) })
    if (/^\d+$/.test(m[1]) || m[1] === "auto") return add({ "z-index": m[1] })
  }

  m = u.match(/^shadow-\[(.+)\]$/)
  if (m) return add({ "box-shadow": decodeArbitrary(m[1]) })

  m = u.match(/^grid-cols-(.+)$/)
  if (m) {
    const rest = m[1]
    if (/^\d+$/.test(rest))
      return add({
        "grid-template-columns": `repeat(${rest}, minmax(0, 1fr))`,
      })
    const arb = rest.match(/^\[(.+)\]$/)
    if (arb)
      return add({ "grid-template-columns": decodeArbitrary(arb[1]) })
  }

  m = u.match(/^col-span-(.+)$/)
  if (m) {
    const rest = m[1]
    if (rest === "full") return add({ "grid-column": "1 / -1" })
    if (/^\d+$/.test(rest)) return add({ "grid-column": `span ${rest} / span ${rest}` })
  }

  m = u.match(/^aspect-\[(.+)\]$/)
  if (m) return add({ "aspect-ratio": decodeArbitrary(m[1]) })

  m = u.match(/^tracking-\[(.+)\]$/)
  if (m) return add({ "letter-spacing": decodeArbitrary(m[1]) })

  m = u.match(/^ease-\[(.+)\]$/)
  if (m) return add({ "transition-timing-function": decodeArbitrary(m[1]) })

  m = u.match(/^transition-\[(.+)\]$/)
  if (m) {
    return add({
      "transition-property": decodeArbitrary(m[1]),
      "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
      "transition-duration": "150ms",
    })
  }

  m = u.match(/^scale-\[(.+)\]$/)
  if (m) return add({ transform: `scale(${decodeArbitrary(m[1])})` })
  m = u.match(/^scale-(.+)$/)
  if (m && /^\d+$/.test(m[1]))
    return add({ transform: `scale(${Number(m[1]) / 100})` })

  m = u.match(/^-?rotate-(.+)$/)
  if (m) {
    const neg = u.startsWith("-")
    const rest = m[1]
    const arb = rest.match(/^\[(.+)\]$/)
    const deg = arb ? decodeArbitrary(arb[1]) : `${rest}deg`
    return add({ transform: `rotate(${neg ? "-" : ""}${deg})` })
  }

  m = u.match(/^-?translate-([xy])-(.+)$/)
  if (m) {
    const neg = u.startsWith("-")
    const axis = m[1]
    let v = spacing(m[2])
    if (m[2] === "1/2") v = "50%"
    if (m[2] === "full") v = "100%"
    const arb = m[2].match(/^\[(.+)\]$/)
    if (arb) v = decodeArbitrary(arb[1])
    if (v != null) {
      if (neg) v = `calc(${v} * -1)`
      const varName = axis === "x" ? "--df-translate-x" : "--df-translate-y"
      return add({
        [varName]: v,
        transform:
          "translate(var(--df-translate-x, 0), var(--df-translate-y, 0))",
      })
    }
  }

  m = u.match(/^\[writing-mode:(.+)\]$/)
  if (m) return add({ "writing-mode": decodeArbitrary(m[1]) })

  if (u === "@container") return add({ "container-type": "inline-size" })

  return null
}

function splitVariants(token) {
  const variants = []
  let rest = token

  while (true) {
    const m = rest.match(
      new RegExp(
        `^(${RESPONSIVE_VARIANT_PATTERN}|hover|focus|focus-visible|active|disabled|motion-safe|motion-reduce|group-hover|group-focus-visible|peer-disabled|placeholder|file|data-open|data-closed|data-checked|data-unchecked|data-disabled|data-horizontal|data-vertical|data-placeholder|aria-invalid|aria-expanded|aria-pressed|aria-disabled|supports-backdrop-filter):(.+)$`
      )
    )
    if (!m) break
    variants.push(m[1])
    rest = m[2]
  }

  while (true) {
    const m = rest.match(
      /^(group-data-\[[^\]]+\](?:\/[a-z0-9-]+)?|group-data-[a-z0-9-]+(?:\/[a-z0-9-]+)?|data-\[[^\]]+\]|data-[a-z0-9-]+|has-data-\[[^\]]+\]|aria-\[[^\]]+\]|\[&[^\]]+\]):(.*)$/
    )
    if (!m) break
    variants.push(m[1])
    rest = m[2]
  }
  return { variants, utility: rest }
}

function queryKey(query) {
  return `${query.type}:${query.feature}`
}

function selectorFor(token, variants) {
  let sel = `.${escapeClass(token)}`
  const suffix = []
  let wrapDark = false
  let query = null
  let motionSafe = false

  for (const v of variants) {
    if (v === "dark") wrapDark = true
    else if (VIEWPORT_MAX_VARIANTS.has(v)) {
      query = {
        type: "media",
        feature: `(max-width: ${breakpointMaxWidth(v.slice(4))})`,
      }
    } else if (BREAKPOINTS[v]) {
      query = { type: "media", feature: `(min-width: ${BREAKPOINTS[v]})` }
    } else if (CONTAINER_MIN_VARIANTS.has(v)) {
      query = {
        type: "container",
        feature: `(min-width: ${BREAKPOINTS[v.slice(1)]})`,
      }
    } else if (v === "hover") suffix.push(":hover")
    else if (v === "focus") suffix.push(":focus")
    else if (v === "focus-visible") suffix.push(":focus-visible")
    else if (v === "active") suffix.push(":active")
    else if (v === "disabled") suffix.push(":disabled")
    else if (v === "placeholder") suffix.push("::placeholder")
    else if (v === "file") suffix.push("::file-selector-button")
    else if (v === "motion-safe") motionSafe = true
    else if (v === "group-hover") sel = `.group:hover .${escapeClass(token)}`
    else if (v === "group-focus-visible")
      sel = `.group:focus-visible .${escapeClass(token)}`
    else if (v === "peer-disabled")
      sel = `.peer:disabled ~ .${escapeClass(token)}`
    else if (v.startsWith("data-[")) {
      const inner = v.slice(5, -1)
      suffix.push(`[data-${inner}]`)
    } else if (v.startsWith("data-")) {
      suffix.push(`[${v}]`)
    } else if (v.startsWith("aria-[")) {
      const inner = v.slice(5, -1)
      suffix.push(`[aria-${inner}]`)
    } else if (v.startsWith("aria-")) {
      suffix.push(`[${v}="true"]`)
    } else if (v.startsWith("group-data-")) {
      const g = v.match(
        /^group-data-(?:\[([^\]]+)\]|([a-z0-9-]+))(?:\/([a-z0-9-]+))?$/
      )
      if (g) {
        const attr = g[1] ? `data-${g[1]}` : `data-${g[2]}`
        const groupName = g[3] ? `group\\/${g[3]}` : "group"
        sel = `.${groupName}[${attr}] .${escapeClass(token)}`
      }
    } else if (v.startsWith("has-data-[")) {
      const inner = v.slice(10, -1)
      suffix.push(`:has([data-${inner}])`)
    } else if (v.startsWith("[&")) {
      const inner = v.slice(1, -1)
      sel = `.${escapeClass(token)}${inner.replace(/^&/, "")}`
    }
  }

  if (suffix.length) {
    if (!sel.includes(" ")) sel = `${sel}${suffix.join("")}`
    else {
      const parts = sel.split(" ")
      parts[parts.length - 1] += suffix.join("")
      sel = parts.join(" ")
    }
  }

  if (wrapDark) sel = `.dark ${sel}`
  return { sel, query, motionSafe }
}

function formatRule(sel, decls) {
  const body = Object.entries(decls)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")
  return `${sel} {\n${body}\n}`
}

const files = [
  ...walk(SRC).filter(
    (f) => !f.includes(`${path.sep}default-file-ui${path.sep}css${path.sep}`)
  ),
  ...walk(UI_SRC).filter((f) => f.includes(`${path.sep}components${path.sep}`)),
]
const all = new Set()
for (const file of files) {
  const src = fs.readFileSync(file, "utf8")
  for (const c of extractClasses(src)) all.add(c)
}

const EXTRA = [
  "flex",
  "inline-flex",
  "items-center",
  "justify-center",
  "shrink-0",
  "relative",
  "absolute",
  "inset-0",
  "w-full",
  "h-full",
  "size-full",
  "rounded-full",
  "overflow-hidden",
  "select-none",
  "outline-none",
  "pointer-events-none",
  "cursor-pointer",
  "transition-colors",
  "transition-all",
  "animate-spin",
  "text-muted-foreground",
  "bg-muted",
  "bg-background",
  "text-foreground",
  "bg-primary",
  "text-primary-foreground",
  "border",
  "border-border",
  "shadow-sm",
  "z-50",
  "isolate",
  "min-w-0",
  "min-h-0",
  "flex-1",
  "gap-2",
  "p-2",
  "text-sm",
  "font-medium",
  "min-h-[14rem]",
  "sm:min-h-[16rem]",
  "cursor-grab",
  "cursor-grabbing",
  "object-cover",
  "xl:w-[252px]",
  "xl:min-w-[252px]",
  "xl:max-w-[252px]",
  "xl:w-[300px]",
  "xl:min-w-[300px]",
  "xl:max-w-[300px]",
  "@container",
]
for (const e of EXTRA) all.add(e)

const animMap = {
  "animate-in": { animation: "df-enter 150ms ease-out" },
  "animate-out": { animation: "df-exit 100ms ease-in forwards" },
  "fade-in-0": { "--df-enter-opacity": "0" },
  "fade-out-0": { "--df-exit-opacity": "0" },
  "fade-in": { "--df-enter-opacity": "0" },
  "zoom-in-95": { "--df-enter-scale": "0.95" },
  "zoom-out-95": { "--df-exit-scale": "0.95" },
  "slide-in-from-top-2": { "--df-enter-translate-y": "-0.5rem" },
  "slide-in-from-bottom-2": { "--df-enter-translate-y": "0.5rem" },
  "slide-in-from-left-2": { "--df-enter-translate-x": "-0.5rem" },
  "slide-in-from-right-2": { "--df-enter-translate-x": "0.5rem" },
}

const baseRules = []
const queryRules = new Map()
const unresolved = []

function sortQueryEntries(entries) {
  return entries.sort((a, b) => {
    const rank = (key) => {
      const type = key.startsWith("container:") ? "container" : "media"
      const feature = key.slice(key.indexOf(":") + 1)
      const min = feature.match(/min-width:\s*(\d+)px/)
      const max = feature.match(/max-width:\s*(\d+)px/)
      const group = type === "container" ? 2 : max ? 1 : 0
      const px = min ? Number(min[1]) : max ? Number(max[1]) : 0
      return group * 100000 + px
    }
    return rank(a[0]) - rank(b[0])
  })
}

for (const token of [...all].sort()) {
  if (token.startsWith("group/") || token === "group" || token === "peer")
    continue

  const { variants, utility } = splitVariants(token)
  let decls = declsFor(utility)
  if (!decls && animMap[utility]) decls = animMap[utility]
  if (!decls) {
    unresolved.push(token)
    continue
  }

  const { sel, query, motionSafe } = selectorFor(token, variants)
  let rule = formatRule(sel, decls)
  if (motionSafe) {
    rule = `@media (prefers-reduced-motion: no-preference) {\n${rule}\n}`
  }
  if (query) {
    const key = queryKey(query)
    if (!queryRules.has(key)) queryRules.set(key, [])
    queryRules.get(key).push(rule)
  } else {
    baseRules.push(rule)
  }
}

let css = baseRules.join("\n\n") + "\n"
const mediaEntries = sortQueryEntries([...queryRules.entries()])
for (const [key, rules] of mediaEntries) {
  const type = key.startsWith("container:") ? "container" : "media"
  const feature = key.slice(key.indexOf(":") + 1)
  css += `\n@${type} ${feature} {\n${rules.join("\n\n")}\n}\n`
}

const invariantErrors = []

const text11 = declsFor("text-[11px]")
if (!text11 || text11["font-size"] !== "11px" || text11.color) {
  invariantErrors.push(
    `text-[11px] must emit font-size:11px (got ${JSON.stringify(text11)})`
  )
}
const text10 = declsFor("text-[10px]")
if (!text10 || text10["font-size"] !== "10px" || text10.color) {
  invariantErrors.push(
    `text-[10px] must emit font-size:10px (got ${JSON.stringify(text10)})`
  )
}
const textZinc = declsFor("text-zinc-600")
if (!textZinc || textZinc.color !== "var(--df-neutral-600)") {
  invariantErrors.push(
    `text-zinc-600 must use var(--df-neutral-600) (got ${JSON.stringify(textZinc)})`
  )
}
const textNeutral = declsFor("text-neutral-400")
if (!textNeutral || textNeutral.color !== "var(--df-neutral-400)") {
  invariantErrors.push(
    `text-neutral-400 must use var(--df-neutral-400) (got ${JSON.stringify(textNeutral)})`
  )
}

let lastMinMediaPx = 0
for (const [key] of mediaEntries) {
  if (!key.startsWith("media:")) continue
  const m = key.match(/min-width:\s*(\d+)px/)
  if (!m) continue
  const px = Number(m[1])
  if (px < lastMinMediaPx) {
    invariantErrors.push(
      `Media min-width queries must be ascending (saw ${px}px after ${lastMinMediaPx}px)`
    )
  }
  lastMinMediaPx = px
}

const realUnresolved = unresolved.filter((token) => {
  const { utility } = splitVariants(token)
  if (NON_UTILITY_ALLOWLIST.has(utility)) return false
  if (utility.startsWith("df-")) return false
  if (utility.startsWith("home-")) return false
  if (utility.startsWith("group/")) return false
  return true
})

if (realUnresolved.length) {
  invariantErrors.push(
    `Unresolved utility classes (${realUnresolved.length}): ${realUnresolved.slice(0, 20).join(", ")}${realUnresolved.length > 20 ? "…" : ""}`
  )
}

if (invariantErrors.length) {
  console.error("DF utility generator invariants failed:")
  for (const err of invariantErrors) console.error("  -", err)
  process.exit(1)
}

fs.writeFileSync(OUT, css)
const ruleCount =
  baseRules.length +
  [...queryRules.values()].reduce((a, b) => a + b.length, 0)
console.log(
  `Wrote ${OUT}\n  tokens: ${all.size}\n  rules: ${ruleCount}\n  unresolved: ${realUnresolved.length}`
)
if (realUnresolved.length) console.log("Unresolved:", realUnresolved.join(", "))
