const BLOCKED_TAGS =
  /<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select)\b[^>]*>/gi

const EVENT_ATTR = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

const DANGEROUS_URL =
  /\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]*)/gi

/**
 * Strip dangerous tags, event handlers, and javascript: URLs from pasted HTML.
 * Keeps a simple markup subset for the html → markdown path.
 */
export function sanitizePasteHtml(html: string): string {
  return html
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_ATTR, "")
    .replace(DANGEROUS_URL, "")
    .replace(/<!--[\s\S]*?-->/g, "")
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ""))
}

function convertInlines(html: string): string {
  let text = html
  text = text.replace(
    /<span[^>]*data-mention-id=["']([^"']+)["'][^>]*data-mention-label=["']([^"']+)["'][^>]*>[\s\S]*?<\/span>/gi,
    (_full, id: string, label: string) => `@[${label}](mention:${id})`
  )
  text = text.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_full, href: string, body: string) => {
      if (/^\s*javascript:/i.test(href)) return stripTags(body)
      return `[${stripTags(body)}](${href})`
    }
  )
  text = text.replace(
    /<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi,
    (_full, _tag: string, body: string) => `**${stripTags(body)}**`
  )
  text = text.replace(
    /<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi,
    (_full, _tag: string, body: string) => `*${stripTags(body)}*`
  )
  text = text.replace(
    /<code[^>]*>([\s\S]*?)<\/code>/gi,
    (_full, body: string) => `\`${stripTags(body)}\``
  )
  return stripTags(text)
}

/** Convert a sanitized HTML subset into Markdown the parser understands. */
export function htmlToMarkdown(html: string): string {
  let text = sanitizePasteHtml(html).replace(/\r\n/g, "\n")
  text = text.replace(/<br\s*\/?>/gi, "\n")
  text = text.replace(/<\/p>/gi, "\n\n")
  text = text.replace(/<\/div>/gi, "\n")
  text = text.replace(
    /<h1[^>]*>([\s\S]*?)<\/h1>/gi,
    (_full, body: string) => `# ${convertInlines(body)}\n\n`
  )
  text = text.replace(
    /<h2[^>]*>([\s\S]*?)<\/h2>/gi,
    (_full, body: string) => `## ${convertInlines(body)}\n\n`
  )
  text = text.replace(
    /<h3[^>]*>([\s\S]*?)<\/h3>/gi,
    (_full, body: string) => `### ${convertInlines(body)}\n\n`
  )
  text = text.replace(
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
    (_full, body: string) => `- ${convertInlines(body)}\n`
  )
  text = text.replace(/<\/?(?:ul|ol|p|div)[^>]*>/gi, "")
  text = convertInlines(text)
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
