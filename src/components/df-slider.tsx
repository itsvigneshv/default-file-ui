"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type SliderVariant = "bar" | "line"

type SliderValueFormat = "number" | "percent"

type SliderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange" | "color"
> & {
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  disabled?: boolean
  variant?: SliderVariant
  label?: React.ReactNode
  leading?: React.ReactNode
  showValue?: boolean
  valueFormat?: SliderValueFormat
  formatValue?: (value: number) => string
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

function formatByStep(value: number, step: number) {
  const digits = step >= 1 ? 0 : step >= 0.1 ? 1 : 2
  return value.toFixed(digits)
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
  variant = "bar",
  label,
  leading,
  showValue,
  valueFormat = "number",
  formatValue,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SliderProps) {
  const labelId = React.useId()
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

  const resolvedShowValue =
    showValue ??
    (formatValue != null || label != null || leading != null)

  const displayValue = React.useMemo(() => {
    if (formatValue) return formatValue(current)
    if (valueFormat === "percent") {
      return `${Math.round(valuePct)}%`
    }
    return formatByStep(current, step)
  }, [current, formatValue, step, valueFormat, valuePct])

  const resolvedAriaLabelledBy =
    ariaLabelledBy ?? (label != null ? labelId : undefined)
  const resolvedAriaLabel =
    ariaLabel ??
    (typeof label === "string" && !resolvedAriaLabelledBy ? label : undefined)

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
    } else if (event.key === "Home") {
      event.preventDefault()
      setValues([min])
    } else if (event.key === "End") {
      event.preventDefault()
      setValues([max])
    }
  }

  const showHeader =
    label != null || leading != null || resolvedShowValue

  return (
    <div
      data-df="slider"
      data-variant={variant}
      data-disabled={disabled ? "" : undefined}
      className={cn(className)}
      {...props}
    >
      {showHeader ? (
        <div data-df="slider-header">
          <div data-df="slider-heading">
            {leading != null ? (
              <span data-df="slider-leading" aria-hidden="true">
                {leading}
              </span>
            ) : null}
            {label != null ? (
              <span data-df="slider-label" id={labelId}>
                {label}
              </span>
            ) : null}
          </div>
          {resolvedShowValue ? (
            <span data-df="slider-value">{displayValue}</span>
          ) : null}
        </div>
      ) : null}
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
          aria-label={resolvedAriaLabel}
          aria-labelledby={resolvedAriaLabelledBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={displayValue}
          aria-disabled={disabled || undefined}
          style={{ left: `${visualPct}%` }}
          onKeyDown={onThumbKeyDown}
        />
      </div>
    </div>
  )
}

export { Slider }
export type { SliderProps, SliderValueFormat, SliderVariant }
