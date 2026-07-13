import * as React from "react"

import { cn } from "../lib/utils"

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

type BadgeProps = React.HTMLAttributes<HTMLElement> & {
  variant?: BadgeVariant
  asChild?: boolean
  render?: React.ReactElement<{ className?: string; children?: React.ReactNode }>
}

function Badge({
  className,
  variant = "default",
  render,
  children,
  ...props
}: BadgeProps) {
  const classes = cn(className)

  if (render) {
    return React.cloneElement(render, {
      ...props,
      "data-df": "badge",
      "data-variant": variant,
      className: cn(classes, render.props.className),
      children: children ?? render.props.children,
    } as never)
  }

  return (
    <span
      data-df="badge"
      data-variant={variant}
      className={classes}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant }
