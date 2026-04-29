import * as React from "react"
import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  label?: string
  hint?: string
  error?: string
}

function Input({ className, type, label, hint, error, id, ...props }: InputProps) {
  const inputId = id
  return (
    <div className={cn("flex flex-col gap-1.5", (label || hint || error) ? "" : "contents")}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium leading-none text-foreground"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        data-slot="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          "h-10 w-full min-w-0 rounded-[var(--radius-md)] border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          error ? "border-destructive focus-visible:ring-destructive/30" : "",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

export { Input }
