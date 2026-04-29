import type { Metadata } from "next";

import { MOCK_TASKS } from "@/lib/mocks/tasks";
import { TasksView } from "@/components/tasks/tasks-view";

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Lista, filtros e criação de tarefas (dados mock).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Gestão local com dados de demonstração. Utilize filtros, alterne entre tabela e cartões e crie
          tarefas através do painel lateral — validação com Zod no servidor (mock).
        </p>
      </header>
      <TasksView initialTasks={MOCK_TASKS} />
    </div>
  );
}
