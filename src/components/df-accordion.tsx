"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "../lib/utils"

type AccordionProps = {
  type?: "single"
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  className?: string
  children: React.ReactNode
}

type AccordionContextValue = {
  openValue: string | null
  setOpenValue: (value: string | null) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

function useAccordion() {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error("Accordion parts must be used within Accordion")
  return ctx
}

function Accordion({
  value,
  defaultValue = null,
  onValueChange,
  className,
  children,
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string | null>(
    defaultValue
  )
  const openValue = value !== undefined ? value : uncontrolled
  const setOpenValue = React.useCallback(
    (next: string | null) => {
      if (value === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [onValueChange, value]
  )

  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

type AccordionItemProps = {
  value: string
  id?: string
  className?: string
  children: React.ReactNode
}

const AccordionItemContext = React.createContext<string | null>(null)

function AccordionItem({ value, id, className, children }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div id={id} className={cn("border-b border-border/80", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

function useItemValue() {
  const value = React.useContext(AccordionItemContext)
  if (!value) throw new Error("AccordionTrigger must be used within AccordionItem")
  return value
}

type AccordionTriggerProps = {
  className?: string
  children: React.ReactNode
  meta?: React.ReactNode
}

function AccordionTrigger({ className, children, meta }: AccordionTriggerProps) {
  const itemValue = useItemValue()
  const { openValue, setOpenValue } = useAccordion()
  const open = openValue === itemValue

  return (
    <button
      type="button"
      aria-expanded={open}
      className={cn(
        "flex w-full items-start justify-between gap-4 py-5 text-left",
        className
      )}
      onClick={() => setOpenValue(open ? null : itemValue)}
    >
      <span className="min-w-0 flex-1 text-base font-semibold tracking-tight sm:text-lg">
        {children}
      </span>
      <span className="flex shrink-0 items-center gap-3 pt-0.5">
        {meta}
        <ChevronDown
          className="df-accordion-chevron size-4 text-foreground/40"
          data-open={open ? "true" : "false"}
          aria-hidden
        />
      </span>
    </button>
  )
}

type AccordionContentProps = {
  className?: string
  children: React.ReactNode
}

function AccordionContent({ className, children }: AccordionContentProps) {
  const itemValue = useItemValue()
  const { openValue } = useAccordion()
  const open = openValue === itemValue

  return (
    <div className="df-accordion-panel" data-open={open ? "true" : "false"}>
      <div>
        <div
          className={cn(
            "pb-5 text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
}
