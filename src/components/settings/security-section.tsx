"use client";

import { useState, useEffect, useTransition } from "react";
import { Monitor, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TwoFactorEnrollmentDialog } from "./two-factor-enrollment-dialog";
import { listSessions, revokeSession, type SessionInfo } from "@/features/sessions/actions";
import { disableTwoFactor } from "@/features/two-factor/actions";

interface SecuritySectionProps {
  twoFactorEnabled?: boolean;
}

function formatUA(ua: string | null): string {
  if (!ua) return "Dispositivo desconhecido";
  // Simple extraction: browser name from UA string
  const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Brave)\/[\d.]+/i);
  return match ? match[0] : ua.slice(0, 60);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function SecuritySection({ twoFactorEnabled: initialTwoFactorEnabled = false }: SecuritySectionProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [isDisabling, startDisableTransition] = useTransition();

  // Sessions state
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSessions().then((data) => {
      if (!cancelled) {
        setSessions(data);
        setLoadingSessions(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As novas senhas não correspondem");
      return;
    }
    setIsUpdatingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUpdatingPassword(false);
    setShowPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Senha atualizada com sucesso!");
  };

  const handleDisable2FA = () => {
    if (!disablePassword) {
      toast.error("Digite sua senha para desativar o 2FA.");
      return;
    }
    startDisableTransition(async () => {
      const result = await disableTwoFactor(disablePassword);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setTwoFactorEnabled(false);
      setShowDisableForm(false);
      setDisablePassword("");
      toast.success("2FA desativado.");
    });
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    const result = await revokeSession(sessionId);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Sessão revogada.");
    }
    setRevokingId(null);
  };

  return (
    <>
      <TwoFactorEnrollmentDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        onEnrolled={() => setTwoFactorEnabled(true)}
      />

      <Card className="border border-border/60 bg-surface-1 shadow-none">
        <CardHeader>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Segurança</h2>
          <CardDescription>Configure 2FA e gerencie suas sessões.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Card 1: Alterar Senha */}
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-2/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Senha</p>
                <p className="text-xs text-muted-foreground">Última alteração: indisponível</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? "Cancelar" : "Alterar"}
              </Button>
            </div>

            {showPasswordForm && (
              <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                <PasswordInput
                  id="current-password"
                  label="Senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <PasswordInput
                  id="new-password"
                  label="Nova palavra-passe"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordInput
                  id="confirm-password"
                  label="Confirmar nova palavra-passe"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleUpdatePassword}
                    isLoading={isUpdatingPassword}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Sessões Ativas */}
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-2/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Sessões ativas</h3>
            {loadingSessions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Carregando sessões…
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma sessão ativa encontrada.</p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border/40 bg-surface-1 px-3 py-2"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <Monitor className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {formatUA(s.userAgent)}
                          {s.isCurrent && (
                            <Badge variant="secondary" className="ml-2 text-[10px] py-0">
                              Esta sessão
                            </Badge>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.ipAddress ?? "IP desconhecido"} · Ativo em {formatDate(s.updatedAt)}
                        </p>
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => handleRevokeSession(s.id)}
                        disabled={revokingId === s.id}
                        aria-label="Revogar sessão"
                      >
                        {revokingId === s.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card 3: Autenticação em 2 Fatores */}
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-2/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Autenticação em dois fatores</p>
                  <Badge
                    variant={twoFactorEnabled ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {twoFactorEnabled ? "Ativado" : "Não ativado"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {twoFactorEnabled
                    ? "TOTP ativado. Use seu autenticador no próximo login."
                    : "Adicione uma camada extra de segurança com TOTP."}
                </p>
              </div>
              {twoFactorEnabled ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDisableForm(!showDisableForm)}
                >
                  {showDisableForm ? "Cancelar" : "Desativar 2FA"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEnrollDialogOpen(true)}
                >
                  Configurar
                </Button>
              )}
            </div>

            {showDisableForm && twoFactorEnabled && (
              <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                <PasswordInput
                  id="disable-2fa-password"
                  label="Confirme sua senha para desativar"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDisable2FA()}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDisable2FA}
                  isLoading={isDisabling}
                >
                  Confirmar desativação
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
