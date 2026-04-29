import { test, expect } from "@playwright/test";

import { installCriticalConsoleCollector } from "./helpers/critical-console";
import { addMockSessionCookie } from "./helpers/session-cookie";
import { APP_AUTHENTICATED_PATHS, getAllPublicSmokePaths } from "./helpers/routes";

test.describe("smoke — rotas públicas e auth (200 + h1)", () => {
  for (const path of getAllPublicSmokePaths()) {
    const label = path === "" ? "/" : path;
    test(label, async ({ page }) => {
      const con = installCriticalConsoleCollector(page);
      const target = path === "" ? "/" : path;
      const res = await page.goto(target, { waitUntil: "load" });
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 45_000 });
      con.assertClean();
    });
  }
});

test.describe("smoke — área app com sessão mock", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    if (!baseURL) {
      throw new Error("baseURL não definido (Playwright use.baseURL).");
    }
    await addMockSessionCookie(context, baseURL);
  });

  for (const path of APP_AUTHENTICATED_PATHS) {
    test(path, async ({ page }) => {
      const con = installCriticalConsoleCollector(page);
      const res = await page.goto(path, { waitUntil: "load" });
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 45_000 });
      con.assertClean();
    });
  }
});

test.describe("smoke — feed RSS do blog", () => {
  test("/blog/rss.xml responde com RSS 2.0", async ({ request }) => {
    const res = await request.get("/blog/rss.xml");
    expect(res.ok()).toBeTruthy();
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/application\/rss\+xml|text\/xml/i);
    const body = await res.text();
    expect(body).toContain("<rss");
    expect(body).toContain("<channel>");
    expect(body).toContain("<item>");
  });
});

test.describe("smoke — gating", () => {
  test("/dashboard sem cookie redireciona para /login", async ({ page }) => {
    const con = installCriticalConsoleCollector(page);
    await page.goto("/dashboard", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/login/);
    con.assertClean();
  });
});
