import * as React from "react"

import { Button, dfButtonClass } from "./df-button"
import { cn } from "../lib/utils"

/**
 * `default` frosted glass that follows light and dark surfaces.
 * `muted` solid muted surface chip (separate from frosted glass).
 * `marquee` scrolling label with an optional trailing icon action button.
 */
type OverlayHintVariant = "default" | "muted" | "marquee"

/**
 * Corner radius. Three steps that read clearly apart.
 * `none` square, `md` soft, `full` pill. Defaults to `md`.
 */
type OverlayHintRadius = "none" | "md" | "full"

/** Explicit surface for the marquee variant. Omit to follow a `.dark` ancestor. */
type OverlayHintScheme = "light" | "dark"

/**
 * Where clicks land on `marquee`.
 * `action` only the trailing control is interactive.
 * `chip` the whole hint is the hit target; the trailing icon is decorative.
 */
type OverlayHintClickTarget = "chip" | "action"

/** Density for `marquee`. `sm` is a shorter chip for tight marketing chrome. */
type OverlayHintSize = "sm" | "md"

/** Default middle-dot used between `parts` when `separator` is omitted. */
const OVERLAY_HINT_SEPARATOR = "·"

const MARQUEE_ACTION_SIZE = "icon-xs" as const
const MARQUEE_ACTION_VARIANT = "secondary" as const

type OverlayHintProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * `default` frosted glass that adapts under a `.dark` surface.
   * `muted` solid surface chip.
   * `marquee` scrolling label with an optional trailing icon action.
   */
  variant?: OverlayHintVariant
  /**
   * Corner radius: `none`, `md`, or `full`.
   * Applies to the hint chip. Defaults to `md`. Maps to `--overlay-hint-radius`.
   */
  radius?: OverlayHintRadius
  /**
   * Explicit light or dark recipe for `marquee`.
   * When omitted, marquee follows a `.dark` ancestor like `default`.
   */
  scheme?: OverlayHintScheme
  /**
   * Marquee loop duration in seconds. Faster when smaller. Default 18.
   * Maps to `--overlay-hint-marquee-duration`.
   */
  speed?: number
  /**
   * Visible marquee viewport width. Any CSS length or token, e.g. `10rem`,
   * `14rem`, or `var(--overlay-hint-marquee-width)`. Default theme value is `12rem`.
   * Sets `--overlay-hint-marquee-width`.
   */
  marqueeWidth?: string
  /**
   * Marquee hit target. `chip` makes the whole hint clickable.
   * `action` limits clicks to the trailing control. Default `chip`.
   */
  clickTarget?: OverlayHintClickTarget
  /**
   * Marquee density. `sm` reduces padding, type, and the trailing control.
   * Default `md`. Ignored on non-marquee variants.
   */
  size?: OverlayHintSize
  /**
   * Icon for the trailing marquee control.
   * Renders as a kit icon-only Button (`size="icon-xs"`, `variant="secondary"`).
   */
  action?: React.ReactNode
  /** Accessible name for the interactive control (chip or action). */
  actionLabel?: string
  /** Click handler when the interactive control renders as a button. */
  onAction?: React.MouseEventHandler<HTMLElement>
  /** When set, the interactive control renders as a link. */
  actionHref?: string
  /**
   * Background color. Accepts any CSS color, including tokens
   * such as `var(--df-neutral-900)`. Sets `--overlay-hint-bg`.
   */
  background?: string
  /**
   * Border color. Accepts any CSS color, including tokens
   * such as `var(--border)`. Sets `--overlay-hint-border`.
   */
  borderColor?: string
  /**
   * Label color. Accepts any CSS color, including tokens
   * such as `var(--muted-foreground)`. Sets `--overlay-hint-fg`.
   */
  foreground?: string
  /**
   * Box shadow. Accepts any CSS shadow, including tokens
   * such as `var(--overlay-shadow)`. Sets `--overlay-hint-shadow`.
   */
  shadow?: string
  /**
   * Backdrop blur length. Accepts any CSS length, including tokens
   * such as `var(--overlay-blur)`. Sets `--overlay-hint-blur`.
   */
  blur?: string
  /** Slot before the label: typically a small icon or swatch. */
  leading?: React.ReactNode
  /** Slot after the label: typically a small icon. Ignored when `action` is set. */
  trailing?: React.ReactNode
  /**
   * Label segments rendered with `separator` between them.
   * Prefer this for multi-part hints like "Live preview · Autosaved".
   * When set, `children` is ignored.
   */
  parts?: React.ReactNode[]
  /**
   * Node between `parts`. Defaults to a middle dot.
   * Pass an icon, glyph, or custom divider. Set `null` to omit.
   */
  separator?: React.ReactNode
}

