import { describe, expect, it } from "vitest";

import { buildRecordingExcerpt } from "./task-detail-utils";

describe("buildRecordingExcerpt", () => {
  it("prefers the recording summary when present", () => {
    expect(
      buildRecordingExcerpt("Resumo curto da reunião", "Trecho da transcrição"),
    ).toBe("Resumo curto da reunião");
  });

  it("falls back to the transcription when summary is missing", () => {
    expect(
      buildRecordingExcerpt(null, "Trecho da transcrição"),
    ).toBe("Trecho da transcrição");
  });

  it("truncates long excerpts", () => {
    const result = buildRecordingExcerpt(null, "a".repeat(400));

    expect(result).toHaveLength(281);
    expect(result?.endsWith("…")).toBe(true);
  });

  it("returns null when there is no source text", () => {
    expect(buildRecordingExcerpt("", "   ")).toBeNull();
  });
});
