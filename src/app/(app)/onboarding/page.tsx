import type { Metadata } from "next";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Primeiros passos",
  description: "Configura privacidade de áudio, idioma e integrações antes de usar o CloudVoice.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Bem-vindo ao CloudVoice</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Três passos rápidos para alinhar privacidade, idioma de transcrição e integrações. Podes saltar
          a qualquer momento — voltas aqui pelo painel ou pelo item «Primeiros passos» na barra lateral.
        </p>
      </header>
      <OnboardingWizard />
    </div>
  );
}
