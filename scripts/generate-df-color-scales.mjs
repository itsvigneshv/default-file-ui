#!/usr/bin/env node
/**
 * Generates df-color-scales.css from the Default File UI scale definition.
 * Source of truth for steps: compact vs detailed (every 10).
 * Neutrals and hue palettes are hex; brand stays oklch until Color Lab brand phase.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const OUT = path.join(ROOT, "src/css/df-color-scales.css")

const COMPACT = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000]
const DETAILED = Array.from({ length: 101 }, (_, i) => i * 10)

/** Compact anchors → OKLCH L (matches prior semantic palette). */
const L_ANCHORS = [
  [0, 1],
  [50, 0.97],
  [100, 0.922],
  [200, 0.87],
  [300, 0.78],
  [400, 0.68],
  [500, 0.556],
  [600, 0.439],
  [700, 0.371],
  [800, 0.269],
  [900, 0.205],
  [950, 0.145],
  [1000, 0.08],
]

/** Hue ramps lift the dark end so deep shades keep hue instead of going black. */
const HUE_L_ANCHORS = [
  [0, 1],
  [50, 0.965],
  [100, 0.92],
  [200, 0.855],
  [300, 0.775],
  [400, 0.695],
  [500, 0.61],
  [600, 0.535],
  [700, 0.465],
  [800, 0.405],
  [900, 0.35],
  [950, 0.31],
  [1000, 0.28],
]

function interpolateAnchors(anchors, step) {
  const t = Math.min(1000, Math.max(0, step))
  for (let i = 0; i < anchors.length - 1; i++) {
    const [aStep, aL] = anchors[i]
    const [bStep, bL] = anchors[i + 1]
    if (t >= aStep && t <= bStep) {
      const p = (t - aStep) / (bStep - aStep || 1)
      return Number((aL + (bL - aL) * p).toFixed(4))
    }
  }
  return anchors[anchors.length - 1][1]
}

function lightness(step) {
  return interpolateAnchors(L_ANCHORS, step)
}

function hueLightness(step) {
  return interpolateAnchors(HUE_L_ANCHORS, step)
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x))
}

function oklchToRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const encode = (v) => {
    const x = clamp01(v)
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
  }
  return [encode(lr), encode(lg), encode(lb)]
}

function rgbToHex([r, g, b]) {
  const channel = (v) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

function oklchToHex(L, C, h) {
  return rgbToHex(oklchToRgb(L, C, h))
}

/** Linear (un-encoded, un-clamped) sRGB for gamut tests. */
function oklchToLinearRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

function isInGamut(L, C, hDeg) {
  const eps = 1e-4
  const [lr, lg, lb] = oklchToLinearRgb(L, C, hDeg)
  return (
    lr >= -eps && lr <= 1 + eps &&
    lg >= -eps && lg <= 1 + eps &&
    lb >= -eps && lb <= 1 + eps
  )
}

function maxInGamutChroma(L, hDeg) {
  if (L <= 0 || L >= 1) return 0
  let lo = 0
  let hi = 0.5
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (isInGamut(L, mid, hDeg)) lo = mid
    else hi = mid
  }
  return lo
}

/** Keep chroma just inside the gamut boundary so encoding never clips the hue. */
const RAMP_VIVID = 0.9

function rampChroma(step, hue) {
  if (step <= 0) return 0
  return Number((maxInGamutChroma(hueLightness(step), hue) * RAMP_VIVID).toFixed(4))
}

/** Owned hue palettes: name -> OKLCH hue angle. Authored from scratch. */
const HUES = [
  ["red", 27],
  ["red-orange", 45],
  ["orange", 63],
  ["yellow-orange", 82],
  ["yellow", 100],
  ["yellow-green", 125],
  ["green", 148],
  ["blue-green", 190],
  ["blue", 255],
  ["blue-purple", 285],
  ["purple", 312],
  ["red-purple", 350],
  ["rose", 8],
  ["coral", 38],
  ["amber", 72],
  ["gold", 92],
  ["lime", 135],
  ["emerald", 160],
  ["jade", 174],
  ["teal", 183],
  ["turquoise", 196],
  ["cyan", 208],
  ["azure", 232],
  ["indigo", 272],
  ["violet", 296],
  ["orchid", 322],
  ["fuchsia", 334],
  ["magenta", 346],
]

function neutral(step) {
  return oklchToHex(lightness(step), 0, 0)
}

function hue(step, h) {
  return oklchToHex(hueLightness(step), rampChroma(step, h), h)
}

function brand(step) {
  const L = lightness(step)
  const C = step === 0 || step === 1000 ? 0 : 0.02
  return `oklch(${L} ${C} 260)`
}

function nearestCompact(step) {
  let best = COMPACT[0]
  let bestDist = Math.abs(step - best)
  for (const c of COMPACT) {
    const d = Math.abs(step - c)
    if (d < bestDist) {
      best = c
      bestDist = d
    }
  }
  return best
}

function block(selector, stepValues, comment) {
  // stepValues: Array<[stepName, sourceStep]>
  const lines = [`${selector} {`]
  if (comment) lines.push(`  /* ${comment} */`)
  for (const [name, source] of stepValues) {
    lines.push(`  --df-neutral-${name}: ${neutral(source)};`)
  }
  for (const [name, source] of stepValues) {
    lines.push(`  --df-brand-${name}: ${brand(source)};`)
  }
  for (const [key, h] of HUES) {
    for (const [name, source] of stepValues) {
      lines.push(`  --df-${key}-${name}: ${hue(source, h)};`)
    }
  }
  lines.push(`}`)
  return lines.join("\n")
}

// Colored ramps use 25 as their base (a light tint) instead of white (0), which
// belongs to neutral. 25 resolves to its exact value in both modes.
const STEP_NAMES = (() => {
  const names = [...DETAILED]
  names.splice(names.indexOf(30), 0, 25)
  return names
})()

const detailedPairs = STEP_NAMES.map((s) => [s, s])
const compactPairs = STEP_NAMES.map((s) => [s, s === 25 ? 25 : nearestCompact(s)])

const css = `/* Generated by scripts/generate-df-color-scales.mjs; do not edit by hand */
/* Color scale modes: compact (usual) vs detailed (every 10). */
/* Neutrals and hue palettes are hex; brand remains oklch until the brand Color Lab phase. */
/* Hue palettes use gamut-safe vivid chroma per step over the shared lightness anchors. */
/* Configure: <html data-df-color-scale="compact|detailed"> (default: detailed) */

/* Default + detailed: full 0–1000 by tens */
${block(":root, [data-df-color-scale=\"detailed\"]", detailedPairs, "detailed: 0, 10, 20, 30, 40 … 1000")}

/* Compact: same var names, values snapped to usual stops (0, 50, 100, 200 …) */
${block("[data-df-color-scale=\"compact\"]", compactPairs, "compact: snaps every step to 0/50/100/200/…/1000")}

/*
  Use --df-neutral-{step} / --df-brand-{step} / --df-{hue}-{step}.
  Compact mode keeps the detailed var surface so call sites never break;
  values collapse onto the usual stops.
*/
`

fs.writeFileSync(OUT, css)
console.log(
  `Wrote ${OUT}\n  detailed steps: ${DETAILED.length}\n  compact anchors: ${COMPACT.join(", ")}\n  neutrals: hex\n  hue palettes: ${HUES.map(([k]) => k).join(", ")}`
)
