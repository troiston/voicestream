"use client";

import { useState } from "react";
import { ShieldCheck, Copy, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { startTwoFactorEnrollment, verifyTwoFactorCode } from "@/features/two-factor/actions";

type Step = "intro" | "qr" | "backup";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after successful enrollment so parent can refresh state */
  onEnrolled: () => void;
}

function extractSecret(totpURI: string): string {
  try {
    const url = new URL(totpURI);
    return url.searchParams.get("secret") ?? totpURI;
  } catch {
    return totpURI;
  }
}

export function TwoFactorEnrollmentDialog({ open, onOpenChange, onEnrolled }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const secret = totpURI ? extractSecret(totpURI) : "";

  function reset() {
    setStep("intro");
    setPassword("");
    setTotpURI("");
    setBackupCodes([]);
    setCode("");
    setLoading(false);
    setCopied(false);
  }

  function handleClose(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleStart() {
    if (!password) {
      toast.error("Digite sua senha atual para continuar.");
      return;
    }
    setLoading(true);
    const result = await startTwoFactorEnrollment(password);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setTotpURI(result.totpURI);
    setBackupCodes(result.backupCodes);
    setStep("qr");
  }

  async function handleVerify() {
    if (code.length !== 6) {
      toast.error("Digite os 6 dígitos do código.");
      return;
    }
    setLoading(true);
    const result = await verifyTwoFactorCode(code);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setStep("backup");
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Códigos copiados!");
  }

  function handleFinish() {
    onEnrolled();
    handleClose(false);
    toast.success("Autenticação em dois fatores ativada!");
  }

  async function handleCopySecret() {
    await navigator.clipboard.writeText(secret);
    toast.success("Secret copiado!");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* ── Step 1: Intro ── */}
        {step === "intro" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-brand" />
                <DialogTitle>Ativar autenticação em dois fatores</DialogTitle>
              </div>
              <DialogDescription>
                O 2FA adiciona uma camada extra de segurança à sua conta. Você precisará de um
                aplicativo autenticador (Google Authenticator, Authy, etc.) e da sua senha atual.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <PasswordInput
                id="2fa-password"
                label="Confirme sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleStart} isLoading={loading}>
                Iniciar configuração
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 2: QR + code ── */}
        {step === "qr" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-brand" />
                <DialogTitle>Escaneie com seu autenticador</DialogTitle>
              </div>
              <DialogDescription>
                Abra seu aplicativo autenticador e escaneie o QR code, ou use a chave manual abaixo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* QR via browser API — link como fallback */}
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-surface-2/30 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpURI)}`}
                  alt="QR Code 2FA"
                  width={180}
                  height={180}
                  className="rounded"
                />
                <a
                  href={totpURI}
                  className="text-xs text-brand underline underline-offset-2 hover:text-brand/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir no autenticador
                </a>
              </div>

              {/* Manual entry */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Chave manual</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-2 py-1.5 font-mono text-xs break-all">
                    {secret}
                  </code>
                  <Button variant="ghost" size="icon-sm" onClick={handleCopySecret} type="button">
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Verify code */}
              <div className="space-y-1">
                <Input
                  id="totp-code"
                  label="Código de verificação (6 dígitos)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("intro")} disabled={loading}>
                Voltar
              </Button>
              <Button
                variant="primary"
                onClick={handleVerify}
                isLoading={loading}
                disabled={code.length !== 6}
              >
                Verificar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 3: Backup codes ── */}
        {step === "backup" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Check className="size-5 text-green-500" />
                <DialogTitle>2FA ativado com sucesso!</DialogTitle>
              </div>
              <DialogDescription>
                Guarde estes códigos de backup em um lugar seguro. Cada código pode ser usado uma
                única vez para acessar sua conta caso perca o autenticador.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-border/60 bg-surface-2/30 p-3">
              <div className="grid grid-cols-2 gap-1.5">
                {backupCodes.map((bc) => (
                  <code
                    key={bc}
                    className="rounded bg-muted px-2 py-1 font-mono text-xs text-center"
                  >
                    {bc}
                  </code>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCopyAll} type="button">
                {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
                {copied ? "Copiado!" : "Copiar todos"}
              </Button>
              <Button variant="primary" onClick={handleFinish}>
                Concluir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
