import type { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
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

  return <SettingsPageView twoFactorEnabled={twoFactorEnabled} />;
}
