"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, Square, CheckCircle, XCircle, Loader2 } from "lucide-react";

export type RecorderClientProps = {
  spaceId: string;
  spaceName: string;
  onCompleted?: (recordingId: string) => void;
};

type Phase =
  | "idle"
  | "recording"
  | "uploading"
  | "registering"
  | "done"
  | "error";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function RecorderClient({
  spaceId,
  spaceName,
  onCompleted,
}: RecorderClientProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blobsRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>("audio/webm");
  const historyRef = useRef<number[][]>([]);

  // Check MediaRecorder support
  const isSupported =
    typeof window !== "undefined" && typeof MediaRecorder !== "undefined";

  // Waveform animation loop — modulador simétrico baseado em amplitude (RMS por
  // slice do sinal PCM no domínio do tempo). Lados esquerdo e direito espelham
  // a partir do centro, ambos reagindo igualmente à voz.
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalBars = 41;
    const half = (totalBars - 1) / 2;
    const sliceSize = Math.floor(bufferLength / totalBars);
    const gap = 2;
    const barWidth = canvas.width / totalBars - gap;

    // Calcula RMS por slice (amplitude do som naquele instante).
    const amplitudes: number[] = new Array(totalBars);

    // Calcula RMS bruto para cada slice.
    const rawAmplitudes: number[] = new Array(totalBars);
    for (let i = 0; i < totalBars; i++) {
      let sumSq = 0;
      for (let j = 0; j < sliceSize; j++) {
        const sample = (dataArray[i * sliceSize + j] - 128) / 128;
        sumSq += sample * sample;
      }
      const rms = Math.sqrt(sumSq / sliceSize);
      rawAmplitudes[i] = Math.min(1, rms * 2.2);
    }

    // Média móvel deslizante (janela N=5 frames).
    historyRef.current.push([...rawAmplitudes]);
    if (historyRef.current.length > 5) historyRef.current.shift();
    const N = historyRef.current.length;
    for (let i = 0; i < totalBars; i++) {
      let sum = 0;
      for (const frame of historyRef.current) sum += frame[i];
      amplitudes[i] = sum / N;
    }

    // Espelha em volta do centro: barra `i` usa max entre amplitude `i` e seu
    // espelho — garante simetria perfeita reagindo à voz.
    for (let i = 0; i < totalBars; i++) {
      const distFromCenter = Math.abs(i - half) / half;
      const mirrored = Math.max(amplitudes[i], amplitudes[totalBars - 1 - i]);
      // Atenua extremos pra dar shape de "barril" focado na voz.
      const shape = 1 - distFromCenter * 0.35;
      const value = mirrored * shape;
      const barHeight = Math.max(4, value * canvas.height);
      const x = i * (barWidth + gap);
      const y = (canvas.height - barHeight) / 2;

      const alpha = 0.45 + value * 0.55;
      ctx.fillStyle = `oklch(65% 0.25 275 / ${alpha})`;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  // Cleanup helper
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      // Determine supported mimeType
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      mimeTypeRef.current = mimeType;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      blobsRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) blobsRef.current.push(e.data);
      };

      recorder.onstart = () => {
        startedAtRef.current = Date.now();
        historyRef.current = [];
        setElapsed(0);
        setPhase("recording");

        timerRef.current = setInterval(() => {
          setElapsed(Date.now() - startedAtRef.current);
        }, 100);

        rafRef.current = requestAnimationFrame(drawWaveform);
      };

      recorder.onerror = () => {
        cleanup();
        setErrorMsg("Erro no MediaRecorder. Tente novamente.");
        setPhase("error");
      };

      recorder.start(250);
    } catch (err: unknown) {
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        setErrorMsg(
          "Permissão de microfone negada — habilite nas configurações do navegador."
        );
      } else {
        setErrorMsg(
          err instanceof Error ? err.message : "Falha ao acessar microfone."
        );
      }
      setPhase("error");
    }
  }, [cleanup, drawWaveform]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    // Stop the recorder and wait for it to finish
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    // Cleanup timer and animation
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
    if (durationSec < 1) {
      setErrorMsg("Gravação muito curta. Tente novamente.");
      setPhase("error");
      return;
    }

    const mimeType = mimeTypeRef.current;
    const blob = new Blob(blobsRef.current, { type: mimeType });
    const capturedAt = new Date(startedAtRef.current).toISOString();

    try {
      setPhase("uploading");
      setUploadProgress(0);

      // Presign
      const presignRes = await fetch("/api/recordings/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ spaceId, contentType: mimeType, durationSec }),
      });
      if (!presignRes.ok) {
        const text = await presignRes.text();
        throw new Error(`Falha ao obter URL de upload: ${text}`);
      }
      const { uploadUrl, storageKey } = (await presignRes.json()) as {
        uploadUrl: string;
        storageKey: string;
        expiresInSec: number;
      };

      // Upload via fetch (no XHR progress for simplicity)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: blob,
      });
      if (!uploadRes.ok) {
        throw new Error(`Falha no upload: ${uploadRes.statusText}`);
      }
      setUploadProgress(100);

      // Register
      setPhase("registering");
      const registerRes = await fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          spaceId,
          storageKey,
          durationSec,
          mimeType,
          capturedAt,
          title: null,
        }),
      });
      if (!registerRes.ok) {
        const text = await registerRes.text();
        throw new Error(`Falha ao registrar gravação: ${text}`);
      }
      const { id } = (await registerRes.json()) as { id: string; status: string };

      onCompleted?.(id);
      setPhase("done");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Erro desconhecido."
      );
      setPhase("error");
    }
  }, [spaceId, onCompleted]);

  const reset = useCallback(() => {
    blobsRef.current = [];
    setElapsed(0);
    setUploadProgress(0);
    setErrorMsg("");
    setPhase("idle");
  }, []);

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-muted-foreground text-sm">
          Seu navegador não suporta gravação de áudio.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[320px] p-8">
      {phase === "idle" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            onClick={startRecording}
            className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] font-semibold text-sm"
          >
            <Mic className="w-5 h-5" />
            Iniciar gravação
          </button>
          <p className="text-muted-foreground text-xs max-w-xs">
            Será solicitada permissão de microfone ao iniciar.
          </p>
        </div>
      )}

      {phase === "recording" && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {spaceName}
          </p>
          <span className="text-5xl font-mono font-bold text-foreground tabular-nums">
            {formatTime(elapsed)}
          </span>
          <canvas
            ref={canvasRef}
            width={320}
            height={80}
            className="w-full rounded-[var(--radius-lg)] bg-surface-1 border border-border/60"
          />
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Square className="w-4 h-4 fill-white" />
            Parar
          </button>
        </div>
      )}

      {phase === "uploading" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-foreground animate-spin" />
          <p className="text-sm font-medium text-foreground">Enviando áudio...</p>
          {uploadProgress > 0 && (
            <div className="w-48 h-1.5 bg-surface-1 border border-border/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {phase === "registering" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-foreground animate-spin" />
          <p className="text-sm font-medium text-foreground">
            Registrando gravação...
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <p className="text-base font-semibold text-foreground">
            Gravação salva!
          </p>
          <button
            onClick={reset}
            className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] font-semibold text-sm"
          >
            <Mic className="w-4 h-4" />
            Gravar outra
          </button>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="w-12 h-12 text-red-500" />
          <p className="text-sm text-red-500 max-w-xs">{errorMsg}</p>
          <button
            onClick={reset}
            className="btn-gradient flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-lg)] font-semibold text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
