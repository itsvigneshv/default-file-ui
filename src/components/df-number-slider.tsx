"use client"

import { Label } from "./df-label"
import { Slider } from "./df-slider"

function NumberSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  const digits = step >= 1 ? 0 : step >= 0.1 ? 1 : 2
  const bounded = Math.min(max, Math.max(min, value))

  return (
    <div className="flex flex-col gap-2">
      <Label
        className="text-xs text-muted-foreground"
        trailing={
          <span className="font-mono text-11">{bounded.toFixed(digits)}</span>
        }
      >
        {label}
      </Label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[bounded]}
        onValueChange={(next) => {
          const v = Array.isArray(next) ? next[0] : next
          if (typeof v === "number") onChange(v)
        }}
      />
    </div>
  )
}

export { NumberSlider }
