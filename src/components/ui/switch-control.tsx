"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useId } from "react"

type SwitchControlProps = {
  label: string
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  name?: string
}

export function SwitchControl({
  label,
  defaultChecked,
  checked,
  onCheckedChange,
  name,
}: SwitchControlProps) {
  const id = useId()
  return (
    <div className="flex items-center gap-3">
      <Switch
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
        {label}
      </Label>
    </div>
  )
}