function renderLabelContent({
  parts,
  separator,
  children,
}: {
  parts?: React.ReactNode[]
  separator: React.ReactNode
  children: React.ReactNode
}) {
  const useParts = parts != null && parts.length > 0
  if (useParts) {
    return parts.flatMap((part, index) => {
      const nodes: React.ReactNode[] = [
        <span
          key={`part-${index}`}
          className="df-overlay-hint-label"
          data-df="overlay-hint-label"
        >
          {part}
        </span>,
      ]
      if (
        index < parts.length - 1 &&
        separator != null &&
        separator !== false
      ) {
        nodes.push(
          <span
            key={`sep-${index}`}
            className="df-overlay-hint-separator"
            data-df="overlay-hint-separator"
            data-slot="separator"
            aria-hidden="true"
          >
            {separator}
          </span>
        )
      }
      return nodes
    })
  }
  if (children == null || children === false) return null
  return (
    <span className="df-overlay-hint-label" data-df="overlay-hint-label">
      {children}
    </span>
  )
}

function MarqueeActionControl({
  action,
  actionLabel,
  actionHref,
  onAction,
  interactive,
  scheme,
}: {
  action: React.ReactNode
  actionLabel?: string
  actionHref?: string
  onAction?: React.MouseEventHandler<HTMLElement>
  interactive: boolean
  scheme?: OverlayHintScheme
}) {
  const surfaceClass = scheme === "dark" ? "dark" : undefined
  const actionClassName = cn("df-overlay-hint-action", surfaceClass)

  if (!interactive) {
    return (
      <span
        className={dfButtonClass({
          variant: MARQUEE_ACTION_VARIANT,
          size: MARQUEE_ACTION_SIZE,
          className: actionClassName,
        })}
        data-df="button"
        data-variant={MARQUEE_ACTION_VARIANT}
        data-size={MARQUEE_ACTION_SIZE}
        aria-hidden="true"
      >
        {action}
      </span>
    )
  }

  if (actionHref != null) {
    return (
      <a
        href={actionHref}
        className={dfButtonClass({
          variant: MARQUEE_ACTION_VARIANT,
          size: MARQUEE_ACTION_SIZE,
          className: actionClassName,
        })}
        data-df="button"
        data-variant={MARQUEE_ACTION_VARIANT}
        data-size={MARQUEE_ACTION_SIZE}
        aria-label={actionLabel ?? "Open"}
      >
        {action}
      </a>
    )
  }

  return (
    <Button
      type="button"
      variant={MARQUEE_ACTION_VARIANT}
      size={MARQUEE_ACTION_SIZE}
      className={actionClassName}
      aria-label={actionLabel ?? "Action"}
      onClick={onAction as React.MouseEventHandler<HTMLButtonElement>}
    >
      {action}
    </Button>
  )
}

/**
 * Instruction or status pill for tool chrome.
 * Default frosted glass follows a `.dark` ancestor for dark surfaces.
 * Marquee scrolls the label and can show a trailing kit icon-only Button.
 * Chrome resolves through `--overlay-hint-*` tokens.
 */
