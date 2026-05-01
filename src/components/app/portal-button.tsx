"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type PortalButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

export function PortalButton({
  variant = "secondary",
  size = "sm",
  className,
  children,
}: PortalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Falha ao acessar portal");
        return;
      }
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      console.error("[portal] error:", e);
      toast.error("Erro ao abrir portal Stripe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Abrindo..." : children}
    </Button>
  );
}
