import * as React from "react"

import { cn } from "../lib/utils"

type SpinnerSize = "xs" | "sm" | "md" | "lg"

type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: SpinnerSize
}

function Spinner({
  className,
  size = "md",
  "aria-label": ariaLabel = "Loading",
  "aria-hidden": ariaHidden,
  ...props
}: SpinnerProps) {
  const isHidden = ariaHidden === true || ariaHidden === "true"

  return (
    <span
      data-df="spinner"
      data-size={size}
      className={cn("df-spinner", className)}
      role={isHidden ? undefined : "status"}
      aria-label={isHidden ? undefined : ariaLabel}
      aria-hidden={isHidden ? true : undefined}
      {...props}
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle className="df-spinner-track" cx="8" cy="8" r="6" />
        <circle className="df-spinner-indicator" cx="8" cy="8" r="6" />
      </svg>
    </span>
  )
}

export { Spinner }
export type { SpinnerProps, SpinnerSize }
