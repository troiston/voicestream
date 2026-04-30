import type { Metadata } from "next";

import { PrivacySettingsView } from "@/components/settings/privacy-settings-view";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Exporte seus dados ou exclua sua conta (LGPD).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacySettingsPage() {
  return <PrivacySettingsView />;
}
