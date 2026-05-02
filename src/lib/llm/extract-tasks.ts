import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "@/lib/env";

const TaskSuggestionSchema = z.object({
  what: z.string(),
  why: z.string().optional(),
  who: z.string().optional(),
  whenText: z.string().optional(),
  whereText: z.string().optional(),
  how: z.string().optional(),
  howMuch: z.string().optional(),
  sourceSnippet: z.string().optional(),
});

const ExtractResultSchema = z.object({ tasks: z.array(TaskSuggestionSchema) });

export type ExtractedTaskSuggestion = z.infer<typeof TaskSuggestionSchema>;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const SYSTEM_PROMPT = `Você é um assistente que identifica TAREFAS acionáveis em uma transcrição de reunião/áudio em português.
Para cada tarefa, extraia em formato 5W2H:
- what (O quê: ação concreta, ex.: "Enviar relatório financeiro").
- why (Por quê: contexto, opcional).
- who (Quem: nome citado como responsável, opcional).
- whenText (Quando: prazo conforme falado, ex.: "até sexta", opcional).
- whereText (Onde: contexto/projeto, opcional).
- how (Como: instrução adicional, opcional).
- howMuch (Quanto: custo/esforço se citado, opcional).
- sourceSnippet (trecho exato da transcrição que originou a tarefa).

Devolva JSON estritamente no formato: { "tasks": [...] }. Se não houver tarefas, retorne { "tasks": [] }.
NÃO invente nomes ou prazos que não estejam na transcrição.`;

export async function extractTaskSuggestions(transcript: string): Promise<ExtractedTaskSuggestion[]> {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: transcript }],
  });
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];
  try {
    const parsed = ExtractResultSchema.parse(JSON.parse(jsonMatch[0]));
    return parsed.tasks;
  } catch {
    return [];
  }
}
