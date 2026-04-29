"use client"

import { Layers, FileText, Zap, Shield, Bot, Lock } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

const features = [
  {
    title: "Espaços por área da vida",
    description:
      "Pessoal, trabalho, família, saúde e finanças, cada um com seu próprio contexto. O que é de um Espaço não vaza para o outro.",
    icon: Layers,
  },
  {
    title: "Transcrição com traço de confiança",
    description:
      "Estruture falas em tópicos e tarefas. A revisão fica leve, seja uma reunião, uma consulta médica ou uma conversa em família.",
    icon: FileText,
  },
  {
    title: "Resumos orientados a ação",
    description:
      "Gere o que importa: decisões, próximos passos e responsáveis, sem repetir a conversa inteira. Vale para o comitê e para a rotina de casa.",
    icon: Zap,
  },
  {
    title: "Privacidade por contexto",
    description:
      "Cada Espaço tem isolamento próprio: o que você fala em saúde não aparece em trabalho. Permissão por Espaço, com você no controle.",
    icon: Shield,
  },
  {
    title: "IA que entende o contexto",
    description:
      "Transcrição em tempo real adaptada ao seu Espaço — uma reunião no trabalho soa diferente de uma consulta ou conversa em família.",
    icon: Bot,
  },
  {
    title: "Criptografia de ponta a ponta",
    description:
      "Seus Espaços com dados sensíveis — saúde, finanças — ficam protegidos com cifra moderna. Ninguém acessa além de você.",
    icon: Lock,
  },
]

export function Features() {
  const reduce = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: 0,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  }

  return (
    <section
      id="features"
      className="px-4 py-24 sm:px-6"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2
            id="features-heading"
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Tudo o que você precisa para{" "}
            <span className="gradient-text">não perder o fio</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Voz, texto e tarefa no mesmo lugar — em casa, no trabalho ou na consulta médica.
          </p>
        </div>
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card rounded-[var(--radius-xl)] p-6 transition-colors hover:border-brand/30"
              >
                <div
                  className="inline-flex items-center justify-center rounded-lg bg-brand/15 p-2 text-brand mb-4"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
