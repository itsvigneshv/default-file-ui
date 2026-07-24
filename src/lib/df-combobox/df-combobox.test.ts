import assert from "node:assert/strict"
import { test } from "node:test"

import {
  enabledComboboxIndexes,
  filterComboboxOptions,
  mergeComboboxOptions,
  moveComboboxActiveIndex,
  resolveComboboxCommit,
  type ComboboxOption,
} from "./filter.ts"

const OPTIONS: ComboboxOption[] = [
  { value: "design", label: "Design" },
  { value: "ship", label: "Ship", disabled: true },
  { value: "polish", label: "Polish" },
]

test("filterComboboxOptions matches label or value substrings", () => {
  assert.deepEqual(filterComboboxOptions(OPTIONS, "po"), [
    { value: "polish", label: "Polish" },
  ])
  assert.deepEqual(filterComboboxOptions(OPTIONS, "SHIP"), [
    { value: "ship", label: "Ship", disabled: true },
  ])
  assert.equal(filterComboboxOptions(OPTIONS, "").length, 3)
})

test("mergeComboboxOptions prefers the first value occurrence", () => {
  assert.deepEqual(
    mergeComboboxOptions(
      [{ value: "a", label: "Primary A" }],
      [
        { value: "a", label: "Secondary A" },
        { value: "b", label: "B" },
      ]
    ),
    [
      { value: "a", label: "Primary A" },
      { value: "b", label: "B" },
    ]
  )
})

test("moveComboboxActiveIndex wraps across enabled options only", () => {
  const enabled = enabledComboboxIndexes(OPTIONS)
  assert.deepEqual(enabled, [0, 2])
  assert.equal(moveComboboxActiveIndex(null, 1, enabled), 0)
  assert.equal(moveComboboxActiveIndex(0, 1, enabled), 2)
  assert.equal(moveComboboxActiveIndex(2, 1, enabled), 0)
  assert.equal(moveComboboxActiveIndex(2, -1, enabled), 0)
})

test("resolveComboboxCommit prefers the active option over custom text", () => {
  assert.deepEqual(
    resolveComboboxCommit({
      activeIndex: 2,
      filtered: OPTIONS,
      query: "custom",
      allowCustomValue: true,
    }),
    { kind: "option", option: OPTIONS[2]! }
  )
  assert.deepEqual(
    resolveComboboxCommit({
      activeIndex: 1,
      filtered: OPTIONS,
      query: "custom",
      allowCustomValue: true,
    }),
    { kind: "custom", value: "custom" }
  )
})

test("resolveComboboxCommit commits free text only when nothing is active", () => {
  assert.deepEqual(
    resolveComboboxCommit({
      activeIndex: null,
      filtered: OPTIONS,
      query: "  custom  ",
      allowCustomValue: true,
    }),
    { kind: "custom", value: "custom" }
  )
  assert.deepEqual(
    resolveComboboxCommit({
      activeIndex: null,
      filtered: OPTIONS,
      query: "custom",
      allowCustomValue: false,
    }),
    { kind: "none" }
  )
  assert.deepEqual(
    resolveComboboxCommit({
      activeIndex: null,
      filtered: OPTIONS,
      query: "",
      allowCustomValue: true,
    }),
    { kind: "none" }
  )
})
