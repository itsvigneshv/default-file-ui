"use client"

import * as React from "react"
import { ChevronDown, CircleHelp, X } from "lucide-react"

import { Label } from "./df-label"
import {
  OptionList,
  OptionListContent,
  OptionListGroup,
  OptionListItem,
  OptionListLabel,
  OptionListScrollDownButton,
  OptionListScrollUpButton,
  OptionListSeparator,
  useOptionListContext,
} from "./df-option-list"
import { cn } from "../lib/utils"

type SelectSize = "sm" | "md" | "lg"

type SelectValueRenderContext = {
  selectionMode: "single" | "multiple"
  value: string | null
  values: string[]
  labelFor: (value: string | null) => React.ReactNode
  toggleValue: (value: string) => void
}

type SelectExtrasContextValue = {
  disabled: boolean
}

const SelectExtrasContext = React.createContext<SelectExtrasContextValue>({
  disabled: false,
})

function useSelectExtras() {
  return React.useContext(SelectExtrasContext)
}

function resolveSelectSize(size: SelectSize | "default"): SelectSize {
  return size === "default" ? "md" : size
}

function Select({
  selectionMode = "single",
  value,
  defaultValue = null,
  onValueChange,
  values,
  defaultValues,
  onValuesChange,
  open,
  defaultOpen,
  onOpenChange,
  closeOnSelect,
  disabled = false,
  children,
}: {
  selectionMode?: "single" | "multiple"
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeOnSelect?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <OptionList
      selectionMode={selectionMode}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      values={values}
      defaultValues={defaultValues}
      onValuesChange={onValuesChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      closeOnSelect={closeOnSelect}
    >
      <SelectExtrasContext.Provider value={{ disabled }}>
        <SelectDisabledSync disabled={disabled} />
        {children}
      </SelectExtrasContext.Provider>
    </OptionList>
  )
}

function SelectDisabledSync({ disabled }: { disabled: boolean }) {
  const { open, setOpen } = useOptionListContext()
  React.useEffect(() => {
    if (disabled && open) setOpen(false)
  }, [disabled, open, setOpen])
  return null
}

function SelectField({
  className,
  children,
  label,
  required,
  help,
  hint,
  htmlFor,
  hintId,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode
  required?: boolean
  help?: React.ReactNode
  hint?: React.ReactNode
  htmlFor?: string
  hintId?: string
}) {
  const { disabled } = useSelectExtras()

  return (
    <div
      data-df="select-field"
      data-disabled={disabled ? "" : undefined}
      className={cn(className)}
      {...props}
    >
      {label != null ? (
        <SelectFieldLabel
          htmlFor={disabled ? undefined : htmlFor}
          required={required}
          help={help}
        >
          {label}
        </SelectFieldLabel>
      ) : null}
      {children}
      {hint != null ? (
        <SelectFieldHint id={hintId}>{hint}</SelectFieldHint>
      ) : null}
    </div>
  )
}

function SelectFieldLabel({
  className,
  children,
  required,
  help,
  htmlFor,
  onClick,
  ...props
}: React.ComponentProps<typeof Label> & {
  help?: React.ReactNode
}) {
  return (
    <div data-df="select-field-label">
      <Label
        htmlFor={htmlFor}
        required={required}
        className={cn(className)}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented || !htmlFor) return
          const control = document.getElementById(htmlFor)
          if (control?.getAttribute("data-df") !== "select-trigger") return
          event.preventDefault()
          control.focus()
        }}
        {...props}
      >
        {children}
      </Label>
      {help != null ? (
        <span data-df="select-field-help">{help}</span>
      ) : null}
    </div>
  )
}

function SelectFieldHelp({
  className,
  label = "More information",
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label?: string
}) {
  return (
    <button
      type="button"
      data-df="select-field-help-button"
      aria-label={label}
      className={cn(className)}
      {...props}
    >
      <CircleHelp aria-hidden />
    </button>
  )
}

function SelectFieldHint({
  className,
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-df="select-field-hint"
      id={id}
      className={cn(className)}
      {...props}
    >
      {children}
    </p>
  )
}

