"use client"

import * as React from "react"
import { ImagePlus } from "lucide-react"

import { cn } from "../lib/utils"

export type ImageDropzoneProps = {
  disabled?: boolean
  accept?: string
  enablePaste?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  onFile: (file: File) => void
  /** Return an error message to reject the file, or null to accept. */
  validateFile?: (file: File) => string | null
  onReject?: (message: string) => void
}

function pickImageFile(files: FileList | null | undefined): File | undefined {
  if (!files?.length) return undefined
  for (const file of Array.from(files)) {
    if (file.type.startsWith("image/")) return file
  }
  return undefined
}

function ImageDropzone({
  disabled = false,
  accept = "image/png,image/jpeg,image/webp,image/gif",
  enablePaste = true,
  title = "Drop an image here",
  description = "or click to browse. Paste also works.",
  hint,
  icon,
  className,
  onFile,
  validateFile,
  onReject,
}: ImageDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const acceptCandidate = React.useCallback(
    (file: File | undefined): file is File => {
      if (!file) {
        onReject?.("No image found.")
        return false
      }
      if (!file.type.startsWith("image/")) {
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
    [onReject, validateFile]
  )

  React.useEffect(() => {
    if (disabled || !enablePaste) return

    const onPaste = (event: ClipboardEvent) => {
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
    }

    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [acceptCandidate, disabled, enablePaste, onFile])

  const setActive = (active: boolean) => {
    const root = rootRef.current
    if (!root) return
    if (active) root.dataset.active = "true"
    else delete root.dataset.active
  }

  return (
    <div
      ref={rootRef}
      data-df="image-dropzone"
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-1.5 border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-muted-foreground transition-colors",
        "rounded-[var(--radius-lg)]",
        "hover:border-primary/40 hover:bg-muted/60",
        "focus-within:shadow-[var(--focus-ring)]",
        "data-[active=true]:border-primary data-[active=true]:bg-primary/5",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      style={{ minHeight: "var(--df-image-dropzone-min-height)" }}
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
        const file = pickImageFile(event.dataTransfer.files)
        if (!acceptCandidate(file)) return
        onFile(file)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-label={typeof title === "string" ? title : "Upload image"}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        onChange={(event) => {
          const file = pickImageFile(event.target.files)
          event.target.value = ""
          if (!acceptCandidate(file)) return
          onFile(file)
        }}
      />
      <span className="pointer-events-none flex flex-col items-center justify-center gap-1.5">
        {icon ?? <ImagePlus className="size-5" aria-hidden />}
        <span className="text-sm font-medium text-foreground">{title}</span>
        {description ? <span className="text-xs">{description}</span> : null}
        {hint ? (
          <span className="text-xs text-muted-foreground/80">{hint}</span>
        ) : null}
      </span>
    </div>
  )
}

export { ImageDropzone }
