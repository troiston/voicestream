import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type CheckboxFieldProps = {
  id: string
  name?: string
  label: string
  description?: string
  className?: string
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function CheckboxField({
  id,
  name,
  label,
  description,
  className,
  defaultChecked,
  checked,
  onCheckedChange,
}: CheckboxFieldProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium leading-none cursor-pointer">
          {label}
        </Label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
