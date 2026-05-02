"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { RecorderClient } from "@/components/capture/recorder-client";
import { getRecordingStatusView } from "@/lib/recordings/presentation";
import type { CaptureHistoryItem } from "@/types/domain";

export interface CaptureSpace {
  id: string;
  name: string;
  kind: string;
}

export interface CaptureWorkspaceProps {
  spaces: CaptureSpace[];
  history: CaptureHistoryItem[];
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d atrás`;
}

export function CaptureWorkspace({ spaces, history }: CaptureWorkspaceProps) {
  const router = useRouter();
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    spaces[0]?.id ?? ""
  );

  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId) ?? spaces[0];

  function handleCompleted() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main column */}
      <div className="min-w-0 flex-1 space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Captura de voz</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Grave áudio e envie para processamento. Selecione o espaço antes de iniciar.
          </p>
        </header>

        {/* Space selector */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="space-select"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Espaço
          </label>
          <select
            id="space-select"
            value={selectedSpaceId}
            onChange={(e) => setSelectedSpaceId(e.target.value)}
            className="w-full max-w-xs rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Recorder */}
        <section
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border/60 bg-surface-1"
          aria-label="Gravador"
        >
          {selectedSpace ? (
            <RecorderClient
              spaceId={selectedSpace.id}
              spaceName={selectedSpace.name}
              onCompleted={handleCompleted}
            />
          ) : null}
        </section>
      </div>

      {/* Sidebar: history */}
      <aside
        className="w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 lg:max-w-xs"
        aria-label="Histórico de gravações"
      >
        <div className="border-b border-border/60 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
          <p className="text-xs text-muted-foreground">Últimas 20 gravações</p>
        </div>
        <ul className="max-h-[min(70vh,28rem)] space-y-0 overflow-y-auto p-2">
          {history.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Sem gravações ainda.
            </li>
          ) : (
            history.map((item) => {
              const status = getRecordingStatusView(item.status);
              return (
                <li
                  key={item.id}
                  className="mb-2 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 px-4 py-3 transition-colors last:mb-0 hover:border-brand/20 hover:bg-surface-2/50"
                >
                  <Link
                    href={`/spaces/${item.spaceId}?recording=${item.id}`}
                    className="block text-sm font-medium leading-snug text-foreground hover:text-brand"
                  >
                    {item.title ?? "Título em processamento"}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.spaceName} · {relativeTime(item.capturedAt)} · {formatDuration(item.durationSec)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <Link
                      href={`/spaces/${item.spaceId}?recording=${item.id}`}
                      className="text-[11px] font-medium text-brand hover:underline"
                    >
                      Ver transcrição
                    </Link>
                  </div>
                  {item.status === "failed" && item.errorMessage && (
                    <p className="mt-2 rounded-[var(--radius-md)] border border-danger/20 bg-danger/10 px-2 py-1.5 text-xs leading-relaxed text-danger">
                      {item.errorMessage}
                    </p>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </aside>
    </div>
  );
}
