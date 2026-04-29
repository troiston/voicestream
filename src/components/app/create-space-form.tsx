"use client";

import { useActionState, useEffect, useId } from "react";

import { createSpaceAction, type CreateSpaceState } from "@/features/spaces/actions";
import type { MockSpace } from "@/lib/mocks/spaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export interface CreateSpaceFormProps {
  onSuccess: (space: MockSpace) => void;
  onCancel: () => void;
}

export function CreateSpaceForm({ onSuccess, onCancel }: CreateSpaceFormProps) {
  const id = useId();
  const [st, act, pending] = useActionState(createSpaceAction, null as CreateSpaceState);

  useEffect(() => {
    if (st?.ok) {
      onSuccess(st.data.space);
    }
  }, [st, onSuccess]);

  return (
    <form action={act} className="flex flex-col">
      <div className="border-b border-border px-6 py-4">
        <h2 id={`${id}-dlg-title`} className="text-lg font-semibold">
          Criar espaço
        </h2>
        <p className="mt-1 text-sm text-foreground/60">Validação com Zod; gravação simulada.</p>
      </div>
      <div className="space-y-4 px-6 py-4">
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />
        <Input
          name="name"
          label="Nome"
          required
          maxLength={80}
          autoComplete="off"
          error={st && !st.ok && st.formErrors?.name ? st.formErrors.name[0] : undefined}
        />
        <Textarea
          name="description"
          label="Descrição (opcional)"
          maxLength={500}
          rows={3}
          error={
            st && !st.ok && st.formErrors?.description ? st.formErrors.description[0] : undefined
          }
        />
        {st && !st.ok && st.message ? (
          <Alert variant="danger" title="Não foi possível criar" description={st.message} />
        ) : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={pending} loadingLabel="A criar">
          Criar
        </Button>
      </div>
    </form>
  );
}
