"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"

import { Input } from "./df-input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./df-popover"
import { Tabs, TabsList, TabsTrigger } from "./df-tabs"
import { cn } from "../lib/utils"

type ColorMode = "hex" | "rgb" | "hsl" | "hsb"
type RGB = { r: number; g: number; b: number }
type HSV = { h: number; s: number; v: number }
type HSL = { h: number; s: number; l: number }

const MODES: { id: ColorMode; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "rgb", label: "RGB" },
  { id: "hsl", label: "HSL" },
  { id: "hsb", label: "HSB" },
]

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function round(n: number, digits = 0) {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

function hexToRgb(hex: string): RGB | null {
  const raw = hex.replace("#", "").trim()
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) =>
    Math.round(clamp(n, 0, 255))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase()
  return `#${to(r)}${to(g)}${to(b)}`
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  return { h, s, v: max }
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  }
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s, l }
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  }
}

function hexToHsv(hex: string): HSV {
  const rgb = hexToRgb(hex)
  if (!rgb) return { h: 0, s: 0, v: 0 }
  return rgbToHsv(rgb.r, rgb.g, rgb.b)
}

function hsvToHex(hsv: HSV) {
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

function normalizeHex(value: string): string | null {
  const trimmed = value.trim()
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
  const rgb = hexToRgb(withHash)
  if (!rgb) return null
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

function ChannelField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </span>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        className="h-8 px-2 font-mono text-xs tabular-nums"
        onChange={(event) => {
          const next = Number(event.target.value)
          if (!Number.isFinite(next)) return
          onChange(clamp(next, min, max))
        }}
      />
    </label>
  )
}

type ColorPickerTrailing = "hex" | "clear"

type ColorPickerProps = {
  value: string
  onChange: (hex: string) => void
  label?: string
  className?: string
  /**
   * Pill chrome beside the swatch.
   * - `hex` — show the value; the whole pill opens the picker
   * - `clear` — show an X; the pill (minus X) opens the picker
   * Omit for a swatch-only trigger.
   */
  trailing?: ColorPickerTrailing
  /** Called when the clear (X) control is pressed. Required when `trailing="clear"`. */
  onClear?: () => void
  clearLabel?: string
}

function SwatchDot({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative block size-4 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10",
        className
      )}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: value }}
      />
    </span>
  )
}

