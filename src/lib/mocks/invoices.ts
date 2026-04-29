export type MockInvoice = {
  id: string;
  date: string;
  amountCents: number;
  currency: string;
  status: "pago" | "em_aberto";
  pdfLabel: string;
};

export const mockInvoices: MockInvoice[] = [
  {
    id: "inv_1",
    date: "2026-04-01",
    amountCents: 2900,
    currency: "BRL",
    status: "pago",
    pdfLabel: "Fatura-2026-04.pdf",
  },
  {
    id: "inv_2",
    date: "2026-03-01",
    amountCents: 2900,
    currency: "BRL",
    status: "pago",
    pdfLabel: "Fatura-2026-03.pdf",
  },
  {
    id: "inv_3",
    date: "2026-02-01",
    amountCents: 2900,
    currency: "BRL",
    status: "pago",
    pdfLabel: "Fatura-2026-02.pdf",
  },
];

export const currentPlan = {
  tier: "pro" as const,
  name: "Pro",
  nextBilling: "2026-05-15",
  usagePct: 62,
};

export type MockPaymentMethod = {
  id: string;
  brand: "visa" | "mastercard";
  last4: string;
  expiryLabel: string;
  isDefault: boolean;
};

export const mockPaymentMethods: MockPaymentMethod[] = [
  {
    id: "pm_1",
    brand: "visa",
    last4: "4242",
    expiryLabel: "12/27",
    isDefault: true,
  },
  {
    id: "pm_2",
    brand: "mastercard",
    last4: "9920",
    expiryLabel: "03/28",
    isDefault: false,
  },
];

/** Linhas para tabela comparativa no diálogo de upgrade (mock). */
export type PlanComparisonRow = {
  label: string;
  pro: string;
  business: string;
};

export const planComparisonRows: PlanComparisonRow[] = [
  { label: "Preço (usuário/mês)", pro: "R$ 29", business: "R$ 79" },
  { label: "Minutos de transcrição", pro: "600 / mês", business: "3 000 / mês" },
  { label: "Espaços", pro: "10", business: "Ilimitado" },
  { label: "Integrações", pro: "5 ativas", business: "Ilimitadas" },
  { label: "SSO / SAML", pro: "—", business: "Incluído" },
  { label: "Suporte", pro: "E-mail (48 h)", business: "Prioritário (4 h)" },
];
