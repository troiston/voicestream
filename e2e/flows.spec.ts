import { test, expect } from "@playwright/test";

import { installCriticalConsoleCollector } from "./helpers/critical-console";
import { addMockSessionCookie } from "./helpers/session-cookie";
import { waitE2eAppHydration } from "./helpers/wait-e2e-app-hydration";

test.describe("fluxos curtos — auth", () => {
  test("login leva ao dashboard", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/login", { waitUntil: "load" });
    await page.getByLabel("Email").fill("playwright@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 25_000 });
    con.assertClean();
  });

  test("registo leva ao onboarding", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    const unique = `pw-${Date.now()}@example.com`;
    await page.goto("/register", { waitUntil: "load" });
    await page.getByLabel("O seu nome").fill("Playwright");
    await page.getByLabel("Email").fill(unique);
    await page.locator("#reg-pw").fill("supersecret12");
    await page.getByRole("checkbox", { name: /Li e aceito/i }).check();
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 25_000 });
    con.assertClean();
  });

  test("recuperar senha mostra mensagem de sucesso", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/forgot-password", { waitUntil: "load" });
    await page.getByLabel("Email").fill("anyone@example.com");
    await page.getByRole("button", { name: "Enviar" }).click();
    const status = page.getByRole("status");
    await expect(status).toBeVisible({ timeout: 15_000 });
    await expect(status).toContainText(/instruções/i);
    con.assertClean();
  });
});

test.describe("fluxos curtos — app mock", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    if (!baseURL) {
      throw new Error("baseURL não definido.");
    }
    await addMockSessionCookie(context, baseURL);
  });

  test("criar espaço no modal", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/spaces", { waitUntil: "load" });
    await waitE2eAppHydration(page);
    await expect(page.getByRole("button", { name: "Novo espaço" })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Novo espaço" }).click();
    const spaceDialog = page.getByTestId("e2e-space-dialog");
    await expect(spaceDialog).toBeVisible({ timeout: 15_000 });
    await expect(spaceDialog.getByRole("heading", { name: "Criar espaço" })).toBeVisible();
    await spaceDialog.getByLabel("Nome").fill(`E2E Espaço ${Date.now()}`);
    await spaceDialog.getByRole("button", { name: "Criar", exact: true }).click();
    await expect(page.getByTestId("e2e-space-dialog")).toHaveCount(0, { timeout: 15_000 });
    con.assertClean();
  });

  test("criar tarefa no painel", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/tasks", { waitUntil: "load" });
    await waitE2eAppHydration(page);
    await expect(page.getByRole("button", { name: "Nova tarefa" })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Nova tarefa" }).click();
    const taskDialog = page.getByTestId("e2e-task-dialog");
    await expect(taskDialog).toBeVisible({ timeout: 15_000 });
    await expect(taskDialog.getByRole("heading", { name: "Criar tarefa" })).toBeVisible();
    await taskDialog.getByLabel("Título").fill(`Tarefa E2E ${Date.now()}`);
    await taskDialog.getByRole("button", { name: "Criar", exact: true }).click();
    await expect(page.getByTestId("e2e-task-dialog")).toHaveCount(0, { timeout: 15_000 });
    con.assertClean();
  });

  test("captura idle → gravação", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/capture", { waitUntil: "load" });
    await waitE2eAppHydration(page);
    await expect(page.getByRole("heading", { name: "Captura de voz" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Prima iniciar para simular", { exact: false })).toBeVisible();
    const btnIniciar = page.getByTestId("e2e-capture-iniciar");
    await expect(btnIniciar).toBeEnabled();
    await btnIniciar.scrollIntoViewIfNeeded();
    await btnIniciar.click();
    await expect(page.getByTestId("e2e-capture-phase")).toHaveAttribute("data-phase", "recording", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("e2e-capture-parar")).toBeVisible();
    await expect(page.getByText(/Gravação simulada/)).toBeVisible();
    con.assertClean();
  });

  test("billing — diálogo comparar planos abre e fecha", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/billing", { waitUntil: "load" });
    await waitE2eAppHydration(page);
    const upgradeBtn = page.getByRole("button", { name: "Comparar e subir de plano" });
    await expect(upgradeBtn).toBeVisible({ timeout: 15_000 });
    await upgradeBtn.click();
    const billDialog = page.getByTestId("e2e-billing-compare-dialog");
    await expect(billDialog).toBeVisible({ timeout: 15_000 });
    await expect(billDialog.getByRole("heading", { name: "Pro vs Business" })).toBeVisible();
    await billDialog.getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByTestId("e2e-billing-compare-dialog")).toHaveCount(0, { timeout: 10_000 });
    con.assertClean();
  });

  test("sessão via cookie acede ao dashboard", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/dashboard", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 20_000 });
    con.assertClean();
  });
});
