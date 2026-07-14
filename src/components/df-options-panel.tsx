"use client"

import * as React from "react"

import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./df-popover"
import { cn } from "../lib/utils"

type OptionsPanelContentProps = React.ComponentProps<typeof PopoverContent>

const OPTIONS_PANEL_CONTENT_CLASS =
  "w-fit max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-2xl bg-popover p-0 text-popover-foreground shadow-xl"

/**
 * Anchored options panel chrome: trigger + titled header + scroll body + footer.
 * Body and footer are open slots — put any sections or actions inside.
 */
function OptionsPanel(props: React.ComponentProps<typeof Popover>) {
  return <Popover {...props} />
}

function OptionsPanelTrigger(
  props: React.ComponentProps<typeof PopoverTrigger>
) {
  return <PopoverTrigger data-df="options-panel-trigger" {...props} />
}

function OptionsPanelContent({
  className,
  align = "end",
  side = "bottom",
  sideOffset = 8,
  matchTriggerWidth = false,
  portal = true,
  ...props
}: OptionsPanelContentProps) {
  return (
    <PopoverContent
      data-df="options-panel-content"
      align={align}
      side={side}
      sideOffset={sideOffset}
      matchTriggerWidth={matchTriggerWidth}
      portal={portal}
      className={cn(OPTIONS_PANEL_CONTENT_CLASS, className)}
      {...props}
    />
  )
}

function OptionsPanelHeader({
  className,
  ...props
}: React.ComponentProps<typeof PopoverHeader>) {
  return (
    <PopoverHeader
      data-df="options-panel-header"
      className={cn("gap-0 border-b border-border px-4 py-3", className)}
      {...props}
    />
  )
}

function OptionsPanelTitle({
  className,
  ...props
}: React.ComponentProps<typeof PopoverTitle>) {
  return (
    <PopoverTitle
      data-df="options-panel-title"
      className={cn("text-sm font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function OptionsPanelBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="options-panel-body"
      className={cn(
        "flex w-max max-h-[min(60vh,520px)] flex-col gap-4 overflow-y-auto px-4 py-4",
        className
      )}
      {...props}
    />
  )
}

function OptionsPanelFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="options-panel-footer"
      className={cn(
        "flex flex-col gap-2.5 border-t border-border px-4 py-3",
        className
      )}
      {...props}
    />
  )
}

export {
  OptionsPanel,
  OptionsPanelBody,
  OptionsPanelContent,
  OptionsPanelFooter,
  OptionsPanelHeader,
  OptionsPanelTitle,
  OptionsPanelTrigger,
}
export type { OptionsPanelContentProps }
