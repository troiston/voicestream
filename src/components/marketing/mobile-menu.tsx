"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type NavLink = { href: string; label: string };

type MobileMenuProps = {
  isDev: boolean;
  links: NavLink[];
};

function IconMenu({ open }: { open: boolean }) {
  return (
    <span className="relative h-3 w-4" aria-hidden>
      <span
        className={cn(
          "absolute start-0 top-0 h-0.5 w-4 origin-center bg-foreground transition-transform",
          open ? "translate-y-1.5 rotate-45" : "translate-y-0.5",
        )}
      />
      <span
        className={cn(
          "absolute start-0 top-1.5 h-0.5 w-4 origin-center bg-foreground transition-[opacity,transform] motion-reduce:transition-none",
          open ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute start-0 top-3 h-0.5 w-4 origin-center bg-foreground transition-transform",
          open ? "-translate-y-1.5 -rotate-45" : "translate-y-0",
        )}
      />
    </span>
  );
}

export function MobileMenu({ isDev, links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const mId = useId();

  return (
    <div className="relative me-1 flex h-14 items-center lg:hidden">
      <Button
        type="button"
        variant="ghost"
        className="min-h-11 min-w-11 px-1"
        aria-label={open ? "Fechar menu" : "Abrir menu de navegação"}
        aria-expanded={open}
        aria-controls={mId}
        onClick={() => setOpen((o) => !o)}
      >
        <IconMenu open={open} />
        <span className="sr-only">Menu</span>
      </Button>
      {open ? (
        <div
          className="fixed end-0 start-0 top-14 z-50"
          id={mId}
          role="dialog"
          aria-label="Navegação de marketing"
          aria-modal="true"
        >
          <button
            type="button"
            className="fixed end-0 start-0 top-14 h-[100dvh] bg-background/60 backdrop-blur-sm"
            aria-label="Fechar o menu (área inativa)"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-full">
            <ul
              className="m-0 max-h-[min(70dvh,28rem)] list-none overflow-y-auto border-b border-border/60 bg-surface-1/95 backdrop-blur-xl p-0 text-left shadow-lg"
            >
                {isDev ? (
                  <li>
                    <Link
                      className="block min-h-11 w-full border-b border-border/50 px-4 py-2 text-left text-sm font-medium"
                      href="/styleguide"
                      onClick={() => setOpen(false)}
                    >
                      Guia de estilos
                    </Link>
                  </li>
                ) : null}
                {links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      className="block min-h-11 w-full border-b border-border/50 px-4 py-2 text-left text-sm font-medium"
                      href={l.href}
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li className="grid grid-cols-2 gap-2 border-b border-border/40 p-3">
                  <Link
                    className="flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-border/60 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    href="/login"
                    onClick={() => setOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    className="btn-gradient flex min-h-11 items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold"
                    href="/register"
                    onClick={() => setOpen(false)}
                  >
                    Criar conta
                  </Link>
                </li>
                <li className="px-3 py-3">
                  <p className="pb-2 text-xs text-muted-foreground/60 uppercase tracking-widest">Tema</p>
                  <ThemeToggle />
                </li>
              </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
