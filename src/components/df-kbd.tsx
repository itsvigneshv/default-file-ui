import * as React from "react"

import { cn } from "../lib/utils"

type KbdSize = "sm" | "md"

type KbdProps = React.ComponentProps<"kbd"> & {
  size?: KbdSize
}

type KbdAbbrProps = React.ComponentProps<"abbr"> & {
  title: string
}

type KbdContentProps = React.ComponentProps<"span"> & {
  kind?: "key" | "punct"
}

type KbdGlyphKind = "mod" | "special" | "punct" | "key"

type KbdGlyphMeta = {
  kind: KbdGlyphKind
  title?: string
}

function hasKbdShortcut(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

const KBD_GLYPH_META: Record<string, KbdGlyphMeta> = {
  "⌘": { kind: "mod", title: "Command" },
  "⇧": { kind: "mod", title: "Shift" },
  "⌥": { kind: "mod", title: "Option" },
  "⌃": { kind: "mod", title: "Control" },
  "⎋": { kind: "special", title: "Escape" },
  "⌫": { kind: "special", title: "Delete" },
  "⌦": { kind: "special", title: "Forward Delete" },
  "↵": { kind: "special", title: "Return" },
  "⇥": { kind: "special", title: "Tab" },
  "⇪": { kind: "special", title: "Caps Lock" },
  "␣": { kind: "special", title: "Space" },
  "↑": { kind: "special", title: "Up Arrow" },
  "↓": { kind: "special", title: "Down Arrow" },
  "←": { kind: "special", title: "Left Arrow" },
  "→": { kind: "special", title: "Right Arrow" },
  "⇞": { kind: "special", title: "Page Up" },
  "⇟": { kind: "special", title: "Page Down" },
  "↖": { kind: "special", title: "Home" },
  "↘": { kind: "special", title: "End" },
  ",": { kind: "punct" },
  ".": { kind: "punct" },
  ";": { kind: "punct" },
  ":": { kind: "punct" },
  "'": { kind: "punct" },
  '"': { kind: "punct" },
  "!": { kind: "punct" },
  "?": { kind: "punct" },
}

function splitKbdGlyphs(label: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    })
    return Array.from(segmenter.segment(label), (part) => part.segment)
  }
  return Array.from(label)
}

function glyphMeta(glyph: string): KbdGlyphMeta {
  return KBD_GLYPH_META[glyph] ?? { kind: "key" }
}

function chordAccessibleName(glyphs: string[]): string {
  return glyphs
    .map((glyph) => {
      const meta = glyphMeta(glyph)
      if (meta.title) return meta.title
      if (glyph === " ") return "Space"
      return glyph
    })
    .join(" ")
}

const KbdAbbr = React.forwardRef<HTMLElement, KbdAbbrProps>(function KbdAbbr(
  { className, title, children, ...props },
  ref
) {
  return (
    <abbr
      ref={ref as React.Ref<HTMLElement>}
      data-df="kbd-abbr"
      title={title}
      className={cn(className)}
      {...props}
    >
      {children}
    </abbr>
  )
})

const KbdContent = React.forwardRef<HTMLSpanElement, KbdContentProps>(
  function KbdContent({ className, kind = "key", children, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-df="kbd-content"
        data-kind={kind}
        className={cn(className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

function renderKbdGlyph(
  glyph: string,
  index: number,
  presentational: boolean
): React.ReactNode {
  const meta = glyphMeta(glyph)
  const atProps = presentational ? ({ "aria-hidden": true } as const) : undefined

  if (meta.kind === "mod" || meta.kind === "special") {
    return (
      <KbdAbbr
        key={`${index}-${glyph}`}
        title={meta.title ?? glyph}
        data-kind={meta.kind}
        {...atProps}
      >
        {glyph}
      </KbdAbbr>
    )
  }

  return (
    <KbdContent
      key={`${index}-${glyph}`}
      kind={meta.kind === "punct" ? "punct" : "key"}
      {...atProps}
    >
      {glyph}
    </KbdContent>
  )
}

function renderKbdChord(parts: React.ReactNode[]): React.ReactNode {
  if (parts.length === 0) return null
  if (parts.length === 1) return parts[0]
  return <span data-df="kbd-chord">{parts}</span>
}

function renderKbdString(
  label: string,
  presentational: boolean
): React.ReactNode {
  const glyphs = splitKbdGlyphs(label)
  return renderKbdChord(
    glyphs.map((glyph, index) => renderKbdGlyph(glyph, index, presentational))
  )
}

function renderKbdChildren(children: React.ReactNode): React.ReactNode {
  return renderKbdChord(React.Children.toArray(children))
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, size = "sm", children, ...props },
  ref
) {
  const { "aria-label": ariaLabelProp, ...rest } = props
  const stringLabel = typeof children === "string" ? children : null
  const glyphs = stringLabel != null ? splitKbdGlyphs(stringLabel) : null
  const derivedLabel =
    glyphs != null && glyphs.length > 0 ? chordAccessibleName(glyphs) : undefined
  const ariaLabel =
    ariaLabelProp !== undefined ? ariaLabelProp : derivedLabel
  const presentational =
    stringLabel != null &&
    typeof ariaLabel === "string" &&
    ariaLabel.length > 0

  return (
    <kbd
      ref={ref as React.Ref<HTMLElement>}
      data-df="kbd"
      data-size={size}
      className={cn(className)}
      aria-label={ariaLabel || undefined}
      {...rest}
    >
      {stringLabel != null
        ? renderKbdString(stringLabel, presentational)
        : renderKbdChildren(children)}
    </kbd>
  )
})

export { Kbd, KbdAbbr, KbdContent, hasKbdShortcut }
export type { KbdProps, KbdSize, KbdAbbrProps, KbdContentProps }
