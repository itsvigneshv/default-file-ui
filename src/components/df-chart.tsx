import * as React from "react"

import {
  CHART_HEIGHT_TOKENS,
  type ChartFrameSize,
} from "../lib/df-chart"
import { cn } from "../lib/utils"

export type { ChartFrameSize }

export type ChartFrameProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  title?: React.ReactNode
  description?: React.ReactNode
  toolbar?: React.ReactNode
  size?: ChartFrameSize
  loading?: boolean
  empty?: boolean
  emptyContent?: React.ReactNode
  children?: React.ReactNode
}

function ChartFrame({
  className,
  title,
  description,
  toolbar,
  size = "md",
  loading = false,
  empty = false,
  emptyContent,
  children,
  style,
  ...props
}: ChartFrameProps) {
  const heightToken = CHART_HEIGHT_TOKENS[size]
  const showHeader =
    title != null || description != null || toolbar != null

  return (
    <div
      data-df="chart-frame"
      data-size={size}
      className={cn(className)}
      style={style}
      {...props}
    >
      {showHeader ? (
        <div data-df="chart-frame-header">
          <div data-df="chart-frame-copy">
            {title != null ? (
              <div data-df="chart-frame-title">{title}</div>
            ) : null}
            {description != null ? (
              <div data-df="chart-frame-description">{description}</div>
            ) : null}
          </div>
          {toolbar != null ? (
            <div data-df="chart-frame-toolbar">{toolbar}</div>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div
          data-df="chart-frame-loading"
          role="status"
          aria-busy="true"
          style={{ height: `var(${heightToken})` }}
        >
          <span className="df-chart-skeleton" />
        </div>
      ) : empty ? (
        <div
          data-df="chart-frame-empty"
          role="status"
          style={{ minHeight: `var(${heightToken})` }}
        >
          {emptyContent ?? "No data"}
        </div>
      ) : (
        <div
          data-df="chart-frame-plot"
          style={{ height: `var(${heightToken})`, width: "100%" }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export type ChartTooltipPayloadItem = {
  name?: string
  value?: number | string | Array<number | string>
  color?: string
  dataKey?: string | number
  payload?: unknown
}

export type ChartTooltipProps = {
  active?: boolean
  label?: React.ReactNode
  payload?: readonly ChartTooltipPayloadItem[]
  className?: string
  formatValue?: (
    value: ChartTooltipPayloadItem["value"],
    item: ChartTooltipPayloadItem
  ) => React.ReactNode
}

function defaultTooltipValue(
  value: ChartTooltipPayloadItem["value"]
): React.ReactNode {
  if (value == null) return ""
  if (Array.isArray(value)) return value.join(" to ")
  return value
}

function ChartTooltip({
  active,
  label,
  payload,
  className,
  formatValue,
}: ChartTooltipProps) {
  if (!active || payload == null || payload.length === 0) return null

  return (
    <div data-df="chart-tooltip" className={cn(className)}>
      {label != null && label !== "" ? (
        <div data-df="chart-tooltip-label">{label}</div>
      ) : null}
      <ul data-df="chart-tooltip-rows">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index)
          const displayValue =
            formatValue != null
              ? formatValue(item.value, item)
              : defaultTooltipValue(item.value)
          return (
            <li key={key} data-df="chart-tooltip-row">
              <span
                data-df="chart-tooltip-swatch"
                aria-hidden
                style={
                  item.color != null
                    ? { backgroundColor: item.color }
                    : undefined
                }
              />
              <span data-df="chart-tooltip-name">{item.name ?? key}</span>
              <span data-df="chart-tooltip-value">{displayValue}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export type ChartLegendItem = {
  id: string
  label: React.ReactNode
  color: string
}

export type ChartLegendProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  "children"
> & {
  items: readonly ChartLegendItem[]
}

function ChartLegend({ items, className, ...props }: ChartLegendProps) {
  if (items.length === 0) return null

  return (
    <ul data-df="chart-legend" className={cn(className)} {...props}>
      {items.map((item) => (
        <li key={item.id} data-df="chart-legend-item">
          <span
            data-df="chart-legend-swatch"
            aria-hidden
            style={{ backgroundColor: item.color }}
          />
          <span data-df="chart-legend-label">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}

export { ChartFrame, ChartLegend, ChartTooltip }
