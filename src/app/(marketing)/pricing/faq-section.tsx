"use client";

import { useId, useState, type ReactNode } from "react";

type Item = { id: string; q: string; a: ReactNode };

export const faqItens: Item[] = [
  {
    id: "1",
    q: "Preciso de cartão de crédito para começar?",
    a: "Não. O plano Gratuito não pede cartão e você pode usar quanto quiser dentro dos limites de minutos por mês.",
  },
  {
    id: "2",
    q: "Posso mudar de plano depois?",
    a: "Sim. Ao fazer upgrade, a cobrança é proporcional aos dias restantes. Ao fazer downgrade, o crédito vai para o ciclo seguinte.",
  },
  {
    id: "3",
    q: "Os preços são em reais (BRL)?",
    a: "Sim. Todos os valores são em reais brasileiros, com nota fiscal eletrônica emitida automaticamente.",
  },
  {
    id: "4",
    q: "Aceitam Pix, boleto e cartão?",
    a: "Sim. Pix e cartão de crédito (recorrente). Boleto disponível para planos anuais Empresa.",
  },
  {
    id: "5",
    q: "O que acontece quando passo do limite de minutos?",
    a: "Você recebe um aviso aos 80% e 100%. Pode comprar minutos avulsos ou aguardar a virada do ciclo. Nada é cobrado sem confirmação.",
  },
  {
    id: "6",
    q: "Há desconto para uso anual?",
    a: "Sim, 20% de desconto na cobrança anual em todos os planos pagos. Use o seletor mensal/anual no topo da página.",
  },
];

export function FAQ({ itens }: { itens: Item[] }) {
  return (
    <ol className="m-0 space-y-2 p-0">
      {itens.map((i) => (
        <FaqItem key={i.id} it={i} />
      ))}
    </ol>
  );
}

function FaqItem({ it }: { it: Item }) {
  const [o, setO] = useState(false);
  const t = useId();
  return (
    <li className="m-0 list-none rounded-[var(--radius-lg)] border border-border/60 bg-surface-1/60 transition-colors hover:border-brand/30">
      <h3>
        <button
          className="flex w-full min-h-12 items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring rounded-[var(--radius-lg)]"
          type="button"
          onClick={() => setO((x) => !x)}
          aria-expanded={o}
          aria-controls={`${t}-p`}
          id={t}
        >
          {it.q}
          <span className={`text-muted-foreground transition-transform ${o ? "rotate-180" : ""}`} aria-hidden>
            ▾
          </span>
        </button>
      </h3>
      {o ? (
        <div
          className="border-t border-border/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed"
          id={`${t}-p`}
          role="region"
          aria-labelledby={t}
        >
          {it.a}
        </div>
      ) : null}
    </li>
  );
}
