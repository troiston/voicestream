import type { ReactNode } from "react";

export default function StyleguideLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <a
        className="sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:not-sr-only focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground"
        href="#styleguide-main"
      >
        Pular para o conteúdo do guia
      </a>
      {children}
    </div>
  );
}
