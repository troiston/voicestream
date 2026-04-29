"use client"

import { motion, useReducedMotion } from "framer-motion"

const testimonials = [
  {
    quote:
      "Salto entre clientes, propostas e projetos pessoais sem misturar contextos. Cada Espaço guarda só o que importa daquele lado da minha vida.",
    author: "Carolina Mendes",
    role: "Consultora independente",
    company: "Mendes & Associados",
    initials: "CM",
    stars: 5,
  },
  {
    quote:
      "Da consulta do pediatra à reunião da escola, tudo cai no Espaço da família. Quando precisamos lembrar do que foi combinado, está lá — sem ter de remontar a conversa de cabeça.",
    author: "Beatriz e Tiago Soares",
    role: "Casal com dois filhos",
    company: "Piloto em design",
    initials: "BT",
    stars: 5,
  },
  {
    quote:
      "O Espaço de saúde fica criptografado e separado do resto do dia. Consigo registar a consulta sem medo de cruzar dados clínicos com agenda pessoal ou trabalho.",
    author: "Drª Helena Branco",
    role: "Médica de família",
    company: "Clínica Central",
    initials: "HB",
    stars: 5,
  },
  {
    quote:
      "Nas reuniões de gestão, VoiceStream já extrai os pontos-chave automaticamente. Ganhei horas que antes gastava relendo anotações e procurando decisões.",
    author: "Fernando Silva",
    role: "Diretor de Operações",
    company: "Grupo Inovação",
    initials: "FS",
    stars: 5,
  },
  {
    quote:
      "Como terapeuta, a privacidade é tudo. Ter um Espaço dedicado para registar sessões com segurança muda completamente minha confiança em usar a ferramenta.",
    author: "Mariana Costa",
    role: "Psicóloga clínica",
    company: "Consultório Costa",
    initials: "MC",
    stars: 5,
  },
  {
    quote:
      "Trabalho remoto entre fusos horários. VoiceStream me permite gravar síncronos e depois rever nos horários que fazem sentido — com resumos prontos.",
    author: "Lucas Oliveira",
    role: "Engenheiro de software",
    company: "TechGlobal",
    initials: "LO",
    stars: 5,
  },
] as const;

export function Testimonials() {
  const reduce = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
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
      className="px-4 py-24 sm:px-6"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="testimonials-heading"
          className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          Para quem vive{" "}
          <span className="gradient-text">vários contextos</span>
        </h2>
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3 items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.author}
              variants={itemVariants}
              className="glass-card flex flex-col rounded-[var(--radius-xl)] p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 text-sm font-semibold text-brand">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.author}</p>
                  <p className="text-xs text-muted-foreground/70 truncate">{t.company}</p>
                </div>
              </div>
              <blockquote className="grow mb-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <div className="border-t border-border/40 pt-4">
                <div className="text-warning text-xs mb-2">
                  {"★".repeat(t.stars)}
                </div>
                <p className="text-xs text-muted-foreground/70">{t.role}</p>
              </div>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
