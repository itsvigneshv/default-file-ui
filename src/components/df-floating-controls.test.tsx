import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  FloatingControls,
  FloatingControlsItem,
} from "./df-floating-controls"

afterEach(() => {
  cleanup()
})

describe("FloatingControls toolbar roving tabindex", () => {
  it("moves focus with arrow keys among toolbar items", () => {
    render(
      <FloatingControls>
        <FloatingControlsItem>One</FloatingControlsItem>
        <FloatingControlsItem>Two</FloatingControlsItem>
        <FloatingControlsItem>Three</FloatingControlsItem>
      </FloatingControls>
    )

    const one = screen.getByRole("button", { name: "One" })
    const two = screen.getByRole("button", { name: "Two" })
    const three = screen.getByRole("button", { name: "Three" })

    expect(one).toHaveAttribute("tabIndex", "0")
    expect(two).toHaveAttribute("tabIndex", "-1")
    expect(three).toHaveAttribute("tabIndex", "-1")

    one.focus()
    fireEvent.keyDown(one, { key: "ArrowRight" })
    expect(two).toHaveFocus()
    expect(two).toHaveAttribute("tabIndex", "0")

    fireEvent.keyDown(two, { key: "ArrowRight" })
    expect(three).toHaveFocus()

    fireEvent.keyDown(three, { key: "Home" })
    expect(one).toHaveFocus()
  })
})
