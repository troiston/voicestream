"use client";

import { useRef, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

import { formatRecordingStatus, RECORDING_STATUS_TONE } from "@/lib/recordings/format";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateRecordingTitle } from "@/features/recordings/actions";
import { SuggestedTasksList } from "@/components/recordings/suggested-tasks-list";

// ─── Types ───────────────────────────────────────────────────────────────────

type Segment = {
  id: string;
  speaker: string | null;
  startMs: number;
  endMs: number;
  text: string;
};

type Suggestion = {
  id: string;
  what: string;
  why: string | null;
  who: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeMatch: string;
  whenText: string | null;
  whenDate: string | null;
  whereText: string | null;
  how: string | null;
  howMuch: string | null;
  sourceSnippet: string | null;
  status: string;
  createdTaskId: string | null;
};

type RecordingProps = {
  id: string;
  title: string | null;
  capturedAt: string;
  durationSec: number;
  status: string;
  errorMessage: string | null;
  spaceId: string;
  spaceName: string;
  transcript: string | null;
  transcriptSegments: Segment[];
  topicalSummary: string | null;
  summary: string | null;
  decisions: string[];
  nextSteps: string[];
  suggestions: Suggestion[];
};

type SpaceMember = { id: string; name: string };

type Props = {
  recording: RecordingProps;
  spaceMembers: SpaceMember[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTimestamp(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function defaultTitle(capturedAt: string): string {
  const date = new Date(capturedAt);
  return `Gravação de ${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function statusBadgeVariant(tone: string): "default" | "secondary" | "outline" | "destructive" {
  if (tone === "danger") return "destructive";
  if (tone === "success") return "default";
  return "secondary";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecordingDetail({ recording, spaceMembers }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [title, setTitle] = useState(recording.title ?? "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const tone = RECORDING_STATUS_TONE[recording.status as keyof typeof RECORDING_STATUS_TONE] ?? "info";
  const statusLabel = formatRecordingStatus(recording.status);

  const handleTitleBlur = useCallback(async () => {
    setIsSavingTitle(true);
    await updateRecordingTitle(recording.id, title);
    setIsSavingTitle(false);
  }, [recording.id, title]);

  const handleSegmentClick = (startMs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startMs / 1000;
      void audioRef.current.play();
    }
  };

  const handleRetry = async () => {
    await fetch(`/api/recordings/${recording.id}/retry`, { method: "POST" });
    window.location.reload();
  };

  const hasTranscript = recording.status === "transcribed" || recording.status === "summarized";

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            type="text"
            value={title || defaultTitle(recording.capturedAt)}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            disabled={isSavingTitle}
            className="flex-1 text-2xl font-bold bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors py-1"
            aria-label="Título da gravação"
          />
          <Badge variant={statusBadgeVariant(tone)}>{statusLabel}</Badge>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{recording.spaceName}</span>
          <span>·</span>
          <span>{formatRelativeDate(recording.capturedAt)}</span>
          <span>·</span>
          <span>{formatDuration(recording.durationSec)}</span>
        </div>

        {recording.status === "failed" && (
          <Alert variant="danger" className="mt-3">
            <AlertTriangle className="size-4" />
            <AlertDescription>
              <span className="mr-3">{recording.errorMessage ?? "Erro desconhecido no processamento."}</span>
              <Button size="sm" variant="outline" onClick={handleRetry}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Audio player */}
      <div className="rounded-lg border bg-surface-1 p-4">
        <audio
          ref={audioRef}
          src={`/api/recordings/${recording.id}/stream`}
          controls
          preload="metadata"
          className="w-full"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transcript">
        <TabsList>
          <TabsTrigger value="transcript">Transcrição</TabsTrigger>
          <TabsTrigger value="summary">Resumo rápido</TabsTrigger>
          <TabsTrigger value="detailed">Resumo detalhado</TabsTrigger>
          <TabsTrigger value="decisions">Decisões</TabsTrigger>
          <TabsTrigger value="nextsteps">Próximos passos</TabsTrigger>
          <TabsTrigger value="suggestions">Tarefas sugeridas</TabsTrigger>
        </TabsList>

        {/* Transcrição */}
        <TabsContent value="transcript" className="mt-4">
          {!hasTranscript ? (
            <p className="text-muted-foreground text-sm">Transcrição será gerada após o processamento.</p>
          ) : recording.transcriptSegments.length > 0 ? (
            <div className="space-y-2">
              {recording.transcriptSegments.map((seg) => (
                <div key={seg.id} className="flex gap-3 text-sm group">
                  <button
                    type="button"
                    onClick={() => handleSegmentClick(seg.startMs)}
                    className="shrink-0 font-mono text-xs text-muted-foreground hover:text-primary transition-colors pt-0.5 min-w-[3.5rem]"
                    title="Ir para este trecho"
                  >
                    {formatTimestamp(seg.startMs)}
                  </button>
                  {seg.speaker && (
                    <span className="shrink-0 font-semibold text-foreground/70 min-w-[5rem] truncate">
                      {seg.speaker}
                    </span>
                  )}
                  <span className="text-foreground/90 leading-relaxed">{seg.text}</span>
                </div>
              ))}
            </div>
          ) : recording.transcript ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {recording.transcript}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma transcrição disponível.</p>
          )}
        </TabsContent>

        {/* Resumo rápido */}
        <TabsContent value="summary" className="mt-4">
          {recording.summary ? (
            <div className="prose prose-sm max-w-none text-foreground/90">
              <p>{recording.summary}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Resumo será gerado após a transcrição.</p>
          )}
        </TabsContent>

        {/* Resumo detalhado */}
        <TabsContent value="detailed" className="mt-4">
          {recording.topicalSummary ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {recording.topicalSummary}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Resumo detalhado será gerado após a transcrição.</p>
          )}
        </TabsContent>

        {/* Decisões */}
        <TabsContent value="decisions" className="mt-4">
          {recording.decisions.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside text-sm text-foreground/90">
              {recording.decisions.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma decisão identificada.</p>
          )}
        </TabsContent>

        {/* Próximos passos */}
        <TabsContent value="nextsteps" className="mt-4">
          {recording.nextSteps.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside text-sm text-foreground/90">
              {recording.nextSteps.map((ns, i) => (
                <li key={i}>{ns}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum próximo passo identificado.</p>
          )}
        </TabsContent>

        {/* Tarefas sugeridas */}
        <TabsContent value="suggestions" className="mt-4">
          <SuggestedTasksList
            recordingId={recording.id}
            suggestions={recording.suggestions}
            spaceMembers={spaceMembers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
