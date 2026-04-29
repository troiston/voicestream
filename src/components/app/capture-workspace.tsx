"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Mic } from "lucide-react";

import type { MockCapture } from "@/lib/mocks/captures";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type CapturePhase = "idle" | "recording" | "paused" | "processing" | "done";

export interface CaptureWorkspaceProps {
  history: MockCapture[];
}

const MOCK_TRANSCRIPT_LINES = [
  "Bom dia, vamos começar a reunião de planejamento do Q3.",
  "Precisamos revisar as metas de transcrição e definir os KPIs do próximo trimestre.",
  "Ana, pode nos atualizar sobre o progresso do sistema de IA?",
  "Claro. Estamos em 87% de acurácia nas transcrições em português.",
];

function WaveformVisualizer({ isRecording, reduce }: { isRecording: boolean; reduce: boolean | null }) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0.3));

  useEffect(() => {
    if (!isRecording || reduce) return;

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => 0.1 + Math.random() * 0.9)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, reduce]);

  if (reduce) {
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <motion.span
          className="text-sm font-semibold text-danger"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          ● Gravando…
        </motion.span>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-1 py-8">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-brand to-brand/50"
          initial={{ height: "20%" }}
          animate={{ height: `${20 + height * 60}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          style={{ minHeight: "20px", maxHeight: "60px" }}
        />
      ))}
    </div>
  );
}

function Timer({ isRunning }: { isRunning: boolean }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="text-center">
      <div className="text-4xl font-mono font-bold text-foreground">
        {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>
    </div>
  );
}

export function CaptureWorkspace({ history }: CaptureWorkspaceProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [localHistory, setLocalHistory] = useState<MockCapture[]>([]);

  const mergedHistory = useMemo(() => [...localHistory, ...history], [history, localHistory]);

  const startRecording = useCallback(() => {
    setPhase("recording");
  }, []);

  const pauseRecording = useCallback(() => {
    setPhase("paused");
  }, []);

  const resumeRecording = useCallback(() => {
    setPhase("recording");
  }, []);

  const stopRecording = useCallback(() => {
    setPhase("processing");
    const duration = 3 + Math.floor(Math.random() * 8);
    window.setTimeout(() => {
      setPhase("done");
      setLocalHistory((prev) => [
        {
          id: `cap_${Date.now().toString(36)}`,
          title: `Gravação ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
          at: new Date().toISOString(),
          durationSec: duration,
        },
        ...prev,
      ]);
    }, 900);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Captura de voz</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Interface premium de gravação com transcrição em tempo real (mock). Respeita{" "}
            <span className="whitespace-nowrap">prefers-reduced-motion</span>.
          </p>
        </header>

        <section
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border/60 bg-surface-1 p-8 sm:p-12"
          aria-labelledby="capture-state"
        >
          {phase === "recording" && !reduce && (
            <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] bg-danger/5" aria-hidden />
          )}

          <h2 id="capture-state" className="sr-only">
            Estado da gravação
          </h2>
          <p className="sr-only" data-testid="e2e-capture-phase" data-phase={phase}>
            {phase}
          </p>

          <div className="flex flex-col items-center text-center">
            {/* Recording states */}
            {(phase === "idle" || phase === "done") && (
              <>
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-danger text-white shadow-lg"
                    whileHover={reduce ? undefined : { scale: 1.05 }}
                    whileTap={reduce ? undefined : { scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Mic className="size-8" />
                  </motion.div>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  {phase === "idle"
                    ? "Pressione para começar a capturar"
                    : "Gravação guardada. Pode iniciar outra."}
                </p>
              </>
            )}

            {phase === "recording" && (
              <>
                <WaveformVisualizer isRecording={true} reduce={reduce} />
                <Timer isRunning={true} />
                <p className="mt-4 text-sm text-muted-foreground">Gravação em curso…</p>
              </>
            )}

            {phase === "paused" && (
              <>
                <div className="py-8 text-center">
                  <div className="text-4xl font-mono font-bold text-foreground">pausa</div>
                </div>
                <p className="text-sm text-muted-foreground">Gravação pausada</p>
              </>
            )}

            {phase === "processing" && (
              <>
                <div className="space-y-3 py-8">
                  <Skeleton className="h-6 w-48 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
                <p className="text-sm text-muted-foreground">IA processando transcrição…</p>
              </>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {(phase === "idle" || phase === "done") && (
                <Button
                  type="button"
                  variant="danger"
                  size="lg"
                  className="min-w-48"
                  data-testid="e2e-capture-iniciar"
                  onClick={startRecording}
                >
                  {phase === "idle" ? "Iniciar gravação" : "Nova gravação"}
                </Button>
              )}

              {phase === "recording" && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="min-w-40"
                    onClick={pauseRecording}
                  >
                    Pausar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    className="min-w-40"
                    data-testid="e2e-capture-parar"
                    onClick={stopRecording}
                  >
                    Parar
                  </Button>
                </>
              )}

              {phase === "paused" && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="min-w-40"
                    onClick={resumeRecording}
                  >
                    Retomar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    className="min-w-40"
                    onClick={stopRecording}
                  >
                    Parar
                  </Button>
                </>
              )}

              {phase === "processing" && (
                <Button type="button" variant="secondary" disabled size="lg" className="min-w-40" aria-busy>
                  Aguarde…
                </Button>
              )}

              {phase === "done" && (
                <Button type="button" variant="ghost" onClick={reset}>
                  Repor
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Transcript display when done */}
        {phase === "done" && (
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface-1 p-6">
            <h2 className="text-sm font-semibold text-foreground">Transcrição</h2>
            <div className="mt-4 space-y-3">
              {MOCK_TRANSCRIPT_LINES.map((line, i) => (
                <motion.p
                  key={i}
                  className="text-sm leading-relaxed text-foreground/80"
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                  transition={{
                    delay: reduce ? 0 : i * 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sidebar: Recent captures */}
      <aside
        className="w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 lg:max-w-xs"
        aria-label="Histórico de capturas"
      >
        <div className="border-b border-border/60 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
          <p className="text-xs text-muted-foreground">Sessão atual</p>
        </div>
        <ul className="max-h-[min(70vh,28rem)] space-y-0 overflow-y-auto p-2">
          {mergedHistory.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Sem gravações ainda.
            </li>
          ) : (
            mergedHistory.map((c, i) => (
              <motion.li
                key={c.id}
                className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 px-4 py-3 mb-2 last:mb-0 hover:border-brand/20 hover:bg-surface-2/50 transition-colors"
                initial={reduce ? false : { opacity: 0, x: 8 }}
                animate={reduce ? undefined : { opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 26,
                  delay: reduce ? 0 : Math.min(i * 0.04, 0.2),
                }}
              >
                <p className="text-sm font-medium leading-snug text-foreground">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(c.at).toLocaleString("pt-BR")} · {c.durationSec}s
                </p>
              </motion.li>
            ))
          )}
        </ul>
      </aside>
    </div>
  );
}
