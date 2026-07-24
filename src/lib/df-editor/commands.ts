import {
  emptyDoc,
  type EditorDoc,
  type HeadingBlock,
  type InlineNode,
  type ListBlock,
  type ParagraphBlock,
} from "./document"

function firstBlock(doc: EditorDoc): EditorDoc["blocks"][number] {
  return doc.blocks[0] ?? emptyDoc().blocks[0]!
}

function blockInlines(block: EditorDoc["blocks"][number]): InlineNode[] {
  switch (block.type) {
    case "bullet_list":
    case "ordered_list":
      return block.items[0] ?? [{ type: "text", text: "" }]
    case "heading":
    case "paragraph":
      return block.children
  }
}

function inlinesPlain(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "mention") return `@${node.label}`
      return node.text
    })
    .join("")
}

/** Set the first block to a heading level (1 to 3) or paragraph (0). */
export function setBlockStyle(
  doc: EditorDoc,
  style: 0 | 1 | 2 | 3
): EditorDoc {
  const children = blockInlines(firstBlock(doc))
  const rest = doc.blocks.slice(1)
  if (style === 0) {
    const paragraph: ParagraphBlock = { type: "paragraph", children }
    return { type: "doc", blocks: [paragraph, ...rest] }
  }
  const heading: HeadingBlock = {
    type: "heading",
    level: style,
    children,
  }
  return { type: "doc", blocks: [heading, ...rest] }
}

export function setListStyle(
  doc: EditorDoc,
  listType: "bullet_list" | "ordered_list" | "none"
): EditorDoc {
  const children = blockInlines(firstBlock(doc))
  const rest = doc.blocks.slice(1)
  if (listType === "none") {
    const paragraph: ParagraphBlock = { type: "paragraph", children }
    return { type: "doc", blocks: [paragraph, ...rest] }
  }
  const list: ListBlock = {
    type: listType,
    items: [children],
  }
  return { type: "doc", blocks: [list, ...rest] }
}

export function insertMentionStub(
  doc: EditorDoc,
  mention: { id: string; label: string }
): EditorDoc {
  const current = firstBlock(doc)
  const mentionNode: InlineNode = {
    type: "mention",
    id: mention.id,
    label: mention.label,
  }
  const rest = doc.blocks.slice(1)

  switch (current.type) {
    case "bullet_list":
    case "ordered_list": {
      const items = current.items.slice()
      items[0] = (items[0] ?? []).concat(mentionNode)
      return { type: "doc", blocks: [{ ...current, items }, ...rest] }
    }
    case "heading":
      return {
        type: "doc",
        blocks: [
          {
            type: "heading",
            level: current.level,
            children: [...current.children, mentionNode],
          },
          ...rest,
        ],
      }
    case "paragraph":
      return {
        type: "doc",
        blocks: [
          {
            type: "paragraph",
            children: [...current.children, mentionNode],
          },
          ...rest,
        ],
      }
  }
}

/** Replace the first block's content with a single link (toolbar helper). */
export function wrapLinkOnSelection(doc: EditorDoc, href: string): EditorDoc {
  const current = firstBlock(doc)
  const rest = doc.blocks.slice(1)
  switch (current.type) {
    case "bullet_list":
    case "ordered_list":
      return doc
    case "heading": {
      const plain = inlinesPlain(current.children)
      if (!plain.trim()) return doc
      return {
        type: "doc",
        blocks: [
          {
            type: "heading",
            level: current.level,
            children: [{ type: "link", text: plain, href }],
          },
          ...rest,
        ],
      }
    }
    case "paragraph": {
      const plain = inlinesPlain(current.children)
      if (!plain.trim()) return doc
      return {
        type: "doc",
        blocks: [
          {
            type: "paragraph",
            children: [{ type: "link", text: plain, href }],
          },
          ...rest,
        ],
      }
    }
  }
}
