"use client"

import * as React from "react"
import { X } from "lucide-react"

import { useControllableState } from "../hooks"
import {
  dfCornerShapeStyle,
  type DfCornerShape,
} from "../lib/corner-shape"
import {
  dfHoverBorderAttr,
  dfHoverBorderColorStyle,
} from "../lib/hover-border"
import { cn } from "../lib/utils"
import { Label } from "./df-label"

type InputVariant = "primary" | "secondary"
type InputLabelPosition = "outside" | "inside"
type InputFocusVariant = "ring" | "border"
type InputSize = "sm" | "md" | "lg" | "xl"
type InputBorderWidth = "hairline" | "thin" | "thick"
type InputRadius =
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

type InputProps = Omit<
  React.ComponentProps<"input">,
  "prefix" | "size" | "height"
> & {
  variant?: InputVariant
  size?: InputSize
  height?: string
  padding?: string
  paddingX?: string
  paddingY?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  label?: React.ReactNode
  labelPosition?: InputLabelPosition
  labelTrailing?: React.ReactNode
  labelColor?: string
  background?: string
  borderColor?: string
  borderWidth?: InputBorderWidth
  hoverBorder?: boolean
  hoverBorderColor?: string
  foreground?: string
  placeholderColor?: string
  hint?: React.ReactNode
  hintColor?: string
  focusVariant?: InputFocusVariant
  focusBorderColor?: string
  invalid?: boolean
  invalidLabel?: boolean
  errorBorderColor?: string
  errorLabelColor?: string
  radius?: InputRadius
  cornerShape?: DfCornerShape
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  addonColor?: string
  action?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      className,
      style,
      type = "text",
      id: idProp,
      variant = "primary",
      size = "md",
      height,
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      label,
      labelPosition = "outside",
      labelTrailing,
      labelColor,
      background,
      borderColor,
      borderWidth = "hairline",
      hoverBorder,
      hoverBorderColor,
      foreground,
      placeholderColor,
      hint,
      hintColor,
      focusVariant = "ring",
      focusBorderColor,
      invalid = false,
      invalidLabel = true,
      errorBorderColor,
      errorLabelColor,
      radius = "4xl",
      cornerShape,
      leadingIcon,
      trailingIcon,
      clearable = false,
      onClear,
      prefix,
      suffix,
      addonColor,
      action,
      placeholder,
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalidProp,
      ...props
    },
    ref
  ) {
    const reactId = React.useId()
    const inputId = idProp ?? `df-input-${reactId}`
    const hintId = hint != null ? `df-input-hint-${reactId}` : undefined

    const [current, setCurrent] = useControllableState<string>({
      value: value === undefined ? undefined : String(value),
      defaultValue:
        defaultValue === undefined || defaultValue === null
          ? ""
          : String(defaultValue),
    })

    const isInvalid =
      invalid || ariaInvalidProp === true || ariaInvalidProp === "true"
    const showInvalidLabel = isInvalid && invalidLabel
    const isEmpty = String(current).length === 0
    const showClear =
      clearable && !isEmpty && !disabled && !readOnly
    const hasLeading = leadingIcon != null
    const hasTrailing = trailingIcon != null
    const hasPrefix = prefix != null
    const hasSuffix = suffix != null
    const hasAction = action != null
    const hasInsideLabel = label != null && labelPosition === "inside"
    const hasOutsideLabel = label != null && labelPosition === "outside"
    const shellOwnsChrome =
      hasInsideLabel ||
      hasPrefix ||
      hasSuffix ||
      hasAction ||
      hasLeading ||
      hasTrailing ||
      clearable
    const needsField =
      hasLeading ||
      hasTrailing ||
      hasPrefix ||
      hasSuffix ||
      hasAction ||
      hasInsideLabel ||
      clearable
    const needsRoot = hasOutsideLabel || hint != null || needsField

    const describedBy =
      [ariaDescribedBy, hintId].filter(Boolean).join(" ") || undefined

    const resolvedPaddingTop = paddingTop ?? paddingY ?? padding
    const resolvedPaddingRight = paddingRight ?? paddingX ?? padding
    const resolvedPaddingBottom = paddingBottom ?? paddingY ?? padding
    const resolvedPaddingLeft = paddingLeft ?? paddingX ?? padding
    const hasPaddingStyle =
      resolvedPaddingTop != null ||
      resolvedPaddingRight != null ||
      resolvedPaddingBottom != null ||
      resolvedPaddingLeft != null

    const paddingStyle = {
      ...(resolvedPaddingTop != null
        ? { "--df-input-padding-top": resolvedPaddingTop }
        : null),
      ...(resolvedPaddingRight != null
        ? { "--df-input-padding-right": resolvedPaddingRight }
        : null),
      ...(resolvedPaddingBottom != null
        ? { "--df-input-padding-bottom": resolvedPaddingBottom }
        : null),
      ...(resolvedPaddingLeft != null
        ? { "--df-input-padding-left": resolvedPaddingLeft }
        : null),
    } as React.CSSProperties

    const surfaceStyle = {
      ...(background != null ? { "--df-input-bg": background } : null),
      ...(borderColor != null ? { "--df-input-border": borderColor } : null),
      ...(foreground != null ? { "--df-input-fg": foreground } : null),
      ...(placeholderColor != null
        ? { "--df-input-placeholder": placeholderColor }
        : null),
      ...dfHoverBorderColorStyle(
        "--df-input-hover-border",
        hoverBorder,
        hoverBorderColor
      ),
      ...(focusBorderColor != null
        ? { "--df-input-focus-border": focusBorderColor }
        : null),
      ...(errorBorderColor != null
        ? { "--df-input-error-border": errorBorderColor }
        : null),
      ...(addonColor != null ? { "--df-input-addon": addonColor } : null),
      ...(height != null ? { "--df-input-height": height } : null),
      ...paddingStyle,
      ...(hasInsideLabel && labelColor != null
        ? { "--df-input-label": labelColor }
        : null),
      ...(hasInsideLabel && errorLabelColor != null
        ? { "--df-input-error-label": errorLabelColor }
        : null),
      ...dfCornerShapeStyle(cornerShape),
      ...style,
    } as React.CSSProperties

    const rootToneStyle = {
      ...(labelColor != null ? { "--df-input-label": labelColor } : null),
      ...(errorLabelColor != null
        ? { "--df-input-error-label": errorLabelColor }
        : null),
      ...(hintColor != null ? { "--df-input-hint": hintColor } : null),
    } as React.CSSProperties

    const hasRootTone =
      labelColor != null || errorLabelColor != null || hintColor != null
    const hoverBorderAttr = dfHoverBorderAttr(hoverBorder)

    const fieldStyle = shellOwnsChrome
      ? surfaceStyle
      : hasPaddingStyle
        ? paddingStyle
        : undefined

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      setCurrent(event.target.value)
      onChange?.(event)
    }

    function handleClear() {
      setCurrent("")
      onClear?.()
      onChange?.({
        target: { value: "" },
        currentTarget: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>)
    }

    const inputEl = (
      <input
        ref={ref}
        id={inputId}
        type={type}
        data-df="input"
        data-variant={variant}
        data-size={size}
        data-border-width={borderWidth}
        data-radius={radius}
        data-focus-variant={focusVariant}
        data-corner-shape={cornerShape}
        data-hover-border={hoverBorderAttr}
        data-invalid={isInvalid ? "" : undefined}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        placeholder={hasInsideLabel ? undefined : placeholder}
        value={current}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        className={cn("df-input", !needsRoot && !needsField && className)}
        style={shellOwnsChrome ? undefined : surfaceStyle}
        {...props}
      />
    )

    const field = needsField ? (
      <div
        data-df="input-field"
        data-variant={variant}
        data-size={size}
        data-border-width={borderWidth}
        data-radius={radius}
        data-focus-variant={focusVariant}
        data-corner-shape={cornerShape}
        data-hover-border={hoverBorderAttr}
        data-label-position={hasInsideLabel ? "inside" : undefined}
        data-empty={hasInsideLabel && isEmpty ? "" : undefined}
        data-has-leading={hasLeading ? "" : undefined}
        data-has-trailing={hasTrailing ? "" : undefined}
        data-has-clear={showClear ? "" : undefined}
        data-clearable={clearable ? "" : undefined}
        data-has-prefix={hasPrefix ? "" : undefined}
        data-has-suffix={hasSuffix ? "" : undefined}
        data-has-action={hasAction ? "" : undefined}
        data-chrome={shellOwnsChrome ? "shell" : undefined}
        data-invalid={isInvalid ? "" : undefined}
        data-invalid-label={showInvalidLabel ? "" : undefined}
        className={cn(!hasOutsideLabel && !hint && className)}
        style={fieldStyle}
      >
        {hasLeading ? (
          <span data-df="input-icon" data-side="start" aria-hidden>
            {leadingIcon}
          </span>
        ) : null}

        {hasPrefix ? (
          <span data-df="input-prefix" aria-hidden>
            {prefix}
          </span>
        ) : null}

        {inputEl}

        {hasInsideLabel ? (
          <label data-df="input-label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}

        {hasInsideLabel && labelTrailing != null ? (
          <span data-df="input-label-trailing">{labelTrailing}</span>
        ) : null}

        {hasSuffix ? (
          <span data-df="input-suffix" aria-hidden>
            {suffix}
          </span>
        ) : null}

        {hasTrailing ? (
          <span data-df="input-icon" data-side="end">
            {trailingIcon}
          </span>
        ) : null}

        {showClear ? (
          <button
            type="button"
            data-df="input-clear"
            aria-label="Clear"
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={handleClear}
          >
            <X aria-hidden />
          </button>
        ) : null}

        {hasAction ? <div data-df="input-action">{action}</div> : null}
      </div>
    ) : (
      inputEl
    )

    if (!needsRoot) {
      return field
    }

    return (
      <div
        data-df="input-root"
        data-invalid={isInvalid ? "" : undefined}
        data-invalid-label={showInvalidLabel ? "" : undefined}
        className={cn(className)}
        style={hasRootTone ? rootToneStyle : undefined}
      >
        {hasOutsideLabel ? (
          <Label htmlFor={inputId} trailing={labelTrailing}>
            {label}
          </Label>
        ) : null}

        {field}

        {hint != null ? (
          <span data-df="input-hint" id={hintId}>
            {hint}
          </span>
        ) : null}
      </div>
    )
  }
)

export { Input }
export type {
  InputProps,
  InputVariant,
  InputSize,
  InputBorderWidth,
  InputLabelPosition,
  InputFocusVariant,
  InputRadius,
}
