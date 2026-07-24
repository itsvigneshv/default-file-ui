import { emptyDoc, isEditorDoc, type EditorDoc } from "./document"

export function serializeJson(doc: EditorDoc): string {
  return JSON.stringify(doc)
}

export function parseJson(source: string): EditorDoc {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    throw new Error("Invalid editor JSON")
  }
  if (!isEditorDoc(value)) {
    throw new Error("Invalid editor document shape")
  }
  if (value.blocks.length === 0) return emptyDoc()
  return value
}
