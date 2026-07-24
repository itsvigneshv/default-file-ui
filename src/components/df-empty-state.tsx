import * as React from "react"

import { cn } from "../lib/utils"

type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  glyph?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

function EmptyState({
  className,
  glyph,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-df="empty-state"
      className={cn(className)}
      {...props}
    >
      {glyph != null ? (
        <div data-df="empty-state-glyph" aria-hidden>
          {glyph}
        </div>
      ) : null}
      <div data-df="empty-state-copy">
        <div data-df="empty-state-title">{title}</div>
        {description != null ? (
          <div data-df="empty-state-description">{description}</div>
        ) : null}
      </div>
      {action != null ? (
        <div data-df="empty-state-action">{action}</div>
      ) : null}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
