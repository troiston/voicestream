import type { Page } from "@playwright/test";

/** Espera a hidratação do layout cliente (AppShell) para cliques `onClick` fazerem efeito. */
export async function waitE2eAppHydration(
  page: Page,
  timeout: number = 30_000,
): Promise<void> {
  await page.waitForFunction(
    () => document.body?.dataset.e2eApp === "1",
    undefined,
    { timeout },
  );
}
