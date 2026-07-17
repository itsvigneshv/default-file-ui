import * as React from "react"

import {
  dfCornerShapeStyle,
  type DfCornerShape,
} from "../lib/corner-shape"
import { cn } from "../lib/utils"

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl"

type BadgeRadius =
  | "none"
  | "xxs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full"

type BadgeProps = React.HTMLAttributes<HTMLElement> & {
  variant?: BadgeVariant
  size?: BadgeSize
  radius?: BadgeRadius
  cornerShape?: DfCornerShape
  count?: number | string
  render?: React.ReactElement<{
    className?: string
    children?: React.ReactNode
    style?: React.CSSProperties
  }>
}

function resolveCounterVariant(variant: BadgeVariant): BadgeVariant {
  return variant === "default" ? "secondary" : "default"
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(function Badge(
  {
    className,
    style,
    variant = "default",
    size = "md",
    radius = "4xl",
    cornerShape,
    count,
    render,
    children,
    ...props
  },
  ref
) {
  const classes = cn(className)
  const cornerStyle = dfCornerShapeStyle(cornerShape)
  const mergedStyle = (
    cornerStyle || style
      ? { ...cornerStyle, ...style }
      : undefined
  ) as React.CSSProperties | undefined
  const hasCount = count != null && count !== ""
  const content =
    children != null || hasCount ? (
      <>
        {children}
        {hasCount ? (
          <span
            data-df="badge"
            data-slot="counter"
            data-variant={resolveCounterVariant(variant)}
            data-size="xs"
            data-radius="full"
          >
            {count}
          </span>
        ) : null}
      </>
    ) : undefined

  if (render) {
    return React.cloneElement(render, {
      ...props,
      ref,
      "data-df": "badge",
      "data-variant": variant,
      "data-size": size,
      "data-radius": radius,
      "data-corner-shape": cornerShape,
      style: { ...cornerStyle, ...render.props.style, ...style },
      className: cn(classes, render.props.className),
      children: content ?? render.props.children,
    } as never)
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      data-df="badge"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      data-corner-shape={cornerShape}
      className={classes}
      style={mergedStyle}
      {...props}
    >
      {content}
    </span>
  )
})

export { Badge }
export type {
  BadgeProps,
  BadgeRadius,
  BadgeSize,
  BadgeVariant,
  DfCornerShape,
}
