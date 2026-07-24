import assert from "node:assert/strict"
import { test } from "node:test"

import {
  polylinePath,
  projectSeriesToSvg,
  remainingFromBurns,
  seriesBounds,
} from "./index.ts"

test("seriesBounds expands degenerate axes", () => {
  const bounds = seriesBounds([
    { id: "a", points: [{ x: 2, y: 5 }] },
  ])
  assert.equal(bounds.minX, 2)
  assert.equal(bounds.maxX, 3)
  assert.equal(bounds.minY, 5)
  assert.equal(bounds.maxY, 6)
})

test("projectSeriesToSvg and polylinePath", () => {
  const series = {
    id: "a",
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
  }
  const bounds = seriesBounds([series])
  const svg = projectSeriesToSvg(series, bounds, 100, 50, 0)
  assert.equal(svg[0]?.x, 0)
  assert.equal(svg[0]?.y, 50)
  assert.equal(svg[1]?.x, 100)
  assert.equal(svg[1]?.y, 0)
  assert.ok(polylinePath(svg).startsWith("M"))
})

test("remainingFromBurns builds burndown points", () => {
  const points = remainingFromBurns(10, [3, 2, 5])
  assert.deepEqual(
    points.map((point) => point.y),
    [10, 7, 5, 0]
  )
})
