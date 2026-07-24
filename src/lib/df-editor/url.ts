const BLOCKED_SCHEMES = /^(javascript|data|vbscript):/i

/**
 * Validate a link href for the editor model.
 * Allows http, https, mailto, and relative paths. Rejects javascript and data schemes.
 */
export function isSafeHref(href: string): boolean {
  const value = href.trim()
  if (!value) return false
  if (BLOCKED_SCHEMES.test(value)) return false
  if (/^[\s\S]*[\u0000-\u001F\u007F]/.test(value)) return false

  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(value)
  if (!schemeMatch) {
    // Relative, hash, or protocol-relative-looking without scheme token.
    if (value.startsWith("//")) return false
    return true
  }

  const scheme = schemeMatch[1]!.toLowerCase()
  return scheme === "http" || scheme === "https" || scheme === "mailto"
}

/** Return a safe href, or null when the value must not be stored or rendered as a link. */
export function sanitizeHref(href: string): string | null {
  const trimmed = href.trim()
  if (!isSafeHref(trimmed)) return null
  return trimmed
}
