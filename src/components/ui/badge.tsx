import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-5 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline:
          "border-border text-foreground bg-transparent",
        muted:
          "border-transparent bg-muted text-muted-foreground",
        ghost:
          "border-transparent bg-transparent text-muted-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        danger:
          "border-danger/30 bg-danger/10 text-danger",
        success:
          "border-success/30 bg-success/10 text-success",
        warning:
          "border-warning/30 bg-warning/10 text-warning",
        info:
          "border-info/30 bg-info/10 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
