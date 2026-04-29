import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { VoiceStreamLogo } from "@/components/brand/voice-stream-logo"
import { MobileMenu } from "./mobile-menu"

const isDev = process.env.NODE_ENV === "development"

const mainLinks: { href: string; label: string }[] = [
  { href: "/#features", label: "Recursos" },
  { href: "/pricing", label: "Preços" },
  { href: "/about", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contato" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <nav
        className="mx-auto grid h-14 max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6"
        aria-label="Principal"
      >
        {/* Logo (column 1) */}
        <div className="flex items-center gap-2">
          <MobileMenu isDev={isDev} links={mainLinks} />
          <Link
            href="/"
            className="inline-flex items-center rounded focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="VoiceStream, página inicial"
          >
            <VoiceStreamLogo size="sm" priority />
          </Link>
        </div>

        {/* Nav links (column 2 — centered) */}
        <ul
          className="hidden list-none items-center justify-center gap-0.5 lg:flex"
          aria-label="Links principais"
        >
          {mainLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
          {isDev && (
            <li>
              <Link
                href="/styleguide"
                className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              >
                Estilos
              </Link>
            </li>
          )}
        </ul>

        {/* CTAs (column 3) */}
        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            href="/demo"
            className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            Ver demo
          </Link>
          <Link
            href="/register"
            className="btn-gradient rounded-[var(--radius-md)] px-4 py-1.5 text-sm font-semibold whitespace-nowrap"
          >
            Criar conta
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