export function ColorPicker({
  value,
  onChange,
  label = "Pick color",
  className,
  trailing,
  onClear,
  clearLabel = "Remove color",
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ColorMode>("hex")
  const [hsv, setHsv] = useState(() => hexToHsv(value))
  const [hexDraft, setHexDraft] = useState(value.toUpperCase())
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) return
    setHsv(hexToHsv(value))
    setHexDraft(value.toUpperCase())
  }, [value, open])

  const rgb = useMemo(
    () => hsvToRgb(hsv.h, hsv.s, hsv.v),
    [hsv.h, hsv.s, hsv.v]
  )
  const hsl = useMemo(
    () => rgbToHsl(rgb.r, rgb.g, rgb.b),
    [rgb.r, rgb.g, rgb.b]
  )
  const hex = useMemo(() => hsvToHex(hsv), [hsv])

  const commitHsv = (next: HSV) => {
    const safe = {
      h: clamp(next.h, 0, 359.99),
      s: clamp(next.s, 0, 1),
      v: clamp(next.v, 0, 1),
    }
    setHsv(safe)
    const nextHex = hsvToHex(safe)
    setHexDraft(nextHex)
    onChange(nextHex)
  }

  const commitRgb = (next: RGB) => {
    commitHsv(rgbToHsv(next.r, next.g, next.b))
  }

  const commitHsl = (next: HSL) => {
    commitRgb(hslToRgb(next.h, next.s, next.l))
  }

  const updateSvFromPointer = (clientX: number, clientY: number) => {
    const el = svRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const s = clamp((clientX - rect.left) / rect.width, 0, 1)
    const v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1)
    commitHsv({ ...hsv, s, v })
  }

  const updateHueFromPointer = (_clientX: number, clientY: number) => {
    const el = hueRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const h = clamp(((clientY - rect.top) / rect.height) * 360, 0, 359.99)
    commitHsv({ ...hsv, h })
  }

  const bindDrag = (
    onMove: (clientX: number, clientY: number) => void
  ) => {
    return (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      onMove(event.clientX, event.clientY)
      const move = (e: PointerEvent) => onMove(e.clientX, e.clientY)
      const up = () => {
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", up)
      }
      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", up)
    }
  }

  const pureHue = hsvToHex({ h: hsv.h, s: 1, v: 1 })

  const popover = (
    <PopoverContent
      align="start"
      side="bottom"
      sideOffset={8}
      className="w-[300px] gap-3 overflow-visible rounded-xl p-3 shadow-xl"
    >
      {/* Saturation–brightness panel with vertical hue strip */}
      <div className="flex shrink-0 gap-2.5" style={{ height: 220 }}>
        <div
          ref={svRef}
          className="relative min-w-0 flex-1 cursor-crosshair touch-none overflow-hidden rounded-lg ring-1 ring-black/10"
          style={{
            height: 220,
            backgroundColor: pureHue,
            backgroundImage: `
                linear-gradient(to top, #000, transparent),
                linear-gradient(to right, #fff, transparent)
              `,
          }}
          onPointerDown={bindDrag(updateSvFromPointer)}
        >
          <span
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
            style={{
              left: `${hsv.s * 100}%`,
              top: `${(1 - hsv.v) * 100}%`,
              backgroundColor: hex,
            }}
          />
        </div>

        <div
          ref={hueRef}
          className="relative shrink-0 cursor-ns-resize touch-none overflow-hidden rounded-lg ring-1 ring-black/10"
          style={{
            width: 20,
            height: 220,
            backgroundImage:
              "linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
          }}
          onPointerDown={bindDrag(updateHueFromPointer)}
        >
          <span
            className="pointer-events-none absolute left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
            style={{
              top: `${(hsv.h / 360) * 100}%`,
              backgroundColor: pureHue,
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="size-9 shrink-0 rounded-lg ring-1 ring-black/10"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
        <Tabs
          value={mode}
          onValueChange={(next) => setMode(next as ColorMode)}
          variant="segment"
          size="sm"
          className="min-w-0 flex-1"
        >
          <TabsList aria-label="Color input mode">
            {MODES.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {mode === "hex" ? (
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Hex
          </span>
          <Input
            value={hexDraft}
            spellCheck={false}
            aria-label="Hex color"
            className="h-8 font-mono text-xs uppercase"
            onChange={(event) => {
              const next = event.target.value.toUpperCase()
              setHexDraft(next)
              const normalized = normalizeHex(next)
              if (!normalized) return
              setHsv(hexToHsv(normalized))
              onChange(normalized)
            }}
            onBlur={() => {
              const normalized = normalizeHex(hexDraft)
              if (normalized) {
                setHexDraft(normalized)
                return
              }
              setHexDraft(hex)
            }}
          />
        </label>
      ) : null}

      {mode === "rgb" ? (
        <div className="flex gap-1.5">
          <ChannelField
            label="R"
            value={round(rgb.r)}
            min={0}
            max={255}
            onChange={(r) => commitRgb({ ...rgb, r })}
          />
          <ChannelField
            label="G"
            value={round(rgb.g)}
            min={0}
            max={255}
            onChange={(g) => commitRgb({ ...rgb, g })}
          />
          <ChannelField
            label="B"
            value={round(rgb.b)}
            min={0}
            max={255}
            onChange={(b) => commitRgb({ ...rgb, b })}
          />
        </div>
      ) : null}

      {mode === "hsl" ? (
        <div className="flex gap-1.5">
          <ChannelField
            label="H"
            value={round(hsl.h)}
            min={0}
            max={360}
            onChange={(h) => commitHsl({ ...hsl, h })}
          />
          <ChannelField
            label="S"
            value={round(hsl.s * 100)}
            min={0}
            max={100}
            onChange={(s) => commitHsl({ ...hsl, s: s / 100 })}
          />
          <ChannelField
            label="L"
            value={round(hsl.l * 100)}
            min={0}
            max={100}
            onChange={(l) => commitHsl({ ...hsl, l: l / 100 })}
          />
        </div>
      ) : null}

      {mode === "hsb" ? (
        <div className="flex gap-1.5">
          <ChannelField
            label="H"
            value={round(hsv.h)}
            min={0}
            max={360}
            onChange={(h) => commitHsv({ ...hsv, h })}
          />
          <ChannelField
            label="S"
            value={round(hsv.s * 100)}
            min={0}
            max={100}
            onChange={(s) => commitHsv({ ...hsv, s: s / 100 })}
          />
          <ChannelField
            label="B"
            value={round(hsv.v * 100)}
            min={0}
            max={100}
            onChange={(v) => commitHsv({ ...hsv, v: v / 100 })}
          />
        </div>
      ) : null}
    </PopoverContent>
  )

  if (trailing === "hex") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={label}
              className={cn(
                "inline-flex h-8 w-fit shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 pl-1.5 pr-2.5 text-left leading-none transition-colors hover:border-neutral-300",
                className
              )}
            />
          }
        >
          <SwatchDot value={value} />
          <span className="text-[11px] font-semibold uppercase leading-none tabular-nums text-neutral-700">
            {value}
          </span>
        </PopoverTrigger>
        {popover}
      </Popover>
    )
  }

  if (trailing === "clear") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            "inline-flex h-8 w-fit shrink-0 items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 pl-1.5 pr-0.5",
            className
          )}
        >
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label={label}
                className="inline-flex min-h-0 min-w-0 flex-1 cursor-pointer items-center rounded-full py-1 pr-0.5 text-left leading-none"
              />
            }
          >
            <SwatchDot value={value} />
          </PopoverTrigger>
          <button
            type="button"
            className="flex size-5 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
            aria-label={clearLabel}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onClear?.()
            }}
          >
            <X className="size-3" aria-hidden />
          </button>
        </div>
        {popover}
      </Popover>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={label}
            className={cn(
              "relative size-4 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-black/10 transition-transform hover:scale-105",
              className
            )}
          />
        }
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </PopoverTrigger>
      {popover}
    </Popover>
  )
}

export type { ColorPickerProps, ColorPickerTrailing }
