import { describe, expect, it } from "vitest";

import { getRecordingStatusView } from "./presentation";

describe("getRecordingStatusView", () => {
  it("maps backend recording states to Portuguese UI labels", () => {
    expect(getRecordingStatusView("uploaded").label).toBe("Enviado");
    expect(getRecordingStatusView("processing").label).toBe("Processando");
    expect(getRecordingStatusView("transcribed").label).toBe("Transcrito");
    expect(getRecordingStatusView("summarized").label).toBe("Resumido");
    expect(getRecordingStatusView("failed").label).toBe("Erro");
  });

  it("uses a neutral fallback for unknown states", () => {
    expect(getRecordingStatusView("queued").label).toBe("queued");
    expect(getRecordingStatusView("queued").tone).toBe("muted");
  });
});
