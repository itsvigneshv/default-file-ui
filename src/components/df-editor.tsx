"use client"

import * as React from "react"

import { docPlainText } from "../lib/df-editor/document"
import { useDfEditor, type UseDfEditorOptions } from "../lib/df-editor/use-df-editor"
import { cn } from "../lib/utils"
import { Button } from "./df-button"

export type DfEditorProps = UseDfEditorOptions & {
  className?: string
  placeholder?: string
  label?: string
}

export function DfEditor({
  className,
  placeholder = "Write…",
  label = "Document",
  ...options
}: DfEditorProps) {
  const editor = useDfEditor(options)
  const empty = docPlainText(editor.doc).trim() === ""

  return (
    <div
      data-df="editor"
      className={cn("df-editor", className)}
      data-disabled={editor.disabled ? "true" : undefined}
    >
      <div className="df-editor-toolbar" role="toolbar" aria-label={`${label} formatting`}>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={editor.disabled}
          onClick={() => editor.setHeading(1)}
        >
          H1
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={editor.disabled}
          onClick={() => editor.setHeading(2)}
        >
          H2
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={editor.disabled}
          onClick={() => editor.setHeading(0)}
        >
          P
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={editor.disabled}
          onClick={() => editor.setList("bullet_list")}
        >
          List
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={editor.disabled}
          onClick={() => editor.setList("ordered_list")}
        >
          1.
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={editor.disabled}
          onClick={() => {
            const href =
              typeof window !== "undefined"
                ? window.prompt("Link URL", "https://")
                : null
            if (href) editor.setLink(href)
          }}
        >
          Link
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={editor.disabled}
          onClick={() =>
            editor.insertMention({ id: "mention-stub", label: "teammate" })
          }
        >
          @
        </Button>
      </div>
      <div className="df-editor-surface-wrap">
        {empty ? (
          <p className="df-editor-placeholder" aria-hidden="true">
            {placeholder}
          </p>
        ) : null}
        <div
          {...editor.surfaceProps}
          aria-label={label}
          className="df-editor-surface"
        />
      </div>
    </div>
  )
}
