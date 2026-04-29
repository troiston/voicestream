"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UserRole } from "@/types/team";

type RoleOption = UserRole;

const ROLE_OPTIONS: { value: RoleOption; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "membro", label: "Membro" },
  { value: "convidado", label: "Convidado" },
];

export function TeamInviteDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleOption>("membro");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Por favor, insira um email");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Convite enviado para ${email}!`);
      setEmail("");
      setRole("membro");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="btn-gradient inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-4 text-sm font-semibold">
        Convidar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Envie um convite para adicionar um novo membro à equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-border/60 bg-surface-2 px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              Função
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as RoleOption)}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-border/60 bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
              disabled={isLoading}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={isLoading} className="btn-gradient">
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
