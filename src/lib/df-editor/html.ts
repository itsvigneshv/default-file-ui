import type { BlockNode, EditorDoc, InlineNode } from "./document"
import { parseMarkdown } from "./markdown"
import { htmlToMarkdown, sanitizePasteHtml } from "./sanitize"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function inlinesToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "mention") {
        return `<span data-mention-id="${escapeHtml(node.id)}" data-mention-label="${escapeHtml(node.label)}">@${escapeHtml(node.label)}</span>`
      }
      if (node.type === "link") {
        return `<a href="${escapeHtml(node.href)}">${escapeHtml(node.text)}</a>`
      }
      let html = escapeHtml(node.text)
      if (node.code) html = `<code>${html}</code>`
      if (node.bold) html = `<strong>${html}</strong>`
      if (node.italic) html = `<em>${html}</em>`
      return html
    })
    .join("")
}

function blockToHtml(block: BlockNode): string {
  if (block.type === "heading") {
    return `<h${block.level}>${inlinesToHtml(block.children)}</h${block.level}>`
  }
  if (block.type === "paragraph") {
    return `<p>${inlinesToHtml(block.children)}</p>`
  }
  const tag = block.type === "ordered_list" ? "ol" : "ul"
  const items = block.items
    .map((item) => `<li>${inlinesToHtml(item)}</li>`)
    .join("")
  return `<${tag}>${items}</${tag}>`
}

export function serializeHtml(doc: EditorDoc): string {
  return doc.blocks.map(blockToHtml).join("")
}

/** Parse editor HTML (or paste) into a document via the Markdown bridge. */
export function parseHtml(html: string): EditorDoc {
  return parseMarkdown(htmlToMarkdown(sanitizePasteHtml(html)))
}
