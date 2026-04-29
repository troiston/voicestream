export type MockCapture = {
  id: string;
  title: string;
  at: string;
  durationSec: number;
};

export const mockCaptureHistory: MockCapture[] = [
  { id: "cap_1", title: "Notas rápidas — ideias produto", at: "2026-04-24T14:20:00.000Z", durationSec: 42 },
  { id: "cap_2", title: "Reunião stand-up (resumo)", at: "2026-04-23T09:05:00.000Z", durationSec: 180 },
  { id: "cap_3", title: "Lista de tarefas semanal", at: "2026-04-22T18:40:00.000Z", durationSec: 65 },
];
