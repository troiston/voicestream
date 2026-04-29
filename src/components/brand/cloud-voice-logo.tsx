import Image from "next/image"
import { cn } from "@/lib/utils"

const SIZES = {
  sm: { h: 24, w: 36 },
  md: { h: 32, w: 48 },
  lg: { h: 56, w: 84 },
} as const

type Size = keyof typeof SIZES

export function CloudVoiceLogo({
  size = "sm",
  priority = false,
  showWordmark = true,
  className,
}: {
  size?: Size
  priority?: boolean
  showWordmark?: boolean
  className?: string
}) {
  const { h, w } = SIZES[size]
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/logos/logo-01.png"
        alt="CloudVoice"
        width={w}
        height={h}
        priority={priority}
        style={{ width: w, height: h }}
      />
      {showWordmark && (
        <span
          className={cn(
            "gradient-text font-bold tracking-tight",
            size === "sm" && "text-base",
            size === "md" && "text-lg",
            size === "lg" && "text-2xl",
          )}
        >
          CloudVoice
        </span>
      )}
    </span>
  )
}
