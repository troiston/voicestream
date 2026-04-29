import * as React from "react"
import { cn } from "@/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  label?: string
  hint?: string
  error?: string
}

function Textarea({ className, label, hint, error, id, ...props }: TextareaProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", (label || hint || error) ? "" : "contents")}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        data-slot="textarea"
        aria-invalid={error ? true : undefined}
        className={cn(
          "flex min-h-20 w-full rounded-[var(--radius-md)] border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none resize-y",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive focus-visible:ring-destructive/30" : "",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export { Textarea }
