import {
  emptyDoc,
  type BlockNode,
  type EditorDoc,
  type InlineNode,
} from "./document"

function escapeMarkdownText(text: string): string {
  return text.replace(/([\\`*_[\]#])/g, "\\$1")
}

function serializeInlines(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "mention") {
        return `@[${escapeMarkdownText(node.label)}](mention:${node.id})`
      }
      if (node.type === "link") {
        return `[${escapeMarkdownText(node.text)}](${node.href})`
      }
      let out = escapeMarkdownText(node.text)
      if (node.code) out = `\`${node.text.replace(/`/g, "\\`")}\``
      if (node.bold) out = `**${out}**`
      if (node.italic) out = `*${out}*`
      return out
    })
    .join("")
}

export function serializeMarkdown(doc: EditorDoc): string {
  const lines: string[] = []
  for (const block of doc.blocks) {
    if (block.type === "heading") {
      lines.push(`${"#".repeat(block.level)} ${serializeInlines(block.children)}`)
      lines.push("")
      continue
    }
    if (block.type === "paragraph") {
      lines.push(serializeInlines(block.children))
      lines.push("")
      continue
    }
    block.items.forEach((item, index) => {
      const marker =
        block.type === "ordered_list" ? `${index + 1}.` : "-"
      lines.push(`${marker} ${serializeInlines(item)}`)
    })
    lines.push("")
  }
  return lines.join("\n").replace(/\n+$/u, "") + (lines.length ? "\n" : "")
}

function parseInlineChunk(input: string): InlineNode[] {
  const nodes: InlineNode[] = []
  let rest = input
  const patterns: Array<{
    re: RegExp
    toNode: (match: RegExpExecArray) => InlineNode
  }> = [
    {
      re: /^@\[([^\]]+)\]\(mention:([^)]+)\)/,
      toNode: (match) => ({
        type: "mention",
        label: match[1]!,
        id: match[2]!,
      }),
    },
    {
      re: /^\[([^\]]+)\]\(([^)]+)\)/,
      toNode: (match) => ({
        type: "link",
        text: match[1]!,
        href: match[2]!,
      }),
    },
    {
      re: /^\*\*([^*]+)\*\*/,
      toNode: (match) => ({ type: "text", text: match[1]!, bold: true }),
    },
    {
      re: /^\*([^*]+)\*/,
      toNode: (match) => ({ type: "text", text: match[1]!, italic: true }),
    },
    {
      re: /^`([^`]+)`/,
      toNode: (match) => ({ type: "text", text: match[1]!, code: true }),
    },
  ]

  while (rest.length > 0) {
    let matched = false
    for (const pattern of patterns) {
      const match = pattern.re.exec(rest)
      if (!match) continue
      nodes.push(pattern.toNode(match))
      rest = rest.slice(match[0].length)
      matched = true
      break
    }
    if (matched) continue
    const nextSpecial = rest.search(/[@\[*`]/)
    if (nextSpecial <= 0) {
      const take = nextSpecial === 0 ? 1 : rest.length
      const last = nodes[nodes.length - 1]
      if (last?.type === "text" && !last.bold && !last.italic && !last.code) {
        last.text += rest.slice(0, take)
      } else {
        nodes.push({ type: "text", text: rest.slice(0, take) })
      }
      rest = rest.slice(take)
      continue
    }
    const chunk = rest.slice(0, nextSpecial)
    const last = nodes[nodes.length - 1]
    if (last?.type === "text" && !last.bold && !last.italic && !last.code) {
      last.text += chunk
    } else {
      nodes.push({ type: "text", text: chunk })
    }
    rest = rest.slice(nextSpecial)
  }

  return nodes.length > 0 ? nodes : [{ type: "text", text: "" }]
}

function unescapeText(text: string): string {
  return text.replace(/\\([\\`*_[\]#])/g, "$1")
}

function parseInlines(line: string): InlineNode[] {
  return parseInlineChunk(unescapeText(line))
}

/** Parse a Markdown subset into an EditorDoc. */
export function parseMarkdown(source: string): EditorDoc {
  const normalized = source.replace(/\r\n/g, "\n")
  if (normalized.trim() === "") return emptyDoc()

  const blocks: BlockNode[] = []
  const lines = normalized.split("\n")
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ""
    if (line.trim() === "") {
      index += 1
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1]!.length as 1 | 2 | 3,
        children: parseInlines(heading[2]!),
      })
      index += 1
      continue
    }

    const bullet = /^-\s+(.*)$/.exec(line)
    if (bullet) {
      const items: InlineNode[][] = []
      while (index < lines.length) {
        const row = lines[index] ?? ""
        const match = /^-\s+(.*)$/.exec(row)
        if (!match) break
        items.push(parseInlines(match[1]!))
        index += 1
      }
      blocks.push({ type: "bullet_list", items })
      continue
    }

    const ordered = /^(\d+)\.\s+(.*)$/.exec(line)
    if (ordered) {
      const items: InlineNode[][] = []
      while (index < lines.length) {
        const row = lines[index] ?? ""
        const match = /^\d+\.\s+(.*)$/.exec(row)
        if (!match) break
        items.push(parseInlines(match[1]!))
        index += 1
      }
      blocks.push({ type: "ordered_list", items })
      continue
    }

    blocks.push({
      type: "paragraph",
      children: parseInlines(line),
    })
    index += 1
  }

  return { type: "doc", blocks: blocks.length > 0 ? blocks : emptyDoc().blocks }
}
