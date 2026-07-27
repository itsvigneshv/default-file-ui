import type * as React from "react"

type CssVarValue = string | number | null | undefined

/** Map CSS custom property names to values for a React style prop. */
function cssVars(vars: Record<string, CssVarValue>): React.CSSProperties {
  const style: Record<string, string | number> = {}
  for (const [name, value] of Object.entries(vars)) {
    if (value != null) style[name] = value
  }
  return style as React.CSSProperties
}

export { cssVars }
