"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
} from "react"

import {
  insertMentionStub,
  setBlockStyle,
  setListStyle,
  wrapLinkOnSelection,
} from "./commands"
import { emptyDoc, type EditorDoc } from "./document"
import { serializeHtml, parseHtml } from "./html"
import { serializeMarkdown } from "./markdown"
import { sanitizePasteHtml } from "./sanitize"

export type UseDfEditorOptions = {
  value?: EditorDoc
  defaultValue?: EditorDoc
  onChange?: (doc: EditorDoc) => void
  disabled?: boolean
}

export function useDfEditor(options: UseDfEditorOptions = {}) {
  const controlled = options.value !== undefined
  const [internal, setInternal] = useState<EditorDoc>(
    options.value ?? options.defaultValue ?? emptyDoc()
  )
  const doc = controlled ? options.value! : internal
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const skipDomSync = useRef(false)

  const commit = useCallback(
    (next: EditorDoc) => {
      if (!controlled) setInternal(next)
      options.onChange?.(next)
    },
    [controlled, options]
  )

  useEffect(() => {
    const el = surfaceRef.current
    if (!el || options.disabled) return
    if (skipDomSync.current) {
      skipDomSync.current = false
      return
    }
    const html = serializeHtml(doc)
    if (el.innerHTML !== html) {
      el.innerHTML = html
    }
  }, [doc, options.disabled])

  const syncFromDom = useCallback(() => {
    const el = surfaceRef.current
    if (!el) return
    skipDomSync.current = true
    commit(parseHtml(el.innerHTML))
  }, [commit])

  const onInput = useCallback(
    (_event: FormEvent<HTMLDivElement>) => {
      syncFromDom()
    },
    [syncFromDom]
  )

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault()
      const html =
        event.clipboardData.getData("text/html") ||
        event.clipboardData.getData("text/plain")
      const clean = sanitizePasteHtml(html)
      const next = parseHtml(clean)
      commit(next)
    },
    [commit]
  )

  const apply = useCallback(
    (updater: (current: EditorDoc) => EditorDoc) => {
      commit(updater(doc))
    },
    [commit, doc]
  )

  return {
    doc,
    surfaceRef,
    html: serializeHtml(doc),
    markdown: serializeMarkdown(doc),
    disabled: options.disabled === true,
    surfaceProps: {
      ref: surfaceRef,
      contentEditable: options.disabled !== true,
      suppressContentEditableWarning: true,
      role: "textbox" as const,
      "aria-multiline": true,
      "data-df": "editor-surface",
      onInput,
      onBlur: syncFromDom,
      onPaste,
    },
    setHeading: (level: 0 | 1 | 2 | 3) =>
      apply((current) => setBlockStyle(current, level)),
    setList: (listType: "bullet_list" | "ordered_list" | "none") =>
      apply((current) => setListStyle(current, listType)),
    insertMention: (mention: { id: string; label: string }) =>
      apply((current) => insertMentionStub(current, mention)),
    setLink: (href: string) =>
      apply((current) => wrapLinkOnSelection(current, href)),
  }
}

export type DfEditorApi = ReturnType<typeof useDfEditor>
