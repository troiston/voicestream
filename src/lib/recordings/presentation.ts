export type RecordingStatusTone = "info" | "warning" | "success" | "danger" | "muted";

export type RecordingStatusView = {
  label: string;
  tone: RecordingStatusTone;
  className: string;
};

const STATUS_VIEW: Record<string, RecordingStatusView> = {
  uploaded: {
    label: "Enviado",
    tone: "info",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  processing: {
    label: "Processando",
    tone: "warning",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  transcribed: {
    label: "Transcrito",
    tone: "success",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  summarized: {
    label: "Resumido",
    tone: "success",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  failed: {
    label: "Erro",
    tone: "danger",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

export function getRecordingStatusView(status: string): RecordingStatusView {
  return (
    STATUS_VIEW[status] ?? {
      label: status,
      tone: "muted",
      className: "bg-surface-2 text-muted-foreground",
    }
  );
}
