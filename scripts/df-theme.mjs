/**
 * Default File UI theme bible - owned spacing, type, color, and effect scales.
 *
 * Colors: semantic tokens + `--df-neutral-*` (compact/detailed via
 * `data-df-color-scale` on <html>). Compat `zinc-*` / `gray-*` aliases map to the
 * same DF neutral ramp so tool chrome follows scale mode without JSX renames.
 */

/** Compact-friendly + detailed steps used by utility color maps. */
export const DF_NEUTRAL_STEPS = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 350, 400,
  450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000,
]

/** Common gray step aliases (zinc-* / gray-* → --df-neutral-*). */
export const COMPAT_NEUTRAL_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
]

/** Spacing scale (rem). */
export const SPACING = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
}

/**
 * Radius - DF tokens (see df-tokens.css). Matches prior app radii, not raw TW.
 */
export const RADIUS = {
  none: "0",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  "3xl": "var(--radius-3xl)",
  "4xl": "var(--radius-4xl)",
  full: "9999px",
}

/** Font size → [font-size, line-height] */
export const FONT_SIZE = {
  xs: ["0.75rem", "1rem"],
  sm: ["0.875rem", "1.25rem"],
  base: ["1rem", "1.5rem"],
  lg: ["1.125rem", "1.75rem"],
  xl: ["1.25rem", "1.75rem"],
  "2xl": ["1.5rem", "2rem"],
  "3xl": ["1.875rem", "2.25rem"],
  "4xl": ["2.25rem", "2.5rem"],
  "5xl": ["3rem", "1"],
  "6xl": ["3.75rem", "1"],
  "7xl": ["4.5rem", "1"],
  "8xl": ["6rem", "1"],
  "9xl": ["8rem", "1"],
}

export const FONT_WEIGHT = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
}

export const TRACKING = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
}

export const LEADING = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
}

export const MAX_W = {
  "3xs": "16rem",
  "2xs": "18rem",
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
  "7xl": "80rem",
  full: "100%",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
  prose: "65ch",
  none: "none",
  screen: "100vw",
}

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  /** Wider screen - freeform desktop range. */
  "3xl": "1920px",
}

export const SHADOW = {
  "2xs": "0 1px rgb(0 0 0 / 0.05)",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  none: "none",
  // Compat aliases used in older call sites
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
}

/** Named shadows kept from pre-migration static map. */
export const SHADOW_COMPAT = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  none: "none",
}

export const BLUR = {
  none: "0",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "40px",
  "3xl": "64px",
}

export const Z_INDEX = {
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  auto: "auto",
}

export const OPACITY = Object.fromEntries(
  [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100].map((n) => [
    String(n),
    String(n / 100),
  ])
)

/** Semantic + literal colors used by utilities. */
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
    white: "#fff",
    black: "#000",
    transparent: "transparent",
    current: "currentColor",
  }

  // Full DF neutral ramp (compact missing steps fall back in CSS via var()).
  for (const step of DF_NEUTRAL_STEPS) {
    COLORS[`neutral-${step}`] = `var(--df-neutral-${step})`
  }

  // Compat: zinc-* → same DF neutral tokens (follows compact/detailed).
  for (const step of COMPAT_NEUTRAL_STEPS) {
    COLORS[`zinc-${step}`] = `var(--df-neutral-${step})`
  }
  // Extra zinc aliases that appear in tooling
  COLORS["zinc-0"] = "var(--df-neutral-0)"
  COLORS["zinc-850"] = "var(--df-neutral-850, var(--df-neutral-900))"
  COLORS["zinc-1000"] = "var(--df-neutral-1000)"

  // gray-* also maps to DF neutrals
  for (const step of COMPAT_NEUTRAL_STEPS) {
    COLORS[`gray-${step}`] = `var(--df-neutral-${step})`
  }

  return COLORS
}

export const COLORS = buildColors()

/** Markers that are class names but not spacing/color utilities (DF / home chrome). */
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
  "df-btn-icon",
  "df-btn-icon-xs",
  "df-btn-icon-sm",
  "df-btn-icon-lg",
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
  // Variant prop values that the class scanner may pick up as tokens
  "outline",
  "default",
  "secondary",
  "ghost",
  "destructive",
  "link",
])
