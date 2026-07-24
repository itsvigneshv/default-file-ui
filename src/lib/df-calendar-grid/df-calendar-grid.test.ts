import assert from "node:assert/strict"
import { test } from "node:test"

import {
  assignLanes,
  buildMonthGrid,
  dayOffsetFrom,
  filterDependencies,
  projectBar,
  utcInclusiveDays,
  windowDayHeaders,
} from "./index.ts"

test("utcInclusiveDays counts inclusive span", () => {
  assert.equal(utcInclusiveDays("2026-07-01", "2026-07-01"), 1)
  assert.equal(utcInclusiveDays("2026-07-01", "2026-07-03"), 3)
})

test("buildMonthGrid returns 42 cells for July 2026", () => {
  const cells = buildMonthGrid("2026-07-15")
  assert.equal(cells.length, 42)
  assert.equal(cells.filter((cell) => cell.inMonth).length, 31)
  assert.equal(cells[0]?.weekday, 0)
})

test("projectBar clips to window", () => {
  const bar = projectBar({
    id: "a",
    startsOn: "2026-06-28",
    endsOn: "2026-07-05",
    windowStart: "2026-07-01",
    windowEnd: "2026-07-10",
  })
  assert.ok(bar)
  assert.equal(bar.offsetDays, 0)
  assert.equal(bar.spanDays, 5)
  assert.equal(bar.clippedStart, true)
  assert.equal(bar.clippedEnd, false)
  assert.equal(dayOffsetFrom("2026-07-01", "2026-07-03"), 2)
})

test("assignLanes stacks overlaps", () => {
  const lanes = assignLanes([
    {
      id: "a",
      offsetDays: 0,
      spanDays: 4,
      clippedStart: false,
      clippedEnd: false,
    },
    {
      id: "b",
      offsetDays: 2,
      spanDays: 3,
      clippedStart: false,
      clippedEnd: false,
    },
    {
      id: "c",
      offsetDays: 5,
      spanDays: 2,
      clippedStart: false,
      clippedEnd: false,
    },
  ])
  const byId = Object.fromEntries(lanes.map((row) => [row.id, row.lane]))
  assert.equal(byId.a, 0)
  assert.equal(byId.b, 1)
  assert.equal(byId.c, 0)
})

test("windowDayHeaders and dependency filter", () => {
  assert.deepEqual(windowDayHeaders("2026-07-01", "2026-07-03"), [
    "2026-07-01",
    "2026-07-02",
    "2026-07-03",
  ])
  const deps = filterDependencies(
    [
      { fromId: "a", toId: "b" },
      { fromId: "a", toId: "missing" },
    ],
    new Set(["a", "b"])
  )
  assert.equal(deps.length, 1)
})
