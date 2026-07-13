import * as React from "react"

import { Label } from "./df-label"

function ControlRow({
  label,
  valueLabel,
  children,
}: {
  label: string
  valueLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {valueLabel ? (
          <span className="font-mono text-[11px] text-muted-foreground">
            {valueLabel}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export { ControlRow }
