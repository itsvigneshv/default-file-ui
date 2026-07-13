import * as React from "react"

import { cn } from "../lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-df="input"
      className={cn("df-input", className)}
      {...props}
    />
  )
}

export { Input }
