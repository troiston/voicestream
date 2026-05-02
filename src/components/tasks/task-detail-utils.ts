const RECORDING_EXCERPT_LIMIT = 280;

export function buildRecordingExcerpt(
  summary: string | null | undefined,
  transcript: string | null | undefined,
): string | null {
  const source = (summary?.trim() || transcript?.trim() || "").trim();
  if (!source) {
    return null;
  }

  if (source.length <= RECORDING_EXCERPT_LIMIT) {
    return source;
  }

  return `${source.slice(0, RECORDING_EXCERPT_LIMIT).trimEnd()}…`;
}
