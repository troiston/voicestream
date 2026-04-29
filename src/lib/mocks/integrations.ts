export type IntegrationConnectionStatus = "connected" | "available";

export type MockIntegration = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationConnectionStatus;
  /** Texto curto para o modal (mock) */
  detail: string;
};

export const MOCK_INTEGRATIONS: MockIntegration[] = [
  {
    id: "int_google_calendar",
    name: "Google Calendar",
    description: "Sincronize reuniões e lembretes com o seu calendário.",
    category: "Calendário",
    status: "connected",
    detail:
      "Ligação ativa (mock). Os eventos criados no CloudVoice aparecem no Google Calendar com privacidade «Ocupado» por defeito.",
  },
  {
    id: "int_slack",
    name: "Slack",
    description: "Envie resumos e clips para canais ou mensagens diretas.",
    category: "Comunicação",
    status: "available",
    detail:
      "Permite publicar resumos automáticos após cada reunião. Requer permissão de publicação no workspace (simulação).",
  },
  {
    id: "int_notion",
    name: "Notion",
    description: "Exporte transcrições e tarefas para bases e páginas.",
    category: "Produtividade",
    status: "available",
    detail: "Mapeia Espaços CloudVoice para bases Notion e mantém blocos sincronizados (mock de UI).",
  },
  {
    id: "int_microsoft_teams",
    name: "Microsoft Teams",
    description: "Importe gravações e presenças das reuniões Teams.",
    category: "Comunicação",
    status: "available",
    detail: "Integração prevista para tenants Microsoft 365 com consentimento administrativo.",
  },
  {
    id: "int_hubspot",
    name: "HubSpot",
    description: "Associe conversas a negócios e contactos CRM.",
    category: "CRM",
    status: "connected",
    detail: "Conta de demonstração ligada. Sincronização unidirecional CloudVoice → HubSpot (mock).",
  },
  {
    id: "int_zapier",
    name: "Zapier",
    description: "Automatize fluxos com milhares de apps.",
    category: "Automação",
    status: "available",
    detail: "Use webhooks e triggers para encadear ações após nova transcrição ou tarefa concluída.",
  },
];
