"use client";

import { useCallback, useId, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  COOKIE_PREFERENCES_CHANGED,
  COOKIE_PREFERENCES_STORAGE_KEY,
} from "@/lib/cookie-consent-key";

const KEY = COOKIE_PREFERENCES_STORAGE_KEY;
type Consent = "rejected" | "accepted" | "unset";

function readStorage(): Consent {
  if (typeof window === "undefined") {
    return "unset";
  }
  const v = window.localStorage.getItem(KEY) as Consent | null;
  if (v === "accepted" || v === "rejected") {
    return v;
  }
  return "unset";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY) {
      callback();
    }
  };
  const onSameTab = () => {
    callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(COOKIE_PREFERENCES_CHANGED, onSameTab);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COOKIE_PREFERENCES_CHANGED, onSameTab);
  };
}

function getSnapshot() {
  return readStorage();
}

const serverSnapshot: Consent = "unset";

function getServerSnapshot() {
  return serverSnapshot;
}

function notifyConsentChanged() {
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_CHANGED));
}

export function CookieConsentBanner() {
  const c = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [details, setDetails] = useState(false);
  const t = useId();
  const panel = `${t}-p`;

  const accept = useCallback(() => {
    window.localStorage.setItem(KEY, "accepted");
    notifyConsentChanged();
    setDetails(false);
  }, []);

  const reject = useCallback(() => {
    window.localStorage.setItem(KEY, "rejected");
    notifyConsentChanged();
    setDetails(false);
  }, []);

  if (c !== "unset") {
    return null;
  }

  return (
    <div
      className="fixed end-0 bottom-0 start-0 z-[150] border-t border-border bg-surface-1/95 p-3 shadow-md backdrop-blur"
      role="region"
      aria-label="Consentimento de cookies"
      tabIndex={-1}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-sm text-foreground/80">
          Utilizamos cookies necessários e opcionais para o site funcionar, analisar tráfego e lembrar
          preferências. Pode ajustar na página{" "}
          <Link className="text-accent underline underline-offset-2" href="/cookies">
            Cookies
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={reject}
            aria-keyshortcuts="N"
          >
            Apenas essenciais
          </Button>
          <Button type="button" size="sm" variant="primary" onClick={accept} id={`${t}-accept`}>
            Aceitar todos
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-expanded={details}
            aria-controls={panel}
            onClick={() => setDetails((d) => !d)}
          >
            {details ? "Ocultar" : "Detalhes"}
          </Button>
        </div>
      </div>
      {details ? (
        <div
          className="mx-auto mt-2 max-w-5xl rounded-[var(--radius-sm)] border border-dashed border-border/80 p-2"
          id={panel}
          role="region"
        >
          <p className="text-xs text-foreground/60">
            Sem cookies de terceiros reais—placeholder da UI. Preferências persistem com a chave{" "}
            <span className="font-mono">{KEY}</span>.
          </p>
          <p className="text-xs text-foreground/50">
            Tema, sessão (mock) e acessos ao painel: consulte a política em{" "}
            <Link className="text-accent underline" href="/privacy">
              Privacidade
            </Link>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
