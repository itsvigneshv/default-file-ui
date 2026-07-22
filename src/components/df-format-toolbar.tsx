"use client"

import * as React from "react"
import {
  Bold,
  Code,
  Columns3,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  MessageSquareWarning,
  Minus,
  Rows3,
  SquareCode,
  Strikethrough,
  Table,
  TableCellsMerge,
  Trash2,
  Quote,
} from "lucide-react"

import { cn } from "../lib/utils"
import { Button } from "./df-button"
import { Input } from "./df-input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./df-popover"
import { Separator } from "./df-separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./df-tooltip"

export const FORMAT_TOOLBAR_CALLOUT_TYPES = [
  "note",
  "tip",
  "important",
  "warning",
  "caution",
] as const

export type FormatToolbarCalloutType =
  (typeof FORMAT_TOOLBAR_CALLOUT_TYPES)[number]

export type FormatToolbarQuery =
  | "bold"
  | "italic"
  | "strike"
  | "inlineCode"
  | "link"
  | "heading"
  | "paragraph"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "callout"
  | "codeBlock"
  | "table"

export type FormatToolbarAttrs = {
  level?: 1 | 2 | 3
  type?: FormatToolbarCalloutType
}

/** Command surface for rich text formatting. Host owns document state. */
export type FormatToolbarController = {
  isActive: (
    query: FormatToolbarQuery,
    attrs?: FormatToolbarAttrs
  ) => boolean
  getLinkHref: () => string | null
  toggleHeading: (level: 1 | 2 | 3) => void
  toggleBold: () => void
  toggleItalic: () => void
  toggleStrike: () => void
  toggleInlineCode: () => void
  setLink: (href: string) => void
  unsetLink: () => void
  toggleBulletList: () => void
  toggleOrderedList: () => void
  toggleTaskList: () => void
  toggleBlockquote: () => void
  setCallout: (type: FormatToolbarCalloutType) => void
  unsetCallout: () => void
  toggleCodeBlock: () => void
  insertHorizontalRule: () => void
  insertTable: () => void
  addTableRow: () => void
  addTableColumn: () => void
  deleteTableRow: () => void
  deleteTable: () => void
  subscribe: (listener: () => void) => () => void
}

export type FormatToolbarProps = {
  controller: FormatToolbarController | null
  disabled?: boolean
  locked?: boolean
  onLockedEditAttempt?: (clientX: number, clientY: number) => void
  className?: string
  isValidHref?: (href: string) => boolean
  calloutLabel?: (type: FormatToolbarCalloutType) => string
}

function defaultCalloutLabel(type: FormatToolbarCalloutType): string {
  switch (type) {
    case "note":
      return "Note"
    case "tip":
      return "Tip"
    case "important":
      return "Important"
    case "warning":
      return "Warning"
    case "caution":
      return "Caution"
  }
}

function defaultIsValidHref(href: string): boolean {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:"
  } catch {
    return false
  }
}

function ToolbarTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function ToolbarButton({
  label,
  active,
  disabled,
  locked,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  locked?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <ToolbarTooltip label={label}>
      <Button
        type="button"
        variant={active ? "secondary" : "ghost"}
        size="icon-sm"
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        onClick={() => {
          if (locked) return
          onClick()
        }}
      >
        {children}
      </Button>
    </ToolbarTooltip>
  )
}

function ToolbarDivider() {
  return <Separator orientation="vertical" className="mx-0.5 h-5 bg-border" />
}

