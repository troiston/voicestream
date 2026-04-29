"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "O que é o CloudVoice?",
    answer:
      "O CloudVoice é o seu copiloto de vida: escuta o que importa em cada contexto e transforma fala em memória, decisões e tarefas, organizadas por Espaços. Funciona tanto no trabalho quanto na vida pessoal, família, saúde ou finanças.",
  },
  {
    question: "O que são Espaços?",
    answer:
      "Espaços são áreas da sua vida e contexto — trabalho, pessoal, família, saúde, finanças. Cada um mantém os seus dados isolados, com privacidade e controles próprios. Estruturas como time, cliente ou projeto vivem dentro do Espaço de trabalho; não são uma definição global do produto.",
  },
  {
    question: "Posso começar pequeno e evoluir?",
    answer:
      "Sim. Comece com um Espaço — pessoal ou trabalho — e adicione outros contextos conforme a sua vida pede. Cada Espaço evolui no seu próprio ritmo, sem misturar áreas que não deveriam se cruzar.",
  },
  {
    question: "O que acontece depois do período gratuito?",
    answer:
      "Os seus Espaços e o conteúdo dentro deles continuam acessíveis. Você pode permanecer no plano gratuito com limites ou fazer upgrade para liberar recursos avançados.",
  },
  {
    question: "Como vocês tratam privacidade e segurança?",
    answer:
      "A privacidade é por contexto: cada Espaço tem isolamento de dados, controles de acesso e trilha próprios, então saúde não vaza para trabalho e família não se mistura com finanças. Comunicação criptografada e boas práticas de proteção em todos os Espaços.",
  },
  {
    question: "Posso integrar com outras ferramentas?",
    answer:
      "Sim. CloudVoice oferece integração com calendários, aplicativos de tarefas e plataformas de produtividade. Cada Espaço pode ter suas próprias integrações sem interferir nos outros contextos.",
  },
  {
    question: "A transcrição funciona em português?",
    answer:
      "Sim, CloudVoice foi treinado com modelo de fala otimizado para português brasileiro e europeu. Reconhece tons, sotaques e termos técnicos comuns em cada contexto.",
  },
  {
    question: "Posso compartilhar um Espaço com outras pessoas?",
    answer:
      "Sim, você pode convidar colaboradores para um Espaço específico — por exemplo, um time de trabalho ou um projeto familiar. Cada pessoa vê apenas o que foi concedido de acesso naquele Espaço.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="px-4 py-20 sm:px-6" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <h2
          id="faq-heading"
          className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          Perguntas <span className="gradient-text">frequentes</span>
        </h2>
        <div className="mt-12 divide-y divide-border/60">
          {faqs.map((faq, i) => {
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;
            const expanded = openIndex === i;

            return (
              <div key={faq.question} className="py-5">
                <h3 className="text-base font-medium">
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setOpenIndex(expanded ? null : i)}
                    className="flex w-full items-center justify-between gap-4 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-1 py-1"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                  >
                    <span className="text-sm font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <AnimatePresence mode="wait">
                  {expanded && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={
                        reduce ? { opacity: 1, height: "auto" } : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{
                        duration: reduce ? 0 : 0.3,
                        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                      }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
