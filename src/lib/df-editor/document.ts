/** Owned document model for df-editor. JSON and Markdown serialize from this tree. */

export type InlineText = {
  type: "text"
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
}

export type InlineLink = {
  type: "link"
  text: string
  href: string
}

/** Stub mention until directory-backed mentions land. */
export type InlineMention = {
  type: "mention"
  id: string
  label: string
}

export type InlineNode = InlineText | InlineLink | InlineMention

export type ParagraphBlock = {
  type: "paragraph"
  children: InlineNode[]
}

export type HeadingBlock = {
  type: "heading"
  level: 1 | 2 | 3
  children: InlineNode[]
}

export type ListBlock = {
  type: "bullet_list" | "ordered_list"
  items: InlineNode[][]
}

export type BlockNode = ParagraphBlock | HeadingBlock | ListBlock

export type EditorDoc = {
  type: "doc"
  blocks: BlockNode[]
}

export function emptyDoc(): EditorDoc {
  return {
    type: "doc",
    blocks: [{ type: "paragraph", children: [{ type: "text", text: "" }] }],
  }
}

export function isEditorDoc(value: unknown): value is EditorDoc {
  if (!value || typeof value !== "object") return false
  const doc = value as EditorDoc
  return doc.type === "doc" && Array.isArray(doc.blocks)
}

export function docPlainText(doc: EditorDoc): string {
  return doc.blocks
    .map((block) => {
      if (block.type === "paragraph" || block.type === "heading") {
        return inlinesToPlain(block.children)
      }
      return block.items.map((item) => inlinesToPlain(item)).join("\n")
    })
    .join("\n")
}

export function inlinesToPlain(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "mention") return `@${node.label}`
      return node.text
    })
    .join("")
}
