import type { Metadata } from "next";

import { SettingsPageView } from "@/components/settings/settings-page-view";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Perfil, preferências, voz, notificações, dispositivos e segurança.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return <SettingsPageView />;
}
