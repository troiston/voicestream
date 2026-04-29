"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const noOpSubscribe = () => {
  return () => {};
};

/**
 * Hidratação: no servidor/SSR a snapshot é falsa; no cliente, verdadeira, sem efeito em cascata.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(noOpSubscribe, () => true, () => false);
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

/** Preferência do SO — ícone alinhado a next-themes (theme === "system"). */
function MonitorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

const btnBase =
  "inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-w-0 sm:flex-initial sm:px-2.5";

const btnOn = "bg-muted text-foreground shadow-sm";
const btnOff = "text-muted-foreground hover:text-foreground";

/**
 * Três modos explícitos: `setTheme("light" | "dark" | "system")` — sem alternar
 * com base em `resolvedTheme` (isso forçava claro/escuro e confundia "Sistema").
 */
export function ThemeModeControls() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return <div className="h-11 w-11 shrink-0" aria-hidden />;
  }

  // Antes da hidratação do next-themes, `theme` pode ser undefined → alinhar ao default "system"
  const mode: "light" | "dark" | "system" =
    theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

  return (
    <div
      className="flex max-w-full flex-wrap items-center justify-end gap-1"
      role="group"
      aria-label="Tema de cor do site"
    >
      <button
        type="button"
        onClick={() => {
          setTheme("light");
        }}
        className={`${btnBase} ${mode === "light" ? btnOn : btnOff}`}
        aria-pressed={mode === "light"}
        data-state={mode === "light" ? "on" : "off"}
        aria-label="Tema claro"
      >
        <SunIcon />
        <span>Claro</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setTheme("dark");
        }}
        className={`${btnBase} ${mode === "dark" ? btnOn : btnOff}`}
        aria-pressed={mode === "dark"}
        data-state={mode === "dark" ? "on" : "off"}
        aria-label="Tema escuro"
      >
        <MoonIcon />
        <span>Escuro</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setTheme("system");
        }}
        className={`${btnBase} ${mode === "system" ? btnOn : btnOff}`}
        aria-pressed={mode === "system"}
        data-state={mode === "system" ? "on" : "off"}
        aria-label="Seguir tema do sistema"
      >
        <MonitorIcon />
        <span>Sistema</span>
      </button>
    </div>
  );
}
