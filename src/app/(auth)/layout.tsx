import type { ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CloudVoiceLogo } from "@/components/brand/cloud-voice-logo"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  const features = [
    "Transcrição automática com IA",
    "Privacidade e LGPD compliant",
    "Cancele quando quiser",
  ]

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel - desktop only */}
      <div className="hidden lg:flex flex-col justify-between bg-glow-hero bg-grid-pattern p-10">
        {/* Top: Logo */}
        <div>
          <Link href="/" className="inline-flex items-center">
            <CloudVoiceLogo size="md" priority showWordmark={false} />
          </Link>
          <p className="mt-2 gradient-text text-xl font-bold">CloudVoice</p>
        </div>

        {/* Middle: Testimonial */}
        <div className="glass-card rounded-[var(--radius-2xl)] p-6 space-y-4">
          <blockquote className="italic text-foreground/80 leading-relaxed">
            &ldquo;O CloudVoice transformou como nossa equipe captura e organiza ideias. Economizamos horas por semana.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-semibold text-brand">
              AC
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ana Carolina</p>
              <p className="text-xs text-muted-foreground">CEO, TechStartup</p>
            </div>
          </div>
        </div>

        {/* Bottom: Features */}
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-foreground/90">
              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center p-8">
        {/* Theme toggle */}
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>

        {/* Logo only on mobile */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center">
            <CloudVoiceLogo size="md" priority />
          </Link>
        </div>

        {/* Form in glass card */}
        <div className="w-full max-w-md glass-card rounded-[var(--radius-2xl)] p-8 shadow-lg">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground max-w-md">
          Ao continuar, aceitas os{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
