import assert from "node:assert/strict"
import { test } from "node:test"

import {
  indexFromPointerY,
  moveBoardItem,
  moveIndex,
} from "./reorder.ts"

test("moveIndex reorders within a list", () => {
  assert.deepEqual(moveIndex(["a", "b", "c"], 0, 2), ["b", "c", "a"])
  assert.deepEqual(moveIndex(["a", "b", "c"], 2, 0), ["c", "a", "b"])
})

test("moveBoardItem moves across columns", () => {
  const columns = [
    {
      id: "todo",
      items: [{ id: "1" }, { id: "2" }],
    },
    {
      id: "doing",
      items: [{ id: "3" }],
    },
  ]
  const next = moveBoardItem(columns, "1", "doing", 0)
  assert.deepEqual(
    next.map((column) => ({
      id: column.id,
      items: column.items.map((item) => item.id),
    })),
    [
      { id: "todo", items: ["2"] },
      { id: "doing", items: ["1", "3"] },
    ]
  )
})

test("indexFromPointerY picks insert index from midpoints", () => {
  const rects = [
    { id: "a", top: 0, bottom: 40, height: 40 },
    { id: "b", top: 40, bottom: 80, height: 40 },
  ]
  assert.equal(indexFromPointerY(10, rects), 0)
  assert.equal(indexFromPointerY(50, rects), 1)
  assert.equal(indexFromPointerY(90, rects), 2)
})
