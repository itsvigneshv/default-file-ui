import type * as React from "react"

type PaddingChromeProps = {
  padding?: string
  paddingX?: string
  paddingY?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
}

type ResolvedPaddingSides = {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

function resolvePaddingSides({
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
}: PaddingChromeProps): ResolvedPaddingSides {
  return {
    top: paddingTop ?? paddingY ?? padding,
    right: paddingRight ?? paddingX ?? padding,
    bottom: paddingBottom ?? paddingY ?? padding,
    left: paddingLeft ?? paddingX ?? padding,
  }
}

function hasResolvedPadding(sides: ResolvedPaddingSides): boolean {
  return (
    sides.top != null ||
    sides.right != null ||
    sides.bottom != null ||
    sides.left != null
  )
}

function dfPaddingChromeStyle(
  varPrefix: string,
  sides: ResolvedPaddingSides
): React.CSSProperties {
  return {
    ...(sides.top != null ? { [`${varPrefix}-top`]: sides.top } : null),
    ...(sides.right != null ? { [`${varPrefix}-right`]: sides.right } : null),
    ...(sides.bottom != null ? { [`${varPrefix}-bottom`]: sides.bottom } : null),
    ...(sides.left != null ? { [`${varPrefix}-left`]: sides.left } : null),
  } as React.CSSProperties
}

export {
  dfPaddingChromeStyle,
  hasResolvedPadding,
  resolvePaddingSides,
}
export type { PaddingChromeProps, ResolvedPaddingSides }
