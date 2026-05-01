"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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


  return (
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
          <p className="text-sm text-muted-foreground">Nenhuma sessão ativa registrada nesta versão.</p>
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
              disabled
              onClick={() => {
                toast.info("Em breve — fluxo de configuração TOTP");
              }}
            >
              Em breve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
