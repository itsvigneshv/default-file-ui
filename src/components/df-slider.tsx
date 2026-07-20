"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

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
  disabled?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function Slider({
  className,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  disabled,
  ...props
}: SliderProps) {
  const [values, setValues] = useControllableState({
    value,
    defaultValue: defaultValue ?? [min],
    onChange: onValueChange,
  })

  const current = clamp(values[0] ?? min, min, max)
  const span = max - min || 1
  const pct = ((current - min) / span) * 100

  const commit = (clientX: number, track: HTMLElement) => {
    const rect = track.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    const raw = min + ratio * (max - min)
    const stepped = Math.round(raw / step) * step
    setValues([clamp(stepped, min, max)])
  }

  return (
    <div
      data-df="slider"
      data-disabled={disabled ? "" : undefined}
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <div
        className="relative flex w-full touch-none items-center select-none"
        onPointerDown={(event) => {
          if (disabled) return
          const track = event.currentTarget
          track.setPointerCapture(event.pointerId)
          commit(event.clientX, track)
          const move = (e: PointerEvent) => commit(e.clientX, track)
          const up = () => {
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
          }
          window.addEventListener("pointermove", move)
          window.addEventListener("pointerup", up)
        }}
      >
        <div data-df="slider-track">
          <div data-df="slider-range" style={{ width: `${pct}%` }} />
        </div>
        <span
          data-df="slider-thumb"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          style={{
            position: "absolute",
            left: `calc(${pct}% - 2 * var(--spacing-unit, 0.25rem))`,
          }}
          onKeyDown={(event) => {
            if (disabled) return
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              setValues([clamp(current + step, min, max)])
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              setValues([clamp(current - step, min, max)])
            }
          }}
        />
      </div>
    </div>
  )
}

export { Slider }
