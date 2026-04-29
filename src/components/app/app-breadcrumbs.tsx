"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const labelMap: Record<string, string> = {
  dashboard: "Painel",
  spaces: "Espaços",
  capture: "Captura",
  tasks: "Tarefas",
  integrations: "Integrações",
  billing: "Faturação",
  usage: "Uso",
  team: "Equipe",
  settings: "Configurações",
  onboarding: "Primeiros passos",
}

function labelFor(s: string): string {
  if (labelMap[s]) return labelMap[s]!
  if (/^sp_/.test(s) || /^[a-f0-9-]{6,}/i.test(s) || s.length > 5) return "Detalhe"
  return s
}

type Item = { href: string; label: string; current: boolean }

export function AppBreadcrumbs() {
  const pathname = usePathname()
  const items = useMemo((): Item[] => {
    const segs = pathname.split("/").filter(Boolean)
    if (segs[0] === "dashboard" && segs.length === 1) {
      return [{ href: "/dashboard", label: "Painel", current: true }]
    }
    const out: Item[] = [{ href: "/dashboard", label: "Painel", current: false }]
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i]!
      if (i === 0 && s === "dashboard") continue
      const p = `/${segs.slice(0, i + 1).join("/")}`
      out.push({ href: p, label: labelFor(s), current: false })
    }
    for (const it of out) it.current = it.href === pathname
    if (out.length > 0 && out.every((x) => !x.current)) out[out.length - 1]!.current = true
    return out
  }, [pathname])

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs sm:text-sm flex-nowrap max-w-full truncate">
        {items.map((item, idx) => (
          <span key={item.href} className="inline-flex items-center gap-1.5">
            {idx > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage className="text-foreground font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
