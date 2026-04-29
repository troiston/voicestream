import type { Metadata } from "next";

import { StyleguideView } from "@/components/styleguide/styleguide-view";

export const metadata: Metadata = {
  title: "Guia de estilos",
  description: "Pré-visualização de tokens, componentes e padrões (Design System) — Fase 1D.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StyleguidePage() {
  return <StyleguideView />;
}
