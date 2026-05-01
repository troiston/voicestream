"use client"

import { Check, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TASKS = [
  { id: "privacy", label: "Configurar privacidade de áudio", href: "/onboarding" },
  { id: "voice", label: "Escolher idioma e voz", href: "/onboarding" },
  { id: "integrations", label: "Ativar integrações", href: "/onboarding" },
  { id: "first-space", label: "Criar primeiro espaço", href: "/spaces" },
  { id: "invite", label: "Convidar equipe (opcional)", href: "/team" },
]

type OnboardingChecklistProps = {
  completedTasks?: string[]
}

export function OnboardingChecklist({ completedTasks = [] }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const progress = completedTasks.length
  const total = TASKS.length
  const percentage = Math.round((progress / total) * 100)

  return (
    <aside className="sticky top-0 lg:sticky lg:top-4 w-full lg:w-80 shrink-0">
      <div className="rounded-[var(--radius-xl)] border border-border/60 bg-surface-1 p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <h3 className="font-semibold text-foreground">Primeiros passos</h3>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">{progress}/{total}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-hover transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Tasks list */}
        <ul className="space-y-2 mb-5">
          {TASKS.map((task) => {
            const isCompleted = completedTasks.includes(task.id)
            return (
              <li key={task.id}>
                <Link
                  href={task.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors",
                    isCompleted
                      ? "bg-success/10 text-success cursor-default pointer-events-none"
                      : "text-foreground hover:bg-surface-2"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      isCompleted
                        ? "border-success bg-success text-white"
                        : "border-border/60 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-2.5 w-2.5" /> : null}
                  </div>
                  <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                    {task.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Action */}
        {progress === total ? (
          <div className="rounded-[var(--radius-md)] bg-success/10 px-3 py-2.5 text-center text-xs font-medium text-success">
            Parabéns! Onboarding concluído.
          </div>
        ) : (
          <Link href="/onboarding">
            <Button variant="outline" size="sm" className="w-full border-border/60 bg-surface-2 text-foreground hover:bg-surface-3">
              Continuar setup
            </Button>
          </Link>
        )}
      </div>
    </aside>
  )
}
