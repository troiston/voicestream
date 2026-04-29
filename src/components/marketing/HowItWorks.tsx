"use client"

import { Layers, Mic, Zap, CheckCircle2 } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

const steps = [
  {
    step: "01",
    title: "Crie um Espaço",
    description:
      "Defina o contexto: trabalho, família, saúde, finanças ou pessoal. Cada Espaço guarda sua própria história, separada das outras.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Capture a conversa",
    description:
      "Grave ou importe áudio, com consentimento explícito. O resumo entra automaticamente no Espaço certo.",
    icon: Mic,
  },
  {
    step: "03",
    title: "Processe com contexto",
    description:
      "Transcrição, destaques e tarefas passam a compartilhar a mesma narrativa, sem trocar de aplicação.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Aja em cima das decisões",
    description:
      "Use o que foi acordado — em reunião, na consulta ou em casa. A memória fica sólida, pronta para virar próximo passo.",
    icon: CheckCircle2,
  },
] as const

export function HowItWorks() {
  const reduce = useReducedMotion()

  return (
    <section
      id="how-it-works"
      className="px-4 py-24 sm:px-6"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2
            id="how-heading"
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            De captação a contexto,{" "}
            <span className="gradient-text">em quatro passos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Sem verbosidade — fala do produto real.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-4 relative">
          {/* Horizontal connector line (desktop only) */}
          <div
            className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20 hidden sm:block"
            style={{ height: "1px" }}
            aria-hidden
          />

          {steps.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.step}
                initial={reduce ? undefined : { opacity: 0, y: 16 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: reduce ? 0 : i * 0.1,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand bg-surface-1">
                      <span className="text-4xl font-black text-brand/20">{item.step}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand" aria-hidden />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
