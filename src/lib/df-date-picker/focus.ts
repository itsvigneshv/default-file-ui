import { addUtcDays, formatUtcDate, startOfUtcDay } from "../df-date/index"

import {
  compareIsoDays,
  monthKey,
  resolveNearestEnabledDay,
  shiftUtcMonth,
  startOfUtcMonthIso,
  type DayBounds,
} from "./month"

export type CalendarFocusMove = {
  focusIso: string
  /** True when the focused day leaves the previously visible month. */
  monthChanged: boolean
  monthIso: string
}

type MoveDirection = 1 | -1

function directionForKey(key: string): MoveDirection | null {
  switch (key) {
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
    case "Home":
      return -1
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
    case "End":
      return 1
    default:
      return null
  }
}

function stayPut(focusIso: string, visibleMonthIso: string): CalendarFocusMove {
  return {
    focusIso: formatUtcDate(startOfUtcDay(focusIso)),
    monthChanged: false,
    monthIso: startOfUtcMonthIso(visibleMonthIso),
  }
}

function toMove(
  focusIso: string,
  resolvedIso: string,
  visibleMonthIso: string
): CalendarFocusMove {
  const focus = formatUtcDate(startOfUtcDay(focusIso))
  const resolved = formatUtcDate(startOfUtcDay(resolvedIso))
  if (compareIsoDays(focus, resolved) === 0) {
    return stayPut(focus, visibleMonthIso)
  }
  return {
    focusIso: resolved,
    monthChanged: monthKey(visibleMonthIso) !== monthKey(resolved),
    monthIso: startOfUtcMonthIso(resolved),
  }
}

/**
 * Move roving focus across a Sunday-start month grid.
 * Arrow keys step by day or week; Home/End bound the week;
 * PageUp/PageDown shift the UTC month while preserving day-of-month.
 * Disabled and out-of-range days are skipped in the travel direction.
 */
export function moveCalendarFocus(
  focusIso: string,
  key: string,
  visibleMonthIso: string,
  bounds: DayBounds = {}
): CalendarFocusMove | null {
  const direction = directionForKey(key)
  if (direction == null) return null

  const focus = startOfUtcDay(focusIso)
  const focusDay = formatUtcDate(focus)
  let candidate: string
  let limitIso: string | undefined

  switch (key) {
    case "ArrowLeft":
      candidate = formatUtcDate(addUtcDays(focus, -1))
      break
    case "ArrowRight":
      candidate = formatUtcDate(addUtcDays(focus, 1))
      break
    case "ArrowUp":
      candidate = formatUtcDate(addUtcDays(focus, -7))
      break
    case "ArrowDown":
      candidate = formatUtcDate(addUtcDays(focus, 7))
      break
    case "Home": {
      const weekday = focus.getUTCDay()
      candidate = formatUtcDate(addUtcDays(focus, -weekday))
      limitIso = formatUtcDate(addUtcDays(focus, 6 - weekday))
      break
    }
    case "End": {
      const weekday = focus.getUTCDay()
      candidate = formatUtcDate(addUtcDays(focus, 6 - weekday))
      limitIso = formatUtcDate(addUtcDays(focus, -weekday))
      break
    }
    case "PageUp":
      candidate = formatUtcDate(shiftUtcMonth(focus, -1))
      break
    case "PageDown":
      candidate = formatUtcDate(shiftUtcMonth(focus, 1))
      break
    default:
      return null
  }

  const searchDirection: MoveDirection =
    key === "Home" ? 1 : key === "End" ? -1 : direction

  const resolved = resolveNearestEnabledDay(candidate, searchDirection, bounds, {
    limitIso,
    fallbackIso: focusDay,
  })

  return toMove(focusDay, resolved, visibleMonthIso)
}
