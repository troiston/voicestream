"use client"

import { useRouter } from "next/navigation"
import { useCallback, useId, useState } from "react"
import { Check, Mic } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STEPS = ["Privacidade de áudio", "Idioma e voz", "Integrações"] as const

export type OnboardingWizardProps = {
  className?: string
}

export function OnboardingWizard({ className }: OnboardingWizardProps) {
  const router = useRouter()
  const baseId = useId()
  const [step, setStep] = useState(0)
  const [audioPolicy, setAudioPolicy] = useState<"workspace" | "private" | "strict">("workspace")
  const [retainRaw, setRetainRaw] = useState(false)
  const [locale, setLocale] = useState("pt-BR")
  const [voicePreset, setVoicePreset] = useState("balanced")
  const [slackOn, setSlackOn] = useState(false)
  const [calendarOn, setCalendarOn] = useState(true)

  const goDashboard = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else goDashboard()
  }

  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className={cn("min-h-screen bg-glow-hero bg-grid-pattern flex items-center justify-center px-4 py-12", className)}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-brand/15">
            <Mic className="h-6 w-6 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Primeiros passos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure o VoiceStream ao seu gosto</p>
        </div>

        {/* Step indicator */}
        <nav aria-label="Progresso do onboarding" className="mb-6">
          <ol className="flex items-center justify-center gap-2">
            {STEPS.map((label, i) => {
              const done = i < step
              const current = i === step
              return (
                <li key={label} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={cn(
                      "h-px w-8 transition-colors",
                      done ? "bg-brand" : "bg-border/60"
                    )} />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                        current && "border-brand bg-brand/15 text-brand",
                        done && "border-brand bg-brand text-brand-foreground",
                        !current && !done && "border-border/60 text-muted-foreground",
                      )}
                      aria-current={current ? "step" : undefined}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={cn(
                      "hidden text-xs sm:block",
                      current ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Card */}
        <div className="glass-card rounded-[var(--radius-2xl)] p-8 shadow-lg">
          <h2 className="mb-1 text-lg font-bold tracking-tight gradient-text">{STEPS[step]}</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {step === 0
              ? "Define como o áudio bruto e as transcrições são tratados neste ambiente."
              : step === 1
                ? "Escolhe idioma de transcrição e perfil de voz para o STT."
                : "Liga integrações de produtividade (simulado nesta fase)."}
          </p>

          {/* Step 0 — Privacy */}
          {step === 0 && (
            <fieldset className="space-y-3" aria-labelledby={`${baseId}-legend-audio`}>
              <legend id={`${baseId}-legend-audio`} className="sr-only">
                Política de áudio
              </legend>
              {(
                [
                  { id: "workspace" as const, label: "Membros do Espaço", desc: "Alinhado a equipes partilhadas." },
                  { id: "private" as const, label: "Só eu", desc: "Ideal para notas pessoais." },
                  { id: "strict" as const, label: "Estrito + auditoria", desc: "Menos compartilhamento; trilhos de revisão." },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors",
                    audioPolicy === opt.id
                      ? "border-brand/40 bg-brand/10"
                      : "border-border/60 hover:border-brand/20 hover:bg-surface-2/50",
                  )}
                >
                  <input
                    type="radio"
                    name="audioPolicy"
                    value={opt.id}
                    checked={audioPolicy === opt.id}
                    onChange={() => setAudioPolicy(opt.id)}
                    className="mt-0.5 h-4 w-4 accent-[oklch(65%_0.22_280)]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground">{opt.desc}</span>
                  </span>
                </label>
              ))}
              <label className={cn(
                "flex cursor-pointer gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors",
                retainRaw ? "border-brand/40 bg-brand/10" : "border-border/60 hover:bg-surface-2/50"
              )}>
                <input
                  type="checkbox"
                  checked={retainRaw}
                  onChange={(e) => setRetainRaw(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[oklch(65%_0.22_280)]"
                />
                <span>
                  <span className="block text-sm font-medium">Manter áudio bruto até 24h</span>
                  <span className="block text-xs text-muted-foreground">
                    Apagamento automático após o prazo.
                  </span>
                </span>
              </label>
            </fieldset>
          )}

          {/* Step 1 — Language */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor={`${baseId}-locale`} className="text-sm font-medium">
                  Idioma da transcrição
                </label>
                <select
                  id={`${baseId}-locale`}
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="mt-2 w-full appearance-none rounded-[var(--radius-md)] border border-input bg-surface-2/50 px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="pt-PT">Português (Portugal)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div>
                <span className="text-sm font-medium">Perfil de voz / STT</span>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Perfil de voz">
                  {(
                    [
                      { id: "balanced", label: "Equilibrado" },
                      { id: "meeting", label: "Reuniões" },
                      { id: "field", label: "Campo / ruído" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setVoicePreset(p.id)}
                      className={cn(
                        "rounded-[var(--radius-md)] border px-4 py-2 text-sm font-medium transition-colors",
                        voicePreset === p.id
                          ? "border-brand/40 bg-brand/15 text-brand"
                          : "border-border/60 text-muted-foreground hover:border-brand/20 hover:text-foreground",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Integrations */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Conexões simuladas — na produção você vai usar OAuth com escopos mínimos.
              </p>
              {([
                { key: "slack", on: slackOn, set: setSlackOn, label: "Slack", desc: "Publicar resumos em canal" },
                { key: "calendar", on: calendarOn, set: setCalendarOn, label: "Calendário", desc: "Sugerir título da sessão" },
              ]).map((item) => (
                <label
                  key={item.key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors",
                    item.on ? "border-brand/40 bg-brand/10" : "border-border/60 hover:bg-surface-2/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={item.on}
                    onChange={(e) => item.set(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[oklch(65%_0.22_280)]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border/60 pt-6">
            <Button type="button" variant="ghost" size="sm" onClick={goDashboard}>
              Saltar configuração
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button type="button" variant="secondary" size="sm" onClick={back}>
                  Anterior
                </Button>
              )}
              <Button type="button" variant="primary" onClick={next}>
                {step === STEPS.length - 1 ? "Concluir" : "Seguinte"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
