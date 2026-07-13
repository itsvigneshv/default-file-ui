"use client"

import { ControlRow } from "./df-control-row"
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
  return (
    <ControlRow label={label} valueLabel={value.toFixed(digits)}>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => {
          const v = Array.isArray(next) ? next[0] : next
          if (typeof v === "number") onChange(v)
        }}
      />
    </ControlRow>
  )
}

export { NumberSlider }
