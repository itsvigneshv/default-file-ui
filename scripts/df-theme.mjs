
export const DF_NEUTRAL_STEPS = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 350, 400,
  450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000,
]

export const COMPAT_NEUTRAL_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
]

function spacingToken(n) {
  return `calc(${n} * var(--spacing-unit, 0.25rem))`
}

function buildSpacingScale() {
  const scale = {
    none: "0",
    0: "0",
    px: "var(--spacing-px)",
    0.5: spacingToken(0.5),
    1: spacingToken(1),
    1.5: spacingToken(1.5),
    2.5: spacingToken(2.5),
    3: spacingToken(3),
    3.5: spacingToken(3.5),
    5: spacingToken(5),
    7: spacingToken(7),
    9: spacingToken(9),
    11: spacingToken(11),
  }
  for (let n = 0; n <= 200; n += 2) {
    scale[n] = n === 0 ? "0" : spacingToken(n)
  }
  return scale
}

export const SPACING = buildSpacingScale()

export const RADIUS = {
  none: "0",
  xxs: "var(--radius-xxs)",
  xs: "var(--radius-xs)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  "3xl": "var(--radius-3xl)",
  "4xl": "var(--radius-4xl)",
  full: "var(--radius-full)",
}

export const CORNER_SHAPE = {
  round: "var(--df-corner-shape-round)",
  smooth: "var(--df-corner-shape-smooth)",
}

export const FONT_SIZE = {
  9: ["var(--df-text-9)", "var(--df-leading-3)"],
  "2xs": ["var(--df-text-2xs)", "var(--df-leading-3)"],
  11: ["var(--df-text-11)", "var(--df-leading-4)"],
  xs: ["var(--df-text-xs)", "var(--df-leading-4)"],
  13: ["var(--df-text-13)", "var(--df-leading-4)"],
  sm: ["var(--df-text-sm)", "var(--df-leading-5)"],
  base: ["var(--df-text-base)", "var(--df-leading-6)"],
  lg: ["var(--df-text-lg)", "var(--df-leading-7)"],
  xl: ["var(--df-text-xl)", "var(--df-leading-7)"],
  "2xl": ["var(--df-text-2xl)", "var(--df-leading-8)"],
  "3xl": ["var(--df-text-3xl)", "var(--df-leading-9)"],
  "4xl": ["var(--df-text-4xl)", "var(--df-leading-10)"],
  "5xl": ["var(--df-text-5xl)", "var(--df-leading-none)"],
  "6xl": ["var(--df-text-6xl)", "var(--df-leading-none)"],
  "7xl": ["var(--df-text-7xl)", "var(--df-leading-none)"],
  "8xl": ["var(--df-text-8xl)", "var(--df-leading-none)"],
  "9xl": ["var(--df-text-9xl)", "var(--df-leading-none)"],
  display: ["var(--df-text-display)", "var(--df-leading-none)"],
}

export const FONT_WEIGHT = {
  thin: "var(--df-font-weight-thin)",
  extralight: "var(--df-font-weight-extralight)",
  light: "var(--df-font-weight-light)",
  normal: "var(--df-font-weight-normal)",
  medium: "var(--df-font-weight-medium)",
  semibold: "var(--df-font-weight-semibold)",
  bold: "var(--df-font-weight-bold)",
  extrabold: "var(--df-font-weight-extrabold)",
  black: "var(--df-font-weight-black)",
}

export const TRACKING = {
  display: "var(--df-tracking-display)",
  tighter: "var(--df-tracking-tighter)",
  tight: "var(--df-tracking-tight)",
  snug: "var(--df-tracking-snug)",
  normal: "var(--df-tracking-normal)",
  wide: "var(--df-tracking-wide)",
  wider: "var(--df-tracking-wider)",
  label: "var(--df-tracking-label)",
  widest: "var(--df-tracking-widest)",
}

export const LEADING = {
  none: "var(--df-leading-none)",
  tight: "var(--df-leading-tight)",
  snug: "var(--df-leading-snug)",
  normal: "var(--df-leading-normal)",
  relaxed: "var(--df-leading-relaxed)",
  loose: "var(--df-leading-loose)",
  3: "var(--df-leading-3)",
  4: "var(--df-leading-4)",
  5: "var(--df-leading-5)",
  6: "var(--df-leading-6)",
  7: "var(--df-leading-7)",
  8: "var(--df-leading-8)",
  9: "var(--df-leading-9)",
  10: "var(--df-leading-10)",
}

export const MAX_W = {
  "3xs": "var(--df-max-w-3xs)",
  "2xs": "var(--df-max-w-2xs)",
  xs: "var(--df-max-w-xs)",
  sm: "var(--df-max-w-sm)",
  md: "var(--df-max-w-md)",
  lg: "var(--df-max-w-lg)",
  xl: "var(--df-max-w-xl)",
  "2xl": "var(--df-max-w-2xl)",
  "3xl": "var(--df-max-w-3xl)",
  "4xl": "var(--df-max-w-4xl)",
  "5xl": "var(--df-max-w-5xl)",
  "6xl": "var(--df-max-w-6xl)",
  "7xl": "var(--df-max-w-7xl)",
  full: "100%",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
  prose: "var(--df-max-w-prose)",
  none: "none",
  screen: "100vw",
}

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  "3xl": "1920px",
}

