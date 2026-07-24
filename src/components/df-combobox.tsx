"use client"

import * as React from "react"
import { X } from "lucide-react"

import { useControllableState } from "../hooks"
import {
  enabledComboboxIndexes,
  filterComboboxOptions,
  mergeComboboxOptions,
  moveComboboxActiveIndex,
  resolveComboboxCommit,
  type ComboboxOption,
} from "../lib/df-combobox"
import { cn } from "../lib/utils"
import {
  OptionList,
  OptionListContent,
  OptionListItem,
  useOptionListContext,
} from "./df-option-list"

const ASYNC_DEBOUNCE_MS = 160

export type { ComboboxOption }

export type ComboboxProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options?: readonly ComboboxOption[]
  loadOptions?: (query: string) => Promise<ComboboxOption[]>
  allowCustomValue?: boolean
  clearable?: boolean
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  debounceMs?: number
  id?: string
  className?: string
  emptyContent?: React.ReactNode
  "aria-label"?: string
}

function ComboboxField({
  text,
  setText,
  disabled,
  invalid,
  placeholder,
  id,
  clearable,
  inputRef,
  filtered,
  allowCustomValue,
  onClear,
}: {
  text: string
  setText: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
  id?: string
  clearable?: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  filtered: ComboboxOption[]
  allowCustomValue: boolean
  onClear: () => void
}) {
  const {
    triggerRef,
    open,
    setOpen,
    listboxId,
    activeValue,
    setActiveValue,
    optionDomId,
    setValue,
  } = useOptionListContext()

  const enabledIndexes = enabledComboboxIndexes(filtered)
  const activeIndex =
    activeValue == null
      ? null
      : filtered.findIndex((option) => option.value === activeValue)

  function commit() {
    const result = resolveComboboxCommit({
      activeIndex: activeIndex === -1 ? null : activeIndex,
      filtered,
      query: text,
      allowCustomValue,
    })
    if (result.kind === "option") {
      setValue(result.option.value)
      setText(result.option.label)
      setOpen(false)
      return
    }
    if (result.kind === "custom") {
      setText(result.value)
      setOpen(false)
    }
  }

  return (
    <div
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      data-df="combobox-field"
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-clearable={clearable && text.length > 0 ? "" : undefined}
    >
      <input
        ref={inputRef}
        id={id}
        data-df="combobox-input"
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        aria-invalid={invalid || undefined}
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={
          open && activeValue != null ? optionDomId(activeValue) : undefined
        }
        onChange={(event) => {
          setText(event.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          if (!disabled) setOpen(true)
        }}
        onKeyDown={(event) => {
          if (disabled) return

          if (event.key === "Escape") {
            if (open) {
              event.preventDefault()
              setOpen(false)
            }
            return
          }

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            if (!open) setOpen(true)
            const nextIndex = moveComboboxActiveIndex(
              activeIndex === -1 ? null : activeIndex,
              event.key === "ArrowDown" ? 1 : -1,
              enabledIndexes
            )
            setActiveValue(
              nextIndex == null ? null : (filtered[nextIndex]?.value ?? null)
            )
            return
          }

          if (event.key === "Enter") {
            event.preventDefault()
            commit()
          }
        }}
      />
      {clearable && text.length > 0 && !disabled ? (
        <button
          type="button"
          data-df="combobox-clear"
          aria-label="Clear"
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          onClick={onClear}
        >
          <X aria-hidden />
        </button>
      ) : null}
    </div>
  )
}

function ComboboxActiveSync({ filtered }: { filtered: ComboboxOption[] }) {
  const { open, activeValue, setActiveValue } = useOptionListContext()
  const valuesKey = filtered.map((option) => option.value).join("\0")

  React.useEffect(() => {
    if (!open) {
      if (activeValue != null) setActiveValue(null)
      return
    }
    if (activeValue == null) return
    const stillValid = filtered.some(
      (option) => option.value === activeValue && !option.disabled
    )
    if (!stillValid) setActiveValue(null)
  }, [activeValue, filtered, open, setActiveValue, valuesKey])

  return null
}

function Combobox({
  value,
  defaultValue = "",
  onValueChange,
  options = [],
  loadOptions,
  allowCustomValue = false,
  clearable = true,
  placeholder = "Type to search",
  disabled = false,
  invalid = false,
  open,
  defaultOpen = false,
  onOpenChange,
  debounceMs = ASYNC_DEBOUNCE_MS,
  id,
  className,
  emptyContent,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const [text, setText] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [asyncOptions, setAsyncOptions] = React.useState<ComboboxOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const merged = React.useMemo(
    () => mergeComboboxOptions(options, asyncOptions),
    [asyncOptions, options]
  )
  const filtered = React.useMemo(
    () => filterComboboxOptions(merged, text),
    [merged, text]
  )
  const selectedValue =
    filtered.find(
      (option) => option.label === text || option.value === text
    )?.value ?? null

  const requestIdRef = React.useRef(0)

  React.useEffect(() => {
    if (!isOpen || !loadOptions) return
    const requestId = ++requestIdRef.current
    const timer = window.setTimeout(() => {
      setLoading(true)
      void loadOptions(text)
        .then((next) => {
          if (requestIdRef.current !== requestId) return
          setAsyncOptions(next)
          setLoading(false)
        })
        .catch(() => {
          if (requestIdRef.current !== requestId) return
          setAsyncOptions([])
          setLoading(false)
        })
    }, debounceMs)
    return () => {
      window.clearTimeout(timer)
    }
  }, [debounceMs, isOpen, loadOptions, text])

  function handleClear() {
    setText("")
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div
      data-df="combobox"
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-loading={loading ? "" : undefined}
      className={cn(className)}
      aria-label={ariaLabel}
    >
      <OptionList
        value={selectedValue}
        onValueChange={(next) => {
          if (next == null) return
          const option = filtered.find((entry) => entry.value === next)
          if (option == null || option.disabled) return
          setText(option.label)
          setOpen(false)
          inputRef.current?.focus()
        }}
        open={isOpen && !disabled}
        onOpenChange={(next) => {
          if (disabled) {
            setOpen(false)
            return
          }
          setOpen(next)
        }}
        closeOnSelect
        width="fill"
      >
        <ComboboxActiveSync filtered={filtered} />
        <ComboboxField
          text={text}
          setText={setText}
          disabled={disabled}
          invalid={invalid}
          placeholder={placeholder}
          id={id}
          clearable={clearable}
          inputRef={inputRef}
          filtered={filtered}
          allowCustomValue={allowCustomValue}
          onClear={handleClear}
        />
        <OptionListContent
          side="bottom"
          align="start"
          portal
          dismissOnScroll={false}
          scrollable
        >
          {filtered.length === 0 ? (
            <div data-df="combobox-empty">
              {loading ? "Loading..." : (emptyContent ?? "No matches")}
            </div>
          ) : (
            filtered.map((option) => (
              <OptionListItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </OptionListItem>
            ))
          )}
        </OptionListContent>
      </OptionList>
    </div>
  )
}

export { Combobox }
