"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "./df-input"
import { cn } from "../lib/utils"

function SearchInput({
  className,
  inputClassName,
  ...props
}: Omit<React.ComponentProps<"input">, "className"> & {
  className?: string
  inputClassName?: string
}) {
  return (
    <div className={cn("relative", className)} data-df="search-input">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("pl-8", inputClassName)} {...props} />
    </div>
  )
}

export { SearchInput }
