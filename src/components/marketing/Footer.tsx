import Link from "next/link"
import { CloudVoiceLogo } from "@/components/brand/cloud-voice-logo"

const colunas: Record<string, { label: string; href: string }[]> = {
  Produto: [
    { label: "Recursos", href: "/#features" },
    { label: "Preços", href: "/#pricing" },
    { label: "Planos", href: "/pricing" },
    { label: "Perguntas (FAQ)", href: "/#faq" },
  ],
  Empresa: [
    { label: "Sobre nós", href: "/about" },
    { label: "Contato", href: "/contact" },
    { label: "Blog", href: "/blog" },
  ],
  Recursos: [
    { label: "Changelog", href: "/changelog" },
    { label: "Segurança e confiança", href: "/security" },
  ],
  Legal: [
    { label: "Privacidade (RGPD/LGPD)", href: "/privacy" },
    { label: "Termos de uso", href: "/terms" },
    { label: "Política de cookies", href: "/cookies" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-surface-1/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="CloudVoice, página inicial"
            >
              <CloudVoiceLogo size="sm" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Copiloto de vida com Espaços para cada contexto. Voz, texto e tarefa num só lugar.
            </p>
            <p className="mt-3 text-xs text-muted-foreground/60">
              <a className="hover:text-foreground transition-colors" href="mailto:hello@cloudvoice.com.br">
                hello@cloudvoice.com.br
              </a>
            </p>
          </div>
          {Object.entries(colunas).map(([categoria, items]) => (
            <nav key={categoria} aria-label={categoria}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">{categoria}</h2>
              <ul className="mt-4 list-none space-y-2 p-0">
                {items.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} CloudVoice. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
