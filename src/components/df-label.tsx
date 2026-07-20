"use client"

import * as React from "react"

import { cn } from "../lib/utils"

type LabelMarkVariant = "asterisk" | "text"

type LabelProps = React.ComponentProps<"label"> & {
  required?: boolean
  optional?: boolean
  requiredVariant?: LabelMarkVariant
  optionalVariant?: LabelMarkVariant
  requiredColor?: string
  brackets?: boolean
  subtext?: React.ReactNode
  trailing?: React.ReactNode
}

function formatMarkLabel(label: string, brackets: boolean) {
  return brackets ? `(${label})` : label
}

function Label({
  className,
  style,
  children,
  required = false,
  optional = false,
  requiredVariant = "asterisk",
  optionalVariant = "text",
  requiredColor,
  brackets = true,
  subtext,
  trailing,
  ...props
}: LabelProps) {
  const showRequired = required
  const showOptional = optional && !required

  return (
    <label
      data-df="label"
      data-required={showRequired ? "" : undefined}
      data-optional={showOptional ? "" : undefined}
      className={cn(className)}
      style={{
        ...(requiredColor != null
          ? ({ "--label-required": requiredColor } as React.CSSProperties)
          : null),
        ...style,
      }}
      {...props}
    >
      <span data-df="label-row">
        <span data-df="label-title">
          <span data-df="label-text">{children}</span>
          {showRequired ? (
            <span
              data-df="label-required"
              data-variant={requiredVariant}
              aria-hidden="true"
            >
              {requiredVariant === "text"
                ? formatMarkLabel("required", brackets)
                : "*"}
            </span>
          ) : null}
          {showOptional ? (
            <span
              data-df="label-optional"
              data-variant={optionalVariant}
              aria-hidden="true"
            >
              {optionalVariant === "asterisk"
                ? "*"
                : formatMarkLabel("optional", brackets)}
            </span>
          ) : null}
        </span>
        {trailing != null ? (
          <span data-df="label-trailing">{trailing}</span>
        ) : null}
      </span>
      {subtext != null ? (
        <span data-df="label-subtext">{subtext}</span>
      ) : null}
    </label>
  )
}

export { Label }
export type { LabelProps, LabelMarkVariant }
