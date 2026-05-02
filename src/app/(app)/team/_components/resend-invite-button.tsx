"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResendInviteButtonProps {
  inviteId: string;
}

export function ResendInviteButton({ inviteId }: ResendInviteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/team/invitations/${inviteId}/resend`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao reenviar convite");
        return;
      }

      toast.success("Convite reenviado com sucesso!");
    } catch (error) {
      console.error("[ResendInviteButton] Error:", error);
      toast.error("Erro ao reenviar convite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="min-h-11"
      onClick={handleResend}
      disabled={isLoading}
    >
      {isLoading ? "Enviando..." : "Reenviar"}
    </Button>
  );
}
