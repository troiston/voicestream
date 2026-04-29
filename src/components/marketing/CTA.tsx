import Link from "next/link"
import { ArrowRight, Mic } from "lucide-react"

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6" aria-labelledby="cta-heading">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-2xl)] p-10 text-center sm:p-16">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 bg-glow-hero" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-30" aria-hidden />
        <div className="absolute inset-0 -z-10 rounded-[var(--radius-2xl)] border border-brand/20" aria-hidden />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 mb-6">
          <Mic className="h-6 w-6 text-brand" aria-hidden />
        </div>
        <h2
          id="cta-heading"
          className="text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          Pronto para pôr voz, texto e tarefa{" "}
          <span className="gradient-text">no mesmo painel?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Crie a sua conta e abra o primeiro Espaço — pessoal, trabalho, família, saúde ou
          finanças. Sem cartão de crédito.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="btn-gradient glow-accent inline-flex items-center gap-2 rounded-[var(--radius-md)] px-8 py-3 text-sm font-semibold transition-all hover:opacity-90"
          >
            <Mic className="h-4 w-4" />
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border/60 bg-surface-1/60 px-8 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-surface-2/60 hover:border-brand/30"
          >
            Ver planos
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground/60">
          Sem cartão de crédito · Cancele quando quiser · LGPD compliant
        </p>
      </div>
    </section>
  )
}
