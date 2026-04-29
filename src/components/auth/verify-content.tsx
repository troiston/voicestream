"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "pending" | "success" | "error";

function parseStatus(v: string | null): Status {
  if (v === "success" || v === "error") {
    return v;
  }
  return "pending";
}

export function VerifyContent() {
  const q = useSearchParams();
  const status = parseStatus(q.get("status"));
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [countdown, setCountdown] = useState(5);

  // Cooldown timer para reenvio
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  // Countdown e redirecionamento em estado success
  useEffect(() => {
    if (status !== "success") return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    router.push("/dashboard");
  }, [status, countdown, router]);

  if (status === "success") {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-success" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">E-mail verificado!</h2>
          <p className="text-sm text-muted-foreground">
            Sua conta foi verificada. Redirecionando em {countdown}s...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-danger" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Link inválido ou expirado</h2>
          <p className="text-sm text-muted-foreground">
            O link de verificação não é válido ou já expirou. Solicite um novo link.
          </p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/forgot-password">Solicitar novo link</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Estado PENDING (padrão)
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Mail className="h-16 w-16 text-muted-foreground animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Verifique seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de verificação para seu endereço de e-mail. Clique no link para confirmar sua conta.
        </p>
      </div>
      <div className="flex justify-center">
        <Button
          onClick={() => setCooldown(60)}
          disabled={cooldown > 0}
          variant="secondary"
        >
          {cooldown > 0 ? `Reenviar (${cooldown}s)` : "Reenviar e-mail"}
        </Button>
      </div>
    </div>
  );
}
