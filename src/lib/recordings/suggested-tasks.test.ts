import { describe, expect, it } from "vitest";

import {
  normalizeSuggestedTask,
  type SuggestedTaskCandidate,
} from "./suggested-tasks";

describe("normalizeSuggestedTask", () => {
  it("keeps 5W2H fields and marks missing assignee as requiring review", () => {
    const candidate: SuggestedTaskCandidate = {
      what: "Enviar proposta revisada",
      why: "Cliente pediu ajustes no preço durante a reunião.",
      who: null,
      when: null,
      where: "Reunião comercial",
      how: "Usar a versão com desconto anual.",
      howMuch: "R$ 2.000",
      priority: "alta",
    };

    const result = normalizeSuggestedTask(candidate, {
      spaceName: "Vendas",
      knownMembers: [],
    });

    expect(result.title).toBe("Enviar proposta revisada");
    expect(result.assigneeStatus).toBe("missing");
    expect(result.canCreate).toBe(false);
    expect(result.fields.howMuch).toBe("R$ 2.000");
  });

  it("matches a spoken assignee name to a known team member", () => {
    const result = normalizeSuggestedTask(
      {
        what: "Atualizar cronograma",
        why: "O plano mudou.",
        who: "Mariana",
        when: "2026-05-10T00:00:00.000Z",
        where: null,
        how: null,
        howMuch: null,
        priority: "media",
      },
      {
        spaceName: "Produto",
        knownMembers: [{ id: "user_1", name: "Mariana Alves" }],
      },
    );

    expect(result.assigneeStatus).toBe("matched");
    expect(result.assigneeUserId).toBe("user_1");
    expect(result.canCreate).toBe(true);
  });
});
