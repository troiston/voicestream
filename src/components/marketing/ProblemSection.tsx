"use client"

import { X, Check } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

const problems = [
  {
    title: "A consulta acabou, o que ficou combinado some",
    description:
      "Orientações do médico, dose do remédio, próximo exame. No dia seguinte, ninguém em casa lembra direito.",
  },
  {
    title: "Trabalho, família e saúde no mesmo caderno",
    description:
      "Tudo se mistura em notas avulsas e mensagens. O que era da reunião vaza para a rotina pessoal e vice-versa.",
  },
  {
    title: "Transcrição sem ação é mais um arquivo solto",
    description:
      "Ferramentas devolvem o texto, mas falta o que fazer com ele — decisões, tarefas e prazos ficam mudos no armazenamento.",
  },
]

const solutions = [
  {
    title: "Memória estruturada por Espaço",
    description:
      "CloudVoice extrai automaticamente o que importa de cada conversa — orientações, combinados, próximos passos — organizados por contexto.",
  },
  {
    title: "Isolamento de dados com privacidade",
    description:
      "Cada Espaço tem seu próprio contexto isolado. Saúde não vaza para trabalho, família não se mistura com finanças. Você no controle total.",
  },
  {
    title: "De transcrição a ação em um só lugar",
    description:
      "CloudVoice gera resumos, extrai decisões e cria tarefas. Tudo pronto para você agir — em reunião, na consulta, em casa.",
  },
]

export function ProblemSection() {
  const reduce = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
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
    <section className="px-4 py-24 sm:px-6" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-6xl">
        <h2
          id="problem-heading"
          className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          A vida fala o tempo todo —{" "}
          <span className="gradient-text">a memória não dá conta sozinha</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          CloudVoice grava, transcreve, resume e aterra em ações por Espaço, com privacidade
          separada entre vida pessoal, família, saúde e trabalho.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:gap-12">
          {/* Problems column */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-center sm:text-left">
              Antes: O que faltava
            </h3>
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {problems.map((problem) => (
                <motion.article
                  key={problem.title}
                  variants={itemVariants}
                  className="glass-card rounded-[var(--radius-xl)] p-5 border-danger/30 bg-danger/5"
                >
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 shrink-0 text-danger mt-0.5" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{problem.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>

          {/* Solutions column */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-center sm:text-left">
              Depois: O que CloudVoice oferece
            </h3>
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {solutions.map((solution) => (
                <motion.article
                  key={solution.title}
                  variants={itemVariants}
                  className="glass-card rounded-[var(--radius-xl)] p-5 border-success/30 bg-success/5"
                >
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-success mt-0.5" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{solution.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
