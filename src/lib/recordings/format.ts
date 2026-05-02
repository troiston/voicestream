export type RecordingStatus =
  | "uploaded"
  | "transcribing"
  | "transcribed"
  | "summarizing"
  | "summarized"
  | "failed";

export const RECORDING_STATUS_LABEL: Record<RecordingStatus, string> = {
  uploaded: "Enviado",
  transcribing: "Transcrevendo",
  transcribed: "Transcrito",
  summarizing: "Resumindo",
  summarized: "Resumido",
  failed: "Erro",
};

export const RECORDING_STATUS_TONE: Record<RecordingStatus, "info" | "progress" | "success" | "danger"> = {
  uploaded: "info",
  transcribing: "progress",
  transcribed: "progress",
  summarizing: "progress",
  summarized: "success",
  failed: "danger",
};

export function formatRecordingStatus(status: string): string {
  return RECORDING_STATUS_LABEL[status as RecordingStatus] ?? status;
}
