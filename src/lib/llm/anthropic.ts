import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const MODEL_DEFAULT = "claude-sonnet-4-6";

export type ExtractedTask = {
  title: string;
  description: string;
  what: string;
  why: string | null;
  who: string | null;
  when: string | null;
  where: string | null;
  how: string | null;
  howMuch: string | null;
  transcriptQuote: string | null;
  priority: "baixa" | "media" | "alta";
  dueAt: string | null;
};

export type SummarizationResult = {
  title: string;
  abstract: string;
  decisions: string[];
  nextSteps: string[];
  tasks: ExtractedTask[];
  model: string;
  tokensInput: number;
  tokensOutput: number;
};

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const SYSTEM_PROMPT = `Você é um assistente especializado em analisar transcrições de reuniões e conversas em português do Brasil (pt-BR). Sua tarefa é processar a transcrição fornecida pelo usuário e extrair, de forma estruturada e fiel ao conteúdo:

1. **title**: um título curto para a gravação, em até 8 palavras, descrevendo o tema principal. Não use "Sem título" e não invente contexto que não esteja na transcrição.

2. **abstract**: um resumo curto e objetivo da conversa, com 2 a 4 frases. Capture o tema central, o contexto e o desfecho principal. Não invente informações.

3. **decisions**: uma lista de decisões concretas tomadas durante a conversa. Cada item é uma frase clara e auto-contida descrevendo o que foi decidido. Se não houver decisões explícitas, retorne um array vazio.

4. **nextSteps**: uma lista de próximos passos ou ações combinadas que NÃO possuem um dono/responsável claramente identificado na conversa. Cada item é uma frase descrevendo a ação. Se não houver, retorne array vazio.

5. **tasks**: uma lista de tarefas candidatas no estilo 5W2H. Não invente dados. Cada tarefa contém:
   - **title**: título curto e acionável (idealmente começando com um verbo no infinitivo).
   - **description**: descrição detalhada incluindo o responsável e o contexto necessário para executar.
   - **what**: o que precisa ser feito.
   - **why**: por que isso precisa ser feito, ou null.
   - **who**: pessoa citada como responsável, ou null se não estiver claro.
   - **when**: prazo em ISO 8601 quando houver data clara, ou null.
   - **where**: contexto/espaço/projeto/reunião citado, ou null.
   - **how**: instrução ou modo de execução citado, ou null.
   - **howMuch**: custo, esforço, quantidade ou valor citado, ou null.
   - **transcriptQuote**: trecho curto da transcrição que justifica a tarefa, ou null.
   - **priority**: "baixa", "media" ou "alta". Use "alta" para itens urgentes/bloqueantes ou explicitamente marcados como prioritários; "baixa" para itens secundários; "media" no resto.
   - **dueAt**: prazo em formato ISO 8601 (ex: "2026-05-15T00:00:00.000Z") quando houver data clara na conversa, ou null caso contrário. Não invente datas.

Regras importantes:
- Responda SEMPRE chamando a ferramenta \`record_summary\` com os campos preenchidos. Não escreva texto livre.
- Seja fiel à transcrição: não adicione interpretações, suposições ou conteúdo que não esteja presente.
- Use português do Brasil em todas as strings de saída.
- Se a transcrição tiver falantes identificados (ex: "João: ..."), use os nomes ao atribuir responsáveis nas tasks.
- Se a transcrição for muito curta, vazia ou sem conteúdo útil, retorne abstract descrevendo isso e arrays vazios para os demais campos.`;