function SelectValue({
  className,
  placeholder,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  placeholder?: string
  children?:
    | React.ReactNode
    | ((ctx: SelectValueRenderContext) => React.ReactNode)
}) {
  const { value, values, selectionMode, labelFor, toggleValue } =
    useOptionListContext()

  const empty =
    selectionMode === "multiple" ? values.length === 0 : value == null

  const content =
    typeof children === "function"
      ? children({
          selectionMode,
          value,
          values,
          labelFor,
          toggleValue,
        })
      : (children ??
        (selectionMode === "multiple"
          ? empty
            ? placeholder
            : values.map((v) => labelFor(v)).join(", ")
          : (labelFor(value) ?? placeholder)))

  return (
    <span
      data-df="select-value"
      data-empty={empty ? "" : undefined}
      className={cn(className)}
      {...props}
    >
      {content}
    </span>
  )
}

function SelectValueSummary({
  className,
  count,
  supportingText,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  count: number
  supportingText?: React.ReactNode
}) {
  return (
    <span
      data-df="select-value-summary"
      className={cn(className)}
      {...props}
    >
      <span data-df="select-value-summary-count">{count} selected</span>
      {supportingText != null && supportingText !== "" ? (
        <span data-df="select-value-summary-support">{supportingText}</span>
      ) : null}
    </span>
  )
}

function SelectValueBadge({
  className,
  value,
  children,
  onRemove,
  ...props
}: Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  value: string
  children?: React.ReactNode
  onRemove?: (value: string) => void
}) {
  const { labelFor, toggleValue } = useOptionListContext()
  const { disabled } = useSelectExtras()

  const handleRemove = (event: React.MouseEvent | React.PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    if (onRemove) {
      onRemove(value)
      return
    }
    toggleValue(value)
  }

  return (
    <span
      data-df="select-value-badge"
      className={cn(className)}
      {...props}
    >
      <span data-df="select-value-badge-label">
        {children ?? labelFor(value)}
      </span>
      <button
        type="button"
        data-df="select-value-badge-remove"
        aria-label="Remove"
        disabled={disabled}
        onClick={handleRemove}
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <X aria-hidden />
      </button>
    </span>
  )
}

function SelectTrigger({
  className,
  size = "md",
  children,
  disabled: disabledProp,
  onClick,
  onKeyDown,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "disabled"> & {
  size?: SelectSize | "default"
  disabled?: boolean
}) {
  const { open, setOpen, triggerRef, value, values, selectionMode } =
    useOptionListContext()
  const { disabled: disabledFromSelect } = useSelectExtras()
  const disabled = disabledProp ?? disabledFromSelect
  const resolvedSize = resolveSelectSize(size)

  const empty =
    selectionMode === "multiple" ? values.length === 0 : value == null

  const toggleOpen = () => {
    if (disabled) return
    setOpen(!open)
  }

  return (
    <div
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      data-df="select-trigger"
      data-size={resolvedSize}
      data-selection-mode={selectionMode}
      data-placeholder={empty ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(className)}
      {...props}
      role="combobox"
      tabIndex={disabled ? -1 : 0}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-disabled={disabled || undefined}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || disabled) return
        toggleOpen()
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || disabled) return
        if (event.target !== event.currentTarget) return

        switch (event.key) {
          case "Enter":
          case " ":
            event.preventDefault()
            toggleOpen()
            break
          case "ArrowDown":
            event.preventDefault()
            if (!open) setOpen(true)
            break
          case "Escape":
            if (open) {
              event.preventDefault()
              setOpen(false)
            }
            break
          default:
            break
        }
      }}
    >
      {children}
      <ChevronDown className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
    </div>
  )
}

const SelectContent = OptionListContent
const SelectItem = OptionListItem
const SelectGroup = OptionListGroup
const SelectLabel = OptionListLabel
const SelectSeparator = OptionListSeparator
const SelectScrollUpButton = OptionListScrollUpButton
const SelectScrollDownButton = OptionListScrollDownButton

export {
  Select,
  SelectContent,
  SelectField,
  SelectFieldHelp,
  SelectFieldHint,
  SelectFieldLabel,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectValueBadge,
  SelectValueSummary,
}
export type { SelectSize, SelectValueRenderContext }
