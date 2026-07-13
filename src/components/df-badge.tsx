import * as React from "react"

import { cn } from "../lib/utils"

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl"

type BadgeProps = React.HTMLAttributes<HTMLElement> & {
  variant?: BadgeVariant
  size?: BadgeSize
  asChild?: boolean
  render?: React.ReactElement<{ className?: string; children?: React.ReactNode }>
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(function Badge(
  {
    className,
    variant = "default",
    size = "md",
    render,
    children,
    ...props
  },
  ref
) {
  const classes = cn(className)

  if (render) {
    return React.cloneElement(render, {
      ...props,
      ref,
      "data-df": "badge",
      "data-variant": variant,
      "data-size": size,
      className: cn(classes, render.props.className),
      children: children ?? render.props.children,
    } as never)
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      data-df="badge"
      data-variant={variant}
      data-size={size}
      className={classes}
      {...props}
    >
      {children}
    </span>
  )
})

export { Badge }
export type { BadgeProps, BadgeSize, BadgeVariant }