function FormatToolbar({
  controller,
  disabled,
  locked,
  onLockedEditAttempt,
  className,
  isValidHref = defaultIsValidHref,
  calloutLabel = defaultCalloutLabel,
}: FormatToolbarProps) {
  const [, setTick] = React.useState(0)
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [linkHref, setLinkHref] = React.useState("https://")
  const [calloutOpen, setCalloutOpen] = React.useState(false)

  React.useEffect(() => {
    if (!controller) return
    return controller.subscribe(() => setTick((n) => n + 1))
  }, [controller])

  if (!controller) {
    return (
      <div
        className={cn(
          "flex h-11 shrink-0 items-center border-b border-border px-2",
          className
        )}
      />
    )
  }

  const busy = Boolean(disabled)
  const editLocked = Boolean(locked) && !busy
  const inTable = controller.isActive("table")

  const applyLink = () => {
    if (editLocked) return
    const href = linkHref.trim()
    if (!href || !isValidHref(href)) return
    controller.setLink(href)
    setLinkOpen(false)
  }

  const removeLink = () => {
    if (editLocked) return
    controller.unsetLink()
    setLinkOpen(false)
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-0.5 border-b border-border",
        "bg-card px-2 py-1.5",
        className
      )}
      onPointerDownCapture={(event) => {
        const target = event.target
        if (!(target instanceof Element) || !target.closest("button")) return
        event.preventDefault()
        if (!editLocked) return
        onLockedEditAttempt?.(event.clientX, event.clientY)
      }}
    >
      <ToolbarButton
        label="Heading 1"
        active={controller.isActive("heading", { level: 1 })}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleHeading(1)}
      >
        <Heading1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={controller.isActive("heading", { level: 2 })}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleHeading(2)}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={controller.isActive("heading", { level: 3 })}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleHeading(3)}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Bold"
        active={controller.isActive("bold")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleBold()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={controller.isActive("italic")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleItalic()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={controller.isActive("strike")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleStrike()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={controller.isActive("inlineCode")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleInlineCode()}
      >
        <Code className="size-4" />
      </ToolbarButton>

      <ToolbarTooltip label="Link">
        <Popover
          open={editLocked ? false : linkOpen}
          onOpenChange={(open) => {
            if (editLocked) {
              setLinkOpen(false)
              return
            }
            setLinkOpen(open)
            if (!open) return
            const previous = controller.getLinkHref()
            setLinkHref(
              typeof previous === "string" && previous.length > 0
                ? previous
                : "https://"
            )
          }}
        >
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant={controller.isActive("link") ? "secondary" : "ghost"}
                size="icon-sm"
                disabled={busy}
                aria-label="Link"
                aria-pressed={controller.isActive("link")}
              >
                <Link2 className="size-4" />
              </Button>
            }
          />
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-3 shadow-[var(--df-shadow-panel)]"
          >
            <p className="mb-2 text-xs font-medium text-foreground">Link URL</p>
            <Input
              size="sm"
              value={linkHref}
              onChange={(event) => setLinkHref(event.target.value)}
              placeholder="https://"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  applyLink()
                }
              }}
            />
            <div className="mt-2.5 flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1"
                disabled={!isValidHref(linkHref.trim())}
                onClick={applyLink}
              >
                Apply
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!controller.isActive("link")}
                onClick={removeLink}
              >
                Remove
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </ToolbarTooltip>

      <ToolbarDivider />

      <ToolbarButton
        label="Bullet list"
        active={controller.isActive("bulletList")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleBulletList()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        active={controller.isActive("orderedList")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleOrderedList()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Task list"
        active={controller.isActive("taskList")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleTaskList()}
      >
        <ListChecks className="size-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Blockquote"
        active={controller.isActive("blockquote")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleBlockquote()}
      >
        <Quote className="size-4" />
      </ToolbarButton>

      <ToolbarTooltip label="Callout">
        <Popover
          open={editLocked ? false : calloutOpen}
          onOpenChange={(open) => {
            if (editLocked) {
              setCalloutOpen(false)
              return
            }
            setCalloutOpen(open)
          }}
        >
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant={controller.isActive("callout") ? "secondary" : "ghost"}
                size="icon-sm"
                disabled={busy}
                aria-label="Callout"
                aria-pressed={controller.isActive("callout")}
              >
                <MessageSquareWarning className="size-4" />
              </Button>
            }
          />
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-44 rounded-xl border border-border bg-card p-1.5 shadow-[var(--df-shadow-panel)]"
          >
            <Button
              type="button"
              variant={controller.isActive("callout") ? "ghost" : "secondary"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                if (editLocked) return
                controller.unsetCallout()
                setCalloutOpen(false)
              }}
            >
              None
            </Button>
            {FORMAT_TOOLBAR_CALLOUT_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                variant={
                  controller.isActive("callout", { type })
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  if (editLocked) return
                  controller.setCallout(type)
                  setCalloutOpen(false)
                }}
              >
                {calloutLabel(type)}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </ToolbarTooltip>

      <ToolbarButton
        label="Code block"
        active={controller.isActive("codeBlock")}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.toggleCodeBlock()}
      >
        <SquareCode className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Horizontal rule"
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.insertHorizontalRule()}
      >
        <Minus className="size-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Insert table"
        active={inTable}
        disabled={busy}
        locked={editLocked}
        onClick={() => controller.insertTable()}
      >
        <Table className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Add row"
        disabled={busy || !inTable}
        locked={editLocked}
        onClick={() => controller.addTableRow()}
      >
        <Rows3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Add column"
        disabled={busy || !inTable}
        locked={editLocked}
        onClick={() => controller.addTableColumn()}
      >
        <Columns3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Delete row"
        disabled={busy || !inTable}
        locked={editLocked}
        onClick={() => controller.deleteTableRow()}
      >
        <TableCellsMerge className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Delete table"
        disabled={busy || !inTable}
        locked={editLocked}
        onClick={() => controller.deleteTable()}
      >
        <Trash2 className="size-4" />
      </ToolbarButton>
    </div>
  )
}

export { FormatToolbar }
