"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MOCK_SESSIONS = [
  { id: "s1", device: "Chrome · Linux", ip: "192.168.1.100", lastActive: "Agora", current: true },
  { id: "s2", device: "Safari · iOS", ip: "203.0.113.42", lastActive: "há 2 dias", current: false },
  { id: "s3", device: "Firefox · macOS", ip: "198.51.100.89", lastActive: "há 1 semana", current: false },
];

export function SecuritySection() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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

  const handleRevokeSession = (sessionId: string) => {
    toast.success(`Sessão ${sessionId} encerrada`);
  };

  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Segurança</h2>
        <CardDescription>2FA, senhas e sessões ativas (UI apenas).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert
          variant="info"
          title="Autenticação mock"
          description="Nesta fase não há Better Auth/Clerk. Os controlos abaixo são placeholders visuais."
        />

        {/* Card 1: Alterar Senha */}
        <div className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-2/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Senha</p>
              <p className="text-xs text-muted-foreground">Última alteração: 3 meses atrás</p>
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
              <Input
                id="current-password"
                label="Senha atual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                id="new-password"
                label="Nova palavra-passe"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                id="confirm-password"
                label="Confirmar nova palavra-passe"
                type="password"
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
          <div className="space-y-2">
            {MOCK_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-2 rounded-lg border border-border/40 bg-surface-1 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{session.device}</p>
                    {session.current && (
                      <Badge variant="secondary" className="text-xs">
                        Sessão atual
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.ip} · {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Encerrar
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Encerre as sessões que não reconheça para manter a sua conta segura.
          </p>
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
              <p className="text-xs text-muted-foreground">TOTP ou passkeys quando o backend estiver ligado.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                toast.success(twoFactorEnabled ? "2FA desativado" : "2FA ativado (mock)");
              }}
            >
              {twoFactorEnabled ? "Desativar" : "Ativar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
