"use client"

import * as React from "react"

import { avatarToneVar, initialsFromName } from "../lib/df-avatar"
import { cn } from "../lib/utils"

type AvatarSize = "xs" | "sm" | "md" | "lg"
type AvatarShape = "circle" | "square"
type AvatarPresence = "online" | "away" | "busy" | "offline"

type AvatarProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: string
  src?: string | null
  alt?: string
  size?: AvatarSize
  shape?: AvatarShape
  /** Presence indicator tone. Omit to hide the dot. */
  presence?: AvatarPresence
}

function cssUrl(value: string): string {
  return `url(${JSON.stringify(value)})`
}

function Avatar({
  className,
  name,
  src,
  alt,
  size = "md",
  shape = "circle",
  presence,
  style,
  ...props
}: AvatarProps) {
  const [imageReady, setImageReady] = React.useState(false)
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null)
  const [trackedSrc, setTrackedSrc] = React.useState(src)

  if (src !== trackedSrc) {
    setTrackedSrc(src)
    setLoadedSrc(null)
    setImageReady(false)
  }

  React.useEffect(() => {
    if (src == null || src === "") return

    let cancelled = false
    const probe = new window.Image()
    probe.onload = () => {
      if (cancelled) return
      setLoadedSrc(src)
      setImageReady(true)
    }
    probe.onerror = () => {
      if (cancelled) return
      setLoadedSrc(null)
      setImageReady(false)
    }
    probe.src = src

    return () => {
      cancelled = true
      probe.onload = null
      probe.onerror = null
    }
  }, [src])

  const showImage = imageReady && loadedSrc != null
  const initials = initialsFromName(name)
  const tone = avatarToneVar(name)

  return (
    <span
      data-df="avatar"
      data-size={size}
      data-shape={shape}
      data-presence={presence}
      className={cn(className)}
      style={
        {
          "--df-avatar-tone": tone,
          ...style,
        } as React.CSSProperties
      }
      title={props.title ?? name}
      {...props}
    >
      {showImage ? (
        <span
          data-df="avatar-image"
          role="img"
          aria-label={alt ?? name}
          style={{ backgroundImage: cssUrl(loadedSrc) }}
        />
      ) : (
        <span data-df="avatar-fallback" aria-hidden>
          {initials}
        </span>
      )}
      {presence != null ? (
        <span
          data-df="avatar-presence"
          data-tone={presence}
          aria-label={presence}
        />
      ) : null}
    </span>
  )
}

type AvatarStackItem = {
  id: string
  name: string
  src?: string | null
  presence?: AvatarPresence
}

type AvatarStackProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  items: AvatarStackItem[]
  max?: number
  size?: AvatarSize
  shape?: AvatarShape
}

function AvatarStack({
  className,
  items,
  max = 3,
  size = "md",
  shape = "circle",
  ...props
}: AvatarStackProps) {
  const visible = items.slice(0, Math.max(0, max))
  const overflow = Math.max(0, items.length - visible.length)

  return (
    <div
      data-df="avatar-stack"
      data-size={size}
      className={cn(className)}
      {...props}
    >
      {visible.map((item) => (
        <Avatar
          key={item.id}
          name={item.name}
          src={item.src}
          presence={item.presence}
          size={size}
          shape={shape}
        />
      ))}
      {overflow > 0 ? (
        <span
          data-df="avatar-overflow"
          data-size={size}
          data-shape={shape}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}

export { Avatar, AvatarStack }
export type {
  AvatarPresence,
  AvatarProps,
  AvatarShape,
  AvatarSize,
  AvatarStackItem,
  AvatarStackProps,
}
