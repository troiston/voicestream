import type { Page } from "@playwright/test";

const DEFAULT_ALLOWED: readonly RegExp[] = [
  /Download the React DevTools/i,
  /\[@playwright\/test\]/i,
  /ResizeObserver loop/i,
  /Failed to load resource.*favicon/i,
  // Next.js dev: múltiplos clientes / handshake HMR em paralelo geram ruído sem impacto na app
  /WebSocket connection to ['"]ws:\/\/.*\/_next\/webpack-hmr/i,
  /webpack-hmr/i,
  /ERR_INVALID_HTTP_RESPONSE/i,
];

export type CriticalConsoleOptions = {
  /** Mensagens de `console.error` ignoradas (regex). */
  allow?: readonly RegExp[];
};

/**
 * Acumula erros de consola e exceções não tratadas; chamar `assertClean()` no fim do teste.
 */
export function installCriticalConsoleCollector(page: Page, options?: CriticalConsoleOptions) {
  const allow = [...DEFAULT_ALLOWED, ...(options?.allow ?? [])];
  const messages: string[] = [];

  const push = (kind: string, text: string) => {
    if (allow.some((re) => re.test(text))) {
      return;
    }
    messages.push(`[${kind}] ${text}`);
  };

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") {
      push("console.error", msg.text());
    }
  };

  const onPageError = (err: Error) => {
    push("pageerror", err.message);
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  return {
    assertClean(): void {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
      if (messages.length > 0) {
        throw new Error(`Consola crítica:\n${messages.join("\n")}`);
      }
    },
    get messages(): readonly string[] {
      return messages;
    },
  };
}