/** Breakpoint names in scale order. */
export const BREAKPOINT_NAMES = Object.keys(BREAKPOINTS)

/** Min-width value for a breakpoint name. */
export function breakpointMinWidth(name) {
  const value = BREAKPOINTS[name]
  if (!value) throw new Error(`Unknown breakpoint "${name}"`)
  return value
}

/** Exclusive max-width value for a breakpoint name. */
export function breakpointMaxWidth(name) {
  const base = BREAKPOINTS[name]
  if (!base) throw new Error(`Unknown breakpoint "${name}"`)
  return `${parseInt(base, 10) - 1}px`
}

export const SHADOW = {
  "2xs": "var(--df-shadow-2xs)",
  xs: "var(--df-shadow-xs)",
  sm: "var(--df-shadow-sm)",
  md: "var(--df-shadow-md)",
  lg: "var(--df-shadow-lg)",
  xl: "var(--df-shadow-xl)",
  "2xl": "var(--df-shadow-2xl)",
  none: "none",
  DEFAULT: "var(--df-shadow-sm)",
}

export const SHADOW_COMPAT = {
  sm: "var(--df-shadow-xs)",
  md: "var(--df-shadow-md)",
  lg: "var(--df-shadow-lg)",
  xl: "var(--df-shadow-xl)",
  "2xl": "var(--df-shadow-2xl)",
  none: "none",
}

export const BLUR = {
  none: "0",
  xs: "var(--df-blur-xs)",
  sm: "var(--df-blur-sm)",
  md: "var(--df-blur-md)",
  lg: "var(--df-blur-lg)",
  xl: "var(--df-blur-xl)",
  "2xl": "var(--df-blur-2xl)",
  "3xl": "var(--df-blur-3xl)",
}

export const Z_INDEX = {
  0: "var(--z-base)",
  10: "var(--z-sticky)",
  20: "var(--z-dock)",
  30: "var(--z-nav)",
  40: "var(--z-header)",
  50: "var(--z-overlay)",
  60: "var(--z-toast)",
  auto: "auto",
}

export const OPACITY = Object.fromEntries(
  [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100].map((n) => [
    String(n),
    `var(--df-opacity-${n})`,
  ])
)

export function buildColors() {
  const COLORS = {
    background: "var(--background)",
    foreground: "var(--foreground)",
    card: "var(--card)",
    "card-foreground": "var(--card-foreground)",
    popover: "var(--popover)",
    "popover-foreground": "var(--popover-foreground)",
    primary: "var(--primary)",
    "primary-foreground": "var(--primary-foreground)",
    secondary: "var(--secondary)",
    "secondary-foreground": "var(--secondary-foreground)",
    muted: "var(--muted)",
    "muted-foreground": "var(--muted-foreground)",
    accent: "var(--accent)",
    "accent-foreground": "var(--accent-foreground)",
    destructive: "var(--destructive)",
    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",
    white: "var(--df-neutral-0)",
    black: "var(--df-neutral-1000)",
    "brand-ink": "var(--brand-ink)",
    "brand-ink-foreground": "var(--brand-ink-foreground)",
    transparent: "transparent",
    current: "currentColor",
  }

  for (const step of DF_NEUTRAL_STEPS) {
    COLORS[`neutral-${step}`] = `var(--df-neutral-${step})`
  }

  for (const step of COMPAT_NEUTRAL_STEPS) {
    COLORS[`zinc-${step}`] = `var(--df-neutral-${step})`
  }
  COLORS["zinc-0"] = "var(--df-neutral-0)"
  COLORS["zinc-850"] = "var(--df-neutral-850, var(--df-neutral-900))"
  COLORS["zinc-1000"] = "var(--df-neutral-1000)"

  for (const step of COMPAT_NEUTRAL_STEPS) {
    COLORS[`gray-${step}`] = `var(--df-neutral-${step})`
  }

  return COLORS
}

export const COLORS = buildColors()

export const NON_UTILITY_ALLOWLIST = new Set([
  "df-btn",
  "df-btn-default",
  "df-btn-default-size",
  "df-btn-outline",
  "df-btn-secondary",
  "df-btn-ghost",
  "df-btn-destructive",
  "df-btn-link",
  "df-btn-xs",
  "df-btn-sm",
  "df-btn-lg",
  "df-btn-xl",
  "df-btn-2xl",
  "df-btn-icon",
  "df-btn-icon-xs",
  "df-btn-icon-sm",
  "df-btn-icon-lg",
  "df-btn-icon-xl",
  "df-btn-icon-2xl",
  "df-input",
  "df-toggle-group",
  "df-toggle-item",
  "df-toggle-item-outline",
  "df-toggle-item-default",
  "df-toggle-item-sm",
  "df-toggle-item-lg",
  "df-toast",
  "df-toast-close",
  "df-toast-icon",
  "df-toast-message",
  "df-toaster",
  "home-grid-fade",
  "home-hero-stage",
  "home-hero-collage-gap",
  "home-preview-frame",
  "home-preview-mesh",
  "home-preview-principles",
  "home-preview-shader",
  "home-reveal",
  "home-section-tools",
  "home-stage-frame",
  "noise-rect",
  "radials",
  "svg",
  "group",
  "peer",
  "custom",
  "dark",
  "is-inview",
  "is-active",
  "outline",
  "default",
  "secondary",
  "ghost",
  "destructive",
  "link",
  "center",
  "left",
])
