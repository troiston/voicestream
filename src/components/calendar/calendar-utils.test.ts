import { describe, expect, it } from "vitest";

import {
  buildCalendarEntries,
  buildMonthGrid,
  filterCalendarEntries,
  type CalendarEntry,
} from "./calendar-utils";

describe("calendar-utils", () => {
  it("builds entries from due dates and captured dates", () => {
    const entries = buildCalendarEntries(
      [
        {
          id: "task-1",
          title: "Ajustar pauta",
          description: "Revisar os pontos finais",
          dueAt: "2026-05-02",
          spaceId: "space-1",
          spaceName: "Produto",
          status: "pendente",
          priority: "media",
          kind: "task",
        },
      ],
      [
        {
          id: "rec-1",
          title: "Reunião com cliente",
          capturedAt: "2026-05-02T14:30:00.000Z",
          durationSec: 1800,
          spaceId: "space-2",
          spaceName: "CS",
          kind: "recording",
        },
      ],
    );

    expect(entries).toHaveLength(2);
    expect(entries[0].dateKey).toBe("2026-05-02");
    expect(entries[0].sourceLabel).toBe("Tarefa");
    expect(entries[1].sourceLabel).toBe("Gravação");
  });

  it("filters entries by space and keeps the global view intact", () => {
    const entries: CalendarEntry[] = [
      {
        id: "1",
        kind: "task",
        title: "Tarefa 1",
        description: "Descrição 1",
        spaceId: "space-1",
        spaceName: "Produto",
        dateKey: "2026-05-02",
        sourceLabel: "Tarefa",
        timeLabel: "Dia todo",
        sortStamp: 1,
      },
      {
        id: "2",
        kind: "recording",
        title: "Gravação 2",
        description: "Descrição 2",
        spaceId: "space-2",
        spaceName: "CS",
        dateKey: "2026-05-02",
        sourceLabel: "Gravação",
        timeLabel: "10:00",
        sortStamp: 2,
      },
    ];

    expect(filterCalendarEntries(entries, "all")).toHaveLength(2);
    expect(filterCalendarEntries(entries, "space-1")).toHaveLength(1);
    expect(filterCalendarEntries(entries, "space-1")[0].id).toBe("1");
  });

  it("creates a six-week month grid that starts on sunday", () => {
    const grid = buildMonthGrid(new Date("2026-05-15T12:00:00.000Z"));

    expect(grid).toHaveLength(42);
    expect(grid[0].dateKey).toBe("2026-04-26");
    expect(grid[41].dateKey).toBe("2026-06-06");
  });
});
