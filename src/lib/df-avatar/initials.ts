/** Derive up to two initials from a display name. */
export function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/u)
    .filter((part) => part.length > 0)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    const word = parts[0]
    return Array.from(word).slice(0, 2).join("").toUpperCase()
  }
  const first = Array.from(parts[0])[0] ?? ""
  const last = Array.from(parts[parts.length - 1])[0] ?? ""
  return `${first}${last}`.toUpperCase()
}
