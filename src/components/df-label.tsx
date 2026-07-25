"use client"

import * as React from "react"

import { cn } from "../lib/utils"

type LabelMarkVariant = "asterisk" | "text"
type LabelAs = "label" | "div"
type LabelInsetAlign = "left" | "content" | "custom"

type LabelProps = Omit<React.ComponentPropsWithoutRef<"div">, "color"> & {
  as?: LabelAs
  htmlFor?: string
  required?: boolean
  optional?: boolean
  requiredVariant?: LabelMarkVariant
  optionalVariant?: LabelMarkVariant
  requiredColor?: string
  brackets?: boolean
  subtext?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  color?: string
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  insetAlign?: LabelInsetAlign
  insetSize?: string
}

function formatMarkLabel(label: string, brackets: boolean) {
  return brackets ? `(${label})` : label
}

function Label({
  as = "label",
  className,
  style,
  children,
  htmlFor,
  required = false,
  optional = false,
  requiredVariant = "asterisk",
  optionalVariant = "text",
  requiredColor,
  brackets = true,
  subtext,
  leading,
  trailing,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  insetAlign = "left",
  insetSize,
  ...props
}: LabelProps) {
  const showOptional = optional && !required
  const rootProps = {
    "data-df": "label",
    "data-required": required ? "" : undefined,
    "data-optional": showOptional ? "" : undefined,
    "data-inset": insetAlign,
    className: cn(className),
    style: {
      ...(requiredColor != null ? { "--label-required": requiredColor } : null),
      ...(color != null ? { "--df-label-color": color } : null),
      ...(fontFamily != null ? { "--df-label-font": fontFamily } : null),
      ...(fontSize != null ? { "--df-label-size": fontSize } : null),
      ...(fontWeight != null ? { "--df-label-weight": fontWeight } : null),
      ...(insetAlign === "custom" && insetSize != null
        ? { "--df-label-inset-custom": insetSize }
        : null),
      ...style,
    } as React.CSSProperties,
    ...props,
  }

  const content = (
    <>
      <span data-df="label-row">
        <span data-df="label-title">
          {leading != null ? (
            <span data-df="label-leading">{leading}</span>
          ) : null}
          <span data-df="label-text">{children}</span>
          {required ? (
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
    </>
  )

  return React.createElement(
    as === "div" ? "div" : "label",
    {
      ...rootProps,
      ...(as !== "div" ? { htmlFor } : null),
    },
    content
  )
}

export { Label }
export type { LabelAs, LabelInsetAlign, LabelMarkVariant, LabelProps }
