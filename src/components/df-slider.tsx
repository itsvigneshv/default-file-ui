"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type SliderFillMotion = "none" | "sparkle"

type SliderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  fillMotion?: SliderFillMotion
  disabled?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function snapToStep(value: number, min: number, max: number, step: number) {
  const stepped = Math.round((value - min) / step) * step + min
  const precision = String(step).includes(".")
    ? (String(step).split(".")[1]?.length ?? 0)
    : 0
  const rounded =
    precision > 0 ? Number(stepped.toFixed(precision)) : stepped
  return clamp(rounded, min, max)
}

function Slider({
  className,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  fillMotion = "sparkle",
  disabled,
  ...props
}: SliderProps) {
  const [values, setValues] = useControllableState({
    value,
    defaultValue: defaultValue ?? [min],
    onChange: onValueChange,
  })
  const [dragPct, setDragPct] = React.useState<number | null>(null)

  const current = snapToStep(values[0] ?? min, min, max, step)
  const span = max - min || 1
  const valuePct = ((current - min) / span) * 100
  const visualPct = dragPct ?? valuePct
  const dragging = dragPct != null

  const scrub = React.useCallback(
    (clientX: number, track: HTMLElement) => {
      const rect = track.getBoundingClientRect()
      if (rect.width <= 0) return
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      setDragPct(ratio * 100)
      setValues([snapToStep(min + ratio * (max - min), min, max, step)])
    },
    [max, min, setValues, step]
  )

  const onControlPointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (disabled) return
    event.preventDefault()
    const track = event.currentTarget
    track.setPointerCapture(event.pointerId)
    scrub(event.clientX, track)
    const move = (e: PointerEvent) => scrub(e.clientX, track)
    const end = () => {
      setDragPct(null)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
  }

  const onThumbKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      setValues([snapToStep(current + step, min, max, step)])
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      setValues([snapToStep(current - step, min, max, step)])
    }
  }

  return (
    <div
      data-df="slider"
      data-disabled={disabled ? "" : undefined}
      data-dragging={dragging ? "" : undefined}
      data-fill-motion={fillMotion}
      className={cn(className)}
      {...props}
    >
      <div data-df="slider-control" onPointerDown={onControlPointerDown}>
        <div data-df="slider-track">
          <div
            data-df="slider-range"
            style={{ width: `${visualPct}%` }}
          />
        </div>
        <span
          data-df="slider-thumb"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-disabled={disabled || undefined}
          style={{ left: `${visualPct}%` }}
          onKeyDown={onThumbKeyDown}
        />
      </div>
    </div>
  )
}

export { Slider }
export type { SliderFillMotion }
