"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PrivacySettingsView() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/me/export");
      if (!res.ok) throw new Error("Falha ao exportar dados");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voicestream-export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/me", { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir conta");
      setDeleteOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Privacidade</h1>
        <p className="text-sm text-muted-foreground">
          Em conformidade com a LGPD, você pode exportar todos os seus dados a
          qualquer momento ou solicitar a exclusão da sua conta.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">Exportar meus dados</h2>
            <p className="text-sm text-muted-foreground">
              Baixe um arquivo ZIP com perfil, gravações, transcrições, resumos,
              tarefas, assinaturas e logs de auditoria.
            </p>
          </div>
          <Button onClick={handleExport} disabled={exporting}>
            <Download className="size-4" aria-hidden />
            {exporting ? "Preparando..." : "Exportar meus dados"}
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-destructive/30 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-destructive">
              Excluir minha conta
            </h2>
            <p className="text-sm text-muted-foreground">
              Sua conta será marcada para exclusão e removida em até 30 dias.
              Você será desconectado imediatamente.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deleting}
          >
            <Trash2 className="size-4" aria-hidden />
            Excluir minha conta
          </Button>
        </div>
      </section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir minha conta?</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível após 30 dias. Todos os seus dados,
              gravações e tarefas serão permanentemente removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Sim, excluir minha conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