const RECORD_SUMMARY_TOOL: Anthropic.Tool = {
  name: "record_summary",
  description:
    "Registra o resumo estruturado da transcrição com decisões, próximos passos e tarefas extraídas.",
  input_schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Título curto para a gravação, até 8 palavras.",
      },
      abstract: {
        type: "string",
        description: "Resumo curto da conversa (2 a 4 frases) em pt-BR.",
      },
      decisions: {
        type: "array",
        items: { type: "string" },
        description: "Decisões tomadas durante a conversa.",
      },
      nextSteps: {
        type: "array",
        items: { type: "string" },
        description: "Próximos passos sem dono específico.",
      },
      tasks: {
        type: "array",
        description: "Tarefas com responsável claramente identificado.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            what: { type: "string" },
            why: { type: ["string", "null"] },
            who: { type: ["string", "null"] },
            when: { type: ["string", "null"] },
            where: { type: ["string", "null"] },
            how: { type: ["string", "null"] },
            howMuch: { type: ["string", "null"] },
            transcriptQuote: { type: ["string", "null"] },
            priority: { type: "string", enum: ["baixa", "media", "alta"] },
            dueAt: {
              type: ["string", "null"],
              description:
                "Prazo em ISO 8601 (ex.: 2026-05-15T00:00:00.000Z) ou null.",
            },
          },
          required: [
            "title",
            "description",
            "what",
            "why",
            "who",
            "when",
            "where",
            "how",
            "howMuch",
            "transcriptQuote",
            "priority",
            "dueAt",
          ],
        },
      },
    },
    required: ["title", "abstract", "decisions", "nextSteps", "tasks"],
  },
};

export async function summarizeAndExtract(
  transcript: string,
  opts?: { language?: string; model?: string }
): Promise<SummarizationResult> {
  const client = getClient();
  const model = opts?.model ?? MODEL_DEFAULT;
  const language = opts?.language ?? "pt-BR";

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [RECORD_SUMMARY_TOOL],
    tool_choice: { type: "tool", name: "record_summary" },
    messages: [
      {
        role: "user",
        content: `Idioma da transcrição: ${language}\n\nTranscrição:\n"""\n${transcript}\n"""`,
      },
    ],
  });

  const tokensInput = response.usage.input_tokens ?? 0;
  const tokensOutput = response.usage.output_tokens ?? 0;

  logger.info(
    {
      model,
      tokensInput,
      tokensOutput,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
      cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
    },
    "[anthropic.summarizeAndExtract] usage"
  );

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === "tool_use" && block.name === "record_summary"
  );

  if (!toolUse) {
    throw new Error("LLM did not return summary tool call");
  }

  const input = toolUse.input as {
    abstract?: unknown;
    title?: unknown;
    decisions?: unknown;
    nextSteps?: unknown;
    tasks?: unknown;
  };

  const abstract = typeof input.abstract === "string" ? input.abstract : "";
  const title =
    typeof input.title === "string" && input.title.trim().length > 0
      ? input.title.trim().slice(0, 120)
      : "Resumo da gravação";
  const decisions = Array.isArray(input.decisions)
    ? (input.decisions.filter((d) => typeof d === "string") as string[])
    : [];
  const nextSteps = Array.isArray(input.nextSteps)
    ? (input.nextSteps.filter((s) => typeof s === "string") as string[])
    : [];
  const tasks: ExtractedTask[] = Array.isArray(input.tasks)
    ? (input.tasks as unknown[])
        .map((t) => {
          if (!t || typeof t !== "object") return null;
          const obj = t as Record<string, unknown>;
          const title = typeof obj.title === "string" ? obj.title : "";
          const description =
            typeof obj.description === "string" ? obj.description : "";
          const what = typeof obj.what === "string" ? obj.what : title;
          const nullable = (value: unknown) =>
            typeof value === "string" && value.trim().length > 0 ? value : null;
          const priorityRaw =
            typeof obj.priority === "string" ? obj.priority : "media";
          const priority: ExtractedTask["priority"] =
            priorityRaw === "baixa" ||
            priorityRaw === "media" ||
            priorityRaw === "alta"
              ? priorityRaw
              : "media";
          const dueAt =
            typeof obj.dueAt === "string" && obj.dueAt.length > 0
              ? obj.dueAt
              : null;
          if (!title) return null;
          return {
            title,
            description,
            what,
            why: nullable(obj.why),
            who: nullable(obj.who),
            when: nullable(obj.when) ?? dueAt,
            where: nullable(obj.where),
            how: nullable(obj.how),
            howMuch: nullable(obj.howMuch),
            transcriptQuote: nullable(obj.transcriptQuote),
            priority,
            dueAt,
          };
        })
        .filter((t): t is ExtractedTask => t !== null)
    : [];

  return {
    title,
    abstract,
    decisions,
    nextSteps,
    tasks,
    model,
    tokensInput,
    tokensOutput,
  };
}
