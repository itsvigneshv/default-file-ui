import * as React from "react"

import { cn } from "../lib/utils"

function ChoiceChip({
  className,
  selected,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
}) {
  return (
    <button
      type="button"
      data-df="choice-chip"
      data-selected={selected ? "true" : undefined}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { ChoiceChip }