function OverlayHint({
  className,
  style,
  variant = "default",
  radius = "md",
  scheme,
  speed = 18,
  marqueeWidth,
  clickTarget = "chip",
  size = "md",
  action,
  actionLabel,
  onAction,
  actionHref,
  background,
  borderColor,
  foreground,
  shadow,
  blur,
  leading,
  trailing,
  parts,
  separator = OVERLAY_HINT_SEPARATOR,
  children,
  onClick,
  ...props
}: OverlayHintProps) {
  const isMarquee = variant === "marquee"
  const label = renderLabelContent({ parts, separator, children })
  const chipClickable =
    isMarquee &&
    clickTarget === "chip" &&
    (actionHref != null || onAction != null || onClick != null)
  const actionClickable =
    isMarquee && clickTarget === "action" && action != null

  const hintStyle = {
    ...(background != null ? { "--overlay-hint-bg": background } : null),
    ...(borderColor != null
      ? { "--overlay-hint-border": borderColor }
      : null),
    ...(foreground != null ? { "--overlay-hint-fg": foreground } : null),
    ...(shadow != null ? { "--overlay-hint-shadow": shadow } : null),
    ...(blur != null ? { "--overlay-hint-blur": blur } : null),
    ...(isMarquee
      ? {
          "--overlay-hint-marquee-duration": `${Math.max(speed, 0.1)}s`,
        }
      : null),
    ...(isMarquee && marqueeWidth != null
      ? { "--overlay-hint-marquee-width": marqueeWidth }
      : null),
    ...style,
  } as React.CSSProperties

  const body = (
    <>
      {leading != null && (
        <span
          className="df-overlay-hint-slot"
          data-df="overlay-hint-slot"
          data-slot="leading"
        >
          {leading}
        </span>
      )}

      {isMarquee ? (
        <div
          className="df-overlay-hint-marquee"
          data-df="overlay-hint-marquee"
        >
          <span
            className="df-overlay-hint-marquee-segment"
            data-df="overlay-hint-marquee-segment"
          >
            {label}
          </span>
          <span
            className="df-overlay-hint-marquee-segment"
            data-df="overlay-hint-marquee-segment"
            aria-hidden="true"
          >
            {label}
          </span>
        </div>
      ) : (
        label
      )}

      {isMarquee && action != null ? (
        <MarqueeActionControl
          action={action}
          actionLabel={actionLabel}
          actionHref={actionHref}
          onAction={onAction}
          interactive={actionClickable}
          scheme={scheme}
        />
      ) : (
        trailing != null && (
          <span
            className="df-overlay-hint-slot"
            data-df="overlay-hint-slot"
            data-slot="trailing"
          >
            {trailing}
          </span>
        )
      )}
    </>
  )

  const sharedClassName = cn(
    "df-overlay-hint",
    isMarquee && scheme === "dark" && "dark",
    className
  )
  const sharedData = {
    "data-df": "overlay-hint" as const,
    "data-variant": variant,
    "data-radius": radius,
    "data-scheme": isMarquee ? scheme : undefined,
    "data-click-target": isMarquee ? clickTarget : undefined,
    "data-size": isMarquee ? size : undefined,
  }

  if (chipClickable && actionHref != null) {
    return (
      <a
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={actionHref}
        aria-label={actionLabel}
        className={sharedClassName}
        style={hintStyle}
        {...sharedData}
      >
        {body}
      </a>
    )
  }

  if (chipClickable) {
    return (
      <button
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        type="button"
        aria-label={actionLabel}
        className={sharedClassName}
        style={hintStyle}
        onClick={(event) => {
          onAction?.(event)
          onClick?.(event)
        }}
        {...sharedData}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
      className={sharedClassName}
      style={hintStyle}
      onClick={onClick}
      {...sharedData}
    >
      {body}
    </div>
  )
}

export { OverlayHint, OVERLAY_HINT_SEPARATOR }
export type {
  OverlayHintProps,
  OverlayHintVariant,
  OverlayHintRadius,
  OverlayHintScheme,
  OverlayHintClickTarget,
  OverlayHintSize,
}
