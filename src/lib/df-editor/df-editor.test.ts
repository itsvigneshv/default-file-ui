import assert from "node:assert/strict"
import { test } from "node:test"

import {
  insertMentionStub,
  setBlockStyle,
  setListStyle,
} from "./commands.ts"
import { emptyDoc } from "./document.ts"
import { parseHtml, serializeHtml } from "./html.ts"
import { parseJson, serializeJson } from "./json.ts"
import { parseMarkdown, serializeMarkdown } from "./markdown.ts"
import { htmlToMarkdown, sanitizePasteHtml } from "./sanitize.ts"

test("markdown round-trip for headings lists and marks", () => {
  const source = [
    "# Title",
    "",
    "Hello **bold** and *italic* and `code`.",
    "",
    "- one",
    "- two",
    "",
    "1. first",
    "2. second",
    "",
    "See [docs](https://example.com) and @[Dev](mention:dev-1).",
    "",
  ].join("\n")
  const doc = parseMarkdown(source)
  const again = serializeMarkdown(doc)
  const round = parseMarkdown(again)
  assert.equal(round.blocks[0]?.type, "heading")
  assert.equal(serializeMarkdown(round).includes("**bold**"), true)
  assert.equal(serializeMarkdown(round).includes("https://example.com"), true)
  assert.equal(serializeMarkdown(round).includes("mention:dev-1"), true)
})

test("json serialize parse preserves shape", () => {
  const doc = parseMarkdown("## Spec\n\nBody text\n")
  const parsed = parseJson(serializeJson(doc))
  assert.deepEqual(parsed, doc)
})

test("empty markdown becomes empty doc", () => {
  const doc = parseMarkdown("   \n")
  assert.equal(doc.blocks[0]?.type, "paragraph")
  assert.equal(serializeJson(emptyDoc()).includes('"doc"'), true)
})

test("sanitizePasteHtml strips script and handlers", () => {
  const dirty =
    '<p onclick="alert(1)">Hi</p><script>alert(2)</script><a href="javascript:alert(3)">x</a>'
  const clean = sanitizePasteHtml(dirty)
  assert.equal(clean.includes("script"), false)
  assert.equal(clean.includes("onclick"), false)
  assert.equal(clean.includes("javascript:"), false)
})

test("html paste path becomes markdown then doc", () => {
  const md = htmlToMarkdown(
    "<h2>Plan</h2><p>Ship <strong>fast</strong></p><ul><li>One</li></ul>"
  )
  assert.equal(md.includes("## Plan"), true)
  assert.equal(md.includes("**fast**"), true)
  assert.equal(md.includes("- One"), true)
  const doc = parseHtml(
    "<h2>Plan</h2><p>Ship <strong>fast</strong></p><ul><li>One</li></ul>"
  )
  assert.equal(doc.blocks[0]?.type, "heading")
  assert.equal(serializeHtml(doc).includes("<h2>"), true)
})

test("commands set heading list and mention", () => {
  let doc = parseMarkdown("Hello world")
  doc = setBlockStyle(doc, 2)
  assert.equal(doc.blocks[0]?.type, "heading")
  doc = setListStyle(doc, "bullet_list")
  assert.equal(doc.blocks[0]?.type, "bullet_list")
  doc = insertMentionStub(doc, { id: "u1", label: "Ada" })
  assert.equal(serializeMarkdown(doc).includes("mention:u1"), true)
})
