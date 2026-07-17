import * as React from "react"

import { cn } from "../lib/utils"

type SpectrumGradientStop = {
  offset: number
  color: string
}

const DEFAULT_SPECTRUM_COLORS = [
  "var(--spectrum-text-color-1)",
  "var(--spectrum-text-color-2)",
  "var(--spectrum-text-color-3)",
  "var(--spectrum-text-color-4)",
] as const

const DEFAULT_SPECTRUM_STOPS: readonly SpectrumGradientStop[] = [
  { offset: 0, color: DEFAULT_SPECTRUM_COLORS[0] },
  { offset: 0.33, color: DEFAULT_SPECTRUM_COLORS[1] },
  { offset: 0.66, color: DEFAULT_SPECTRUM_COLORS[2] },
  { offset: 1, color: DEFAULT_SPECTRUM_COLORS[3] },
]

type SpectrumTextProps = {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

function colorsToStops(colors: string[]): SpectrumGradientStop[] {
  const stops =
    colors.length > 0 && colors[0] === colors[colors.length - 1]
      ? colors
      : [...colors, colors[0]]
  const last = Math.max(stops.length - 1, 1)
  return stops.map((color, index) => ({
    offset: index / last,
    color,
  }))
}

function usesCssVariables(colors: string[]): boolean {
  return colors.some((color) => color.includes("var("))
}

function buildSpectrumFillSvg(stops: SpectrumGradientStop[]): string {
  const stopMarkup = stops
    .map((stop) => {
      const offset = `${(stop.offset * 100).toFixed(2)}%`
      return `<stop offset="${offset}" stop-color="${stop.color}"/>`
    })
    .join("")

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" preserveAspectRatio="none">`,
    `<defs>`,
    `<linearGradient id="spectrum" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="200">`,
    stopMarkup,
    `</linearGradient>`,
    `</defs>`,
    `<rect width="400" height="200" fill="url(#spectrum)"/>`,
    `</svg>`,
  ].join("")
}

function spectrumFillDataUri(stops: SpectrumGradientStop[]): string {
  return `url("data:image/svg+xml,${encodeURIComponent(buildSpectrumFillSvg(stops))}")`
}

function spectrumCssGradient(colors: string[]): string {
  const stops =
    colors.length > 0 && colors[0] === colors[colors.length - 1]
      ? colors
      : [...colors, colors[0]]
  return `linear-gradient(135deg, ${stops.join(", ")})`
}

const SpectrumText = React.memo(function SpectrumText({
  children,
  className,
  colors,
  speed = 1,
}: SpectrumTextProps) {
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1
  const fillColors =
    colors != null && colors.length > 0
      ? colors
      : [...DEFAULT_SPECTRUM_COLORS]
  const backgroundImage = usesCssVariables(fillColors)
    ? spectrumCssGradient(fillColors)
    : spectrumFillDataUri(colorsToStops(fillColors))

  const gradientStyle = {
    backgroundImage,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration: `${10 / safeSpeed}s`,
  } as React.CSSProperties

  return (
    <span
      className={cn("df-spectrum-text", className)}
      data-df="spectrum-text"
    >
      <span className="df-spectrum-text-sr">{children}</span>
      <span
        className="df-spectrum-text-fill"
        data-slot="fill"
        style={gradientStyle}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  )
})

SpectrumText.displayName = "SpectrumText"

export {
  SpectrumText,
  DEFAULT_SPECTRUM_COLORS,
  DEFAULT_SPECTRUM_STOPS,
  buildSpectrumFillSvg,
}
export type { SpectrumTextProps, SpectrumGradientStop }
