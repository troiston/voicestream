import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative grid w-full gap-0.5 rounded-[var(--radius-md)] border px-3.5 py-3 text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-surface-1 border-border text-foreground",
        info:
          "bg-info/10 border-info/30 text-foreground",
        success:
          "bg-success/10 border-success/30 text-foreground",
        warning:
          "bg-warning/10 border-warning/30 text-foreground",
        danger:
          "bg-danger/10 border-danger/30 text-foreground",
        destructive:
          "bg-destructive/10 border-destructive/30 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Compound API + legacy API (title/description props)
type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    title?: string
    description?: string
  }

function Alert({ className, variant, title, description, children, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {title ? (
        <AlertTitle>{title}</AlertTitle>
      ) : null}
      {description ? (
        <AlertDescription>{description}</AlertDescription>
      ) : null}
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-semibold leading-tight group-has-[>svg]:col-start-2", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm text-muted-foreground leading-relaxed group-has-[>svg]:col-start-2", className)}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
