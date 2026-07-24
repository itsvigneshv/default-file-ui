import assert from "node:assert/strict"
import { test } from "node:test"

import { createStore } from "./index.ts"

test("df-store updates subscribers", () => {
  const store = createStore({ count: 0 })
  let seen = 0
  const unsubscribe = store.subscribe(() => {
    seen = store.getState().count
  })
  store.setState({ count: 3 })
  assert.equal(seen, 3)
  store.setState((state) => ({ count: state.count + 1 }))
  assert.equal(store.getState().count, 4)
  unsubscribe()
})
