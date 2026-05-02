import type { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsPageView } from "@/components/settings/settings-page-view";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Perfil, preferências, voz, notificações, dispositivos e segurança.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  const result = await auth.api.getSession({ headers: await headers() });
  const twoFactorEnabled = Boolean(
    (result?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled,
  );
  const userId = result?.user?.id as string | undefined;

  let connectedProviders: string[] = [];
  let user = null;
  if (userId) {
    const integrations = await db.integration.findMany({
      where: { userId, status: "connected" },
      select: { provider: true },
    });
    connectedProviders = integrations.map((i) => i.provider);

    user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        bio: true,
        phone: true,
      },
    });
  }

  return <SettingsPageView twoFactorEnabled={twoFactorEnabled} connectedProviders={connectedProviders} user={user} />;
}
