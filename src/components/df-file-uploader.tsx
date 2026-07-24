"use client"

import * as React from "react"
import { ImagePlus } from "lucide-react"

import {
  dfCornerShapeStyle,
  type DfCornerShape,
} from "../lib/corner-shape"
import { cn } from "../lib/utils"

export type FileUploaderBorderStyle = "dashed" | "solid"
export type FileUploaderVariant = "default" | "tile"
export type FileUploaderShape = "rounded" | "circle"
export type FileUploaderSize = "sm" | "md" | "lg" | "xl"

export type FileUploaderProps = {
  disabled?: boolean
  accept?: string
  enablePaste?: boolean
  variant?: FileUploaderVariant
  shape?: FileUploaderShape
  size?: FileUploaderSize
  cornerShape?: DfCornerShape
  title?: React.ReactNode
  description?: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  previewSrc?: string
  borderStyle?: FileUploaderBorderStyle
  borderColor?: string
  background?: string
  className?: string
  onFile: (file: File) => void
  pickFile?: (files: FileList | null | undefined) => File | undefined
  validateFile?: (file: File) => string | null
  onReject?: (message: string) => void
}

type FileUploaderStyle = React.CSSProperties & {
  "--df-file-uploader-border-style"?: FileUploaderBorderStyle
  "--df-file-uploader-border-color"?: string
  "--df-file-uploader-bg"?: string
  "--df-corner-shape"?: string
}

function pickImageFile(files: FileList | null | undefined): File | undefined {
  if (!files?.length) return undefined
  for (const file of Array.from(files)) {
    if (file.type.startsWith("image/")) return file
  }
  return undefined
}

function FileUploader({
  disabled = false,
  accept = "image/png,image/jpeg,image/webp,image/gif",
  enablePaste = true,
  variant = "default",
  shape = "rounded",
  size = "md",
  cornerShape,
  title: titleProp,
  description: descriptionProp,
  hint,
  icon,
  previewSrc,
  borderStyle,
  borderColor,
  background,
  className,
  onFile,
  pickFile: pickFileProp,
  validateFile,
  onReject,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const releaseDialogFocusRef = React.useRef<(() => void) | null>(null)
  const usesDefaultImagePick = pickFileProp == null
  const pickFile = pickFileProp ?? pickImageFile
  const isTile = variant === "tile"
  const title =
    titleProp !== undefined
      ? titleProp
      : isTile
        ? "Add"
        : "Drop an image here"
  const description =
    descriptionProp !== undefined
      ? descriptionProp
      : isTile
        ? null
        : "or click to browse. Paste also works."
  const showContent = !previewSrc

  const acceptCandidate = React.useCallback(
    (file: File | undefined): file is File => {
      if (!file) {
        onReject?.(usesDefaultImagePick ? "No image found." : "No file found.")
        return false
      }
      if (usesDefaultImagePick && !file.type.startsWith("image/")) {
        onReject?.("That file type is not supported. Use an image.")
        return false
      }
      const message = validateFile?.(file) ?? null
      if (message) {
        onReject?.(message)
        return false
      }
      return true
    },
    [onReject, usesDefaultImagePick, validateFile]
  )

  const releaseFileInputFocus = React.useCallback(() => {
    const input = inputRef.current
    if (!input) return
    if (document.activeElement !== input) return
    input.blur()
  }, [])

  const clearDialogFocusRelease = React.useCallback(() => {
    releaseDialogFocusRef.current?.()
    releaseDialogFocusRef.current = null
  }, [])

  const armDialogFocusRelease = React.useCallback(() => {
    clearDialogFocusRelease()
    const onWindowFocus = () => {
      clearDialogFocusRelease()
      queueMicrotask(() => {
        releaseFileInputFocus()
      })
    }
    window.addEventListener("focus", onWindowFocus)
    releaseDialogFocusRef.current = () => {
      window.removeEventListener("focus", onWindowFocus)
    }
  }, [clearDialogFocusRelease, releaseFileInputFocus])

  React.useEffect(() => () => clearDialogFocusRelease(), [clearDialogFocusRelease])

  React.useEffect(() => {
    if (disabled || !enablePaste) return

    const onPaste = (event: ClipboardEvent) => {
      if (usesDefaultImagePick) {
        const items = event.clipboardData?.items
        if (!items) return
        for (const item of items) {
          if (!item.type.startsWith("image/")) continue
          const file = item.getAsFile() ?? undefined
          if (!acceptCandidate(file)) return
          event.preventDefault()
          onFile(file)
          return
        }
        return
      }
      const file = pickFile(event.clipboardData?.files)
      if (!file || !acceptCandidate(file)) return
      event.preventDefault()
      onFile(file)
    }

    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [
    acceptCandidate,
    disabled,
    enablePaste,
    onFile,
    pickFile,
    usesDefaultImagePick,
  ])

  const setActive = (active: boolean) => {
    const root = rootRef.current
    if (!root) return
    if (active) root.dataset.active = "true"
    else delete root.dataset.active
  }

  const uploaderStyle = {
    ...(borderStyle != null
      ? { "--df-file-uploader-border-style": borderStyle }
      : null),
    ...(borderColor != null
      ? { "--df-file-uploader-border-color": borderColor }
      : null),
    ...(background != null
      ? { "--df-file-uploader-bg": background }
      : null),
    ...dfCornerShapeStyle(cornerShape),
  } as FileUploaderStyle

  return (
    <div
      ref={rootRef}
      data-df="file-uploader"
      data-variant={variant}
      data-shape={isTile ? shape : undefined}
      data-size={isTile ? size : undefined}
      data-corner-shape={cornerShape}
      data-preview={previewSrc ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "df-file-uploader relative flex flex-col items-center justify-center text-center text-muted-foreground transition-colors",
        isTile
          ? "gap-1 overflow-hidden p-2"
          : "w-full gap-1.5 px-4 py-6",
        "focus-within:shadow-[var(--focus-ring)]",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      style={uploaderStyle}
      onDragOver={(event) => {
        event.preventDefault()
        setActive(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setActive(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setActive(false)
        if (disabled) return
        const file = pickFile(event.dataTransfer.files)
        if (!acceptCandidate(file)) return
        onFile(file)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-label={
          typeof title === "string"
            ? title
            : usesDefaultImagePick
              ? "Upload image"
              : "Upload file"
        }
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        onClick={armDialogFocusRelease}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            armDialogFocusRelease()
          }
        }}
        onChange={(event) => {
          const file = pickFile(event.target.files)
          event.target.value = ""
          clearDialogFocusRelease()
          releaseFileInputFocus()
          if (!acceptCandidate(file)) return
          onFile(file)
        }}
      />
      {previewSrc ? (
        <img
          src={previewSrc}
          alt=""
          className="df-file-uploader-preview pointer-events-none absolute inset-0 size-full object-cover"
        />
      ) : null}
      {showContent ? (
        <span className="df-file-uploader-content pointer-events-none relative flex flex-col items-center justify-center gap-1">
          {icon ?? (
            <ImagePlus className="df-file-uploader-icon size-5" aria-hidden />
          )}
          {title ? (
            <span
              className={cn(
                "df-file-uploader-title font-medium",
                isTile ? "text-xs" : "text-sm text-foreground"
              )}
            >
              {title}
            </span>
          ) : null}
          {description ? (
            <span className="df-file-uploader-description text-xs">
              {description}
            </span>
          ) : null}
          {hint ? (
            <span className="df-file-uploader-hint text-xs text-muted-foreground/80">
              {hint}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

export { FileUploader }
