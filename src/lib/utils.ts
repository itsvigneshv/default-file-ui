type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined }

function toClass(value: ClassValue): string {
  if (!value) return ""
  if (typeof value === "string" || typeof value === "number") return String(value)
  if (Array.isArray(value)) return value.map(toClass).filter(Boolean).join(" ")
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, on]) => Boolean(on))
      .map(([key]) => key)
      .join(" ")
  }
  return ""
}

/** Compose class names for Default File UI. */
export function cn(...inputs: ClassValue[]) {
  return inputs.map(toClass).filter(Boolean).join(" ").replace(/\s+/g, " ").trim()
}
