"use client";

import { useActionState, useState } from "react";
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
import { inviteToSpaceAction } from "@/features/spaces/actions";
import type { UserRole } from "@/types/team";

type RoleOption = UserRole;

const ROLE_OPTIONS: { value: RoleOption; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "membro", label: "Membro" },
  { value: "convidado", label: "Convidado" },
];

export interface TeamInviteDialogProps {
  spaceId?: string;
}

export function TeamInviteDialog({ spaceId }: TeamInviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleOption>("membro");
  const [st, act, pending] = useActionState(inviteToSpaceAction, null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!spaceId) {
      toast.error("Espaço não selecionado");
      return;
    }

    if (!email.trim()) {
      toast.error("Por favor, insira um email");
      return;
    }

    const formData = new FormData();
    formData.set("spaceId", spaceId);
    formData.set("email", email);
    formData.set("role", role);

    act(formData);
  };

  if (st?.ok) {
    toast.success(`Convite enviado para ${email}!`);
    setEmail("");
    setRole("membro");
    setIsOpen(false);
  }

  if (st && !st.ok && st.message) {
    toast.error(st.message);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="btn-gradient inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-4 text-sm font-semibold" disabled={!spaceId}>
        Convidar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Envie um convite para adicionar um novo membro ao espaço.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={pending}
              required
            />
            {st && !st.ok && st.formErrors?.email ? (
              <p className="mt-1 text-xs text-red-500">{st.formErrors.email[0]}</p>
            ) : null}
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
              disabled={pending}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={pending}
              isLoading={pending}
              className="btn-gradient"
            >
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
