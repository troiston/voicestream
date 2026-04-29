import { createHash } from "node:crypto";

export type MockUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  avatarUrl?: string;
};

function idFromEmail(email: string) {
  const h = createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  return `u_${h.slice(0, 12)}`;
}

/**
 * Cria (de forma estável) um usuário mock a partir do email.
 */
export function mockUserFromEmail(email: string, nameOverride?: string): MockUser {
  const e = email.toLowerCase().trim();
  const name =
    nameOverride?.trim() ||
    e
      .split("@")[0]
      ?.replace(/\./g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Usuário";
  return {
    id: idFromEmail(e),
    email: e,
    name,
    emailVerified: e.includes("+verified@") || e.endsWith("@voicestream.local"),
  };
}

export const DEMO_USER: MockUser = {
  id: "u_demo",
  email: "ana.silva@exemplo.com",
  name: "Ana Silva",
  emailVerified: true,
  avatarUrl: "/brand/logos/logo-01.png",
};
