import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";

export type CalendarSpaceOption = {
  id: string;
  name: string;
};

export type CalendarTaskSource = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  spaceId: string;
  spaceName: string;
  status: TaskStatus;
  priority: TaskPriority;
  kind: "task";
};

export type CalendarRecordingSource = {
  id: string;
  title: string;
  capturedAt: string;
  durationSec: number;
  spaceId: string;
  spaceName: string;
  kind: "recording";
};

export type CalendarGoogleEventSource = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string | null;
  spaceId: string;
  spaceName: string;
  kind: "google_event";
};

export type CalendarEntry = {
  id: string;
  kind: "task" | "recording" | "google_event";
  title: string;
  description: string;
  spaceId: string;
  spaceName: string;
  dateKey: string;
  sourceLabel: string;
  statusLabel?: string;
  priorityLabel?: string;
  timeLabel: string;
  durationLabel?: string;
  sortStamp: number;
};

export type CalendarDayCell = {
  dateKey: string;
  day: number;
  monthOffset: "prev" | "current" | "next";
  isToday: boolean;
  isTodayMonth: boolean;
};

const MONTH_LABELS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateKeyFromLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDateKeyFromDueDate(value: string): string {
  return value.split("T")[0];
}

function toDateKeyFromInstant(value: string): string {
  const date = new Date(value);
  return toDateKeyFromLocalDate(date);
}

function formatShortTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(durationSec: number): string {
  const minutes = Math.max(1, Math.round(durationSec / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}min` : `${hours}h`;
}

function priorityLabel(priority: TaskPriority): string {
  return priority === "alta" ? "Alta" : priority === "media" ? "Média" : "Baixa";
}

function statusLabel(status: TaskStatus): string {
  return status === "pendente"
    ? "Pendente"
    : status === "em_curso"
      ? "Em curso"
      : status === "concluida"
        ? "Concluída"
        : "Cancelada";
}

export function buildCalendarEntries(
  tasks: ReadonlyArray<CalendarTaskSource>,
  recordings: ReadonlyArray<CalendarRecordingSource>,
  googleEvents: ReadonlyArray<CalendarGoogleEventSource> = [],
): CalendarEntry[] {
  const taskEntries = tasks.map<CalendarEntry>((task) => ({
    id: `task:${task.id}`,
    kind: "task",
    title: task.title,
    description: task.description,
    spaceId: task.spaceId,
    spaceName: task.spaceName,
    dateKey: toDateKeyFromDueDate(task.dueAt),
    sourceLabel: "Tarefa",
    statusLabel: statusLabel(task.status),
    priorityLabel: priorityLabel(task.priority),
    timeLabel: "Dia todo",
    sortStamp: new Date(`${task.dueAt}T00:00:00Z`).getTime(),
  }));

  const recordingEntries = recordings.map<CalendarEntry>((recording) => ({
    id: `recording:${recording.id}`,
    kind: "recording",
    title: recording.title,
    description: `Gravação de ${formatDuration(recording.durationSec)}`,
    spaceId: recording.spaceId,
    spaceName: recording.spaceName,
    dateKey: toDateKeyFromInstant(recording.capturedAt),
    sourceLabel: "Gravação",
    timeLabel: formatShortTime(recording.capturedAt),
    durationLabel: formatDuration(recording.durationSec),
    sortStamp: new Date(recording.capturedAt).getTime(),
  }));

  const googleEntries = googleEvents.map<CalendarEntry>((event) => ({
    id: `google:${event.id}`,
    kind: "google_event",
    title: event.title,
    description: event.description || "Evento importado do Google Calendar.",
    spaceId: event.spaceId,
    spaceName: event.spaceName,
    dateKey: toDateKeyFromInstant(event.startAt),
    sourceLabel: "Google",
    timeLabel: formatShortTime(event.startAt),
    durationLabel: event.endAt ? formatDuration(Math.max(60, Math.round((new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) / 1000))) : undefined,
    sortStamp: new Date(event.startAt).getTime(),
  }));

  return [...taskEntries, ...recordingEntries, ...googleEntries].sort((a, b) => {
    if (a.sortStamp !== b.sortStamp) return a.sortStamp - b.sortStamp;
    if (a.kind !== b.kind) return a.kind === "task" ? -1 : a.kind === "recording" ? 1 : 0;
    return a.title.localeCompare(b.title, "pt-BR");
  });
}

export function filterCalendarEntries(
  entries: ReadonlyArray<CalendarEntry>,
  spaceId: string,
): CalendarEntry[] {
  if (spaceId === "all") {
    return [...entries];
  }
  return entries.filter((entry) => entry.spaceId === spaceId);
}

export function groupCalendarEntriesByDate(entries: ReadonlyArray<CalendarEntry>) {
  const groups = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    const bucket = groups.get(entry.dateKey);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(entry.dateKey, [entry]);
    }
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, items]) => ({
      dateKey,
      items: items.sort((a, b) => a.sortStamp - b.sortStamp || a.title.localeCompare(b.title, "pt-BR")),
    }));
}

export function buildMonthGrid(referenceDate: Date): CalendarDayCell[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const start = new Date(year, month, 1 - startOffset);
  const todayKey = toDateKeyFromLocalDate(new Date());

  const cells: CalendarDayCell[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKeyFromLocalDate(date);
    const cellMonthIndex = date.getFullYear() * 12 + date.getMonth();
    const referenceMonthIndex = year * 12 + month;
    cells.push({
      dateKey,
      day: date.getDate(),
      monthOffset:
        cellMonthIndex < referenceMonthIndex ? "prev" : cellMonthIndex > referenceMonthIndex ? "next" : "current",
      isToday: dateKey === todayKey,
      isTodayMonth: date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear(),
    });
  }

  return cells;
}

export function formatCalendarMonthLabel(date: Date): string {
  const monthName = MONTH_LABELS[date.getMonth()];
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${date.getFullYear()}`;
}

export function formatCalendarDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const day = date.getDate();
  const monthName = MONTH_LABELS[date.getMonth()];
  const weekdayLabel = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;
  return `${weekdayLabel}, ${day} de ${monthName}`;
}

export function countEntriesByKind(entries: ReadonlyArray<CalendarEntry>) {
  return entries.reduce(
    (acc, entry) => {
      acc[entry.kind] += 1;
      return acc;
    },
    { task: 0, recording: 0, google_event: 0 },
  );
}
