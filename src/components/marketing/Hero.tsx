"use client"

import Link from "next/link"
import { ArrowRight, Mic, Play, Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

export function Hero() {
  const reduce = useReducedMotion()
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section
      className="relative overflow-hidden bg-glow-hero px-4 pb-24 pt-20 sm:px-6 sm:pt-28"
      aria-labelledby="hero-heading"
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" aria-hidden />

      {/* Decorative floating orbs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-12 right-0 h-80 w-80 rounded-full bg-[oklch(70%_0.18_320)]/15 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Announce badge */}
        <motion.div {...fade(0)} className="mb-6 inline-flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3 w-3" aria-hidden />
            Feito para quem vive vários papéis num só dia
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          {...fade(0.08)}
          id="hero-heading"
          className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
        >
          O seu copiloto para
          <span className="block mt-1 gradient-text">a vida que já vives</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          {...fade(0.16)}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
        >
          Grave, transcreva e resuma o que importa — no trabalho, na família e na saúde.
          VoiceStream transforma fala em memória, decisões e tarefas com privacidade por contexto.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fade(0.24)}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/register"
            className="btn-gradient glow-accent inline-flex items-center gap-2 rounded-[var(--radius-md)] px-7 py-3 text-sm font-semibold"
          >
            <Mic className="h-4 w-4" />
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border/60 bg-surface-1/60 px-7 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-surface-2/60 hover:border-brand/20"
          >
            <Play className="h-3.5 w-3.5" />
            Ver como funciona
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.p {...fade(0.32)} className="mt-6 text-xs text-muted-foreground/60">
          Sem cartão de crédito · Cancela quando quiseres
        </motion.p>
      </div>

      {/* Product mockup */}
      <motion.div {...fade(0.4)} className="relative mx-auto mt-16 max-w-5xl">
        {/* Glow behind the screenshot */}
        <div className="absolute inset-0 -z-10 rounded-[var(--radius-2xl)] blur-3xl opacity-40 bg-gradient-to-br from-brand/30 via-[oklch(70%_0.18_320)]/20 to-transparent" />
        <div
          className="aspect-[16/9] overflow-hidden rounded-[var(--radius-2xl)] border border-border/40 bg-surface-1 shadow-2xl"
          role="img"
          aria-label="Pré-visualização da interface VoiceStream mostrando captura de áudio, transcrição e tarefas"
        >
          {/* Top bar */}
          <div className="flex h-9 items-center justify-between border-b border-border/40 bg-surface-2/50 px-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(65%_0.2_25)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(80%_0.15_85)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(70%_0.18_140)]" />
            </div>
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase">
              voicestream.com.br · Espaço Trabalho
            </span>
            <span className="h-5 w-12 rounded-sm bg-surface-3/50" />
          </div>

          {/* Content area: 3 columns */}
          <div className="grid h-[calc(100%-2.25rem)] grid-cols-12 gap-4 p-4 text-left">
            {/* Sidebar */}
            <aside className="col-span-3 hidden flex-col gap-1.5 sm:flex">
              {[
                { label: "Trabalho", active: true, dot: "bg-brand" },
                { label: "Família", dot: "bg-[oklch(75%_0.15_140)]" },
                { label: "Saúde", dot: "bg-[oklch(70%_0.18_25)]" },
                { label: "Finanças", dot: "bg-[oklch(78%_0.15_85)]" },
                { label: "Pessoal", dot: "bg-[oklch(70%_0.18_320)]" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                    s.active ? "bg-brand/10 text-brand" : "text-muted-foreground"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </div>
              ))}
            </aside>

            {/* Capture/transcript */}
            <div className="col-span-12 flex flex-col gap-3 sm:col-span-6">
              {/* Recording card */}
              <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-brand" />
                  </span>
                  <span className="text-xs font-semibold text-brand">Gravando · 03:42</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">Reunião · Comitê semanal</span>
                </div>
                {/* Waveform */}
                <div className="mt-3 flex h-8 items-end gap-0.5">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-sm bg-brand/60"
                      style={{ height: `${(20 + Math.abs(Math.sin(i * 0.6)) * 80).toFixed(2)}%` }}
                    />
                  ))}
                </div>
              </div>
              {/* Transcript */}
              <div className="rounded-lg border border-border/60 bg-surface-2/40 p-3 space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                  Transcrição em tempo real
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="text-muted-foreground">Ana:</span> Vamos avançar com a contratação na sexta.{" "}
                  <span className="text-muted-foreground">João:</span>{" "}
                  Posso{" "}
                  <span className="rounded bg-brand/15 px-1 text-brand">enviar a proposta hoje</span>{" "}
                  até o fim do dia.
                </p>
              </div>
            </div>

            {/* Tasks */}
            <aside className="col-span-12 flex flex-col gap-2 sm:col-span-3">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                Tarefas extraídas
              </p>
              {[
                { label: "Enviar proposta — João", done: false },
                { label: "Revisar contrato", done: false },
                { label: "Agendar follow-up", done: true },
              ].map((t) => (
                <div
                  key={t.label}
                  className="flex items-start gap-2 rounded-md border border-border/40 bg-surface-2/30 p-2 text-xs"
                >
                  <span
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                      t.done ? "border-brand bg-brand text-white" : "border-border/60"
                    }`}
                    aria-hidden
                  >
                    {t.done && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-6" />
                      </svg>
                    )}
                  </span>
                  <span className={t.done ? "text-muted-foreground line-through" : "text-foreground"}>
                    {t.label}
                  </span>
                </div>
              ))}
            </aside>
          </div>
        </div>

        {/* Floating callout */}
        <div className="absolute -bottom-4 left-4 hidden items-center gap-2 rounded-full border border-border/60 bg-surface-1/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(70%_0.18_140)]" />
          Privacidade por contexto · LGPD
        </div>
      </motion.div>
    </section>
  )
}
