import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { ContactForm } from "@/components/marketing/contact-form";

const site = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Contato",
  description: "Entre em contato com o time VoiceStream. Responderemos assim que possível.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() {
  const s = site();
  return (
    <div>
      <JsonLd
        id="jsonld-bc-ct"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${s}/` },
          { name: "Contato", url: `${s}/contact` },
        ])}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-glow-hero px-4 pt-20 pb-12 sm:px-6 sm:pt-24" aria-labelledby="c-h1">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 id="c-h1" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Fale com o <span className="gradient-text">VoiceStream</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Dúvidas? Sugestões? Quer agendar uma demonstração? Estamos aqui para ajudar.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Informações de contato</h2>
              <p className="mt-2 text-muted-foreground">
                Múltiplas formas de chegar até a gente. Escolha a que preferir.
              </p>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <Mail className="h-6 w-6 text-brand shrink-0 mt-1" aria-hidden />
              <div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="mt-1 text-sm text-muted-foreground">Para dúvidas gerais</p>
                <a
                  href="mailto:hello@voicestream.com.br"
                  className="mt-2 inline-block text-brand hover:text-brand-hover transition-colors font-medium text-sm"
                >
                  hello@voicestream.com.br
                </a>
              </div>
            </div>

            {/* Sales */}
            <div className="flex gap-4">
              <Mail className="h-6 w-6 text-brand shrink-0 mt-1" aria-hidden />
              <div>
                <h3 className="font-semibold text-foreground">Vendas & Planos</h3>
                <p className="mt-1 text-sm text-muted-foreground">Informações sobre preços e contratos</p>
                <a
                  href="mailto:vendas@voicestream.com.br"
                  className="mt-2 inline-block text-brand hover:text-brand-hover transition-colors font-medium text-sm"
                >
                  vendas@voicestream.com.br
                </a>
              </div>
            </div>

            {/* Office */}
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 text-brand shrink-0 mt-1" aria-hidden />
              <div>
                <h3 className="font-semibold text-foreground">Sede</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  São Paulo, Brasil<br />
                  (Equipe 100% remota)
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <Clock className="h-6 w-6 text-brand shrink-0 mt-1" aria-hidden />
              <div>
                <h3 className="font-semibold text-foreground">Disponibilidade</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Segunda a sexta, 09:00 - 18:00 BRT<br />
                  Respondemos em até 24 horas
                </p>
              </div>
            </div>

            {/* Social */}
            <div className="pt-4 border-t border-border/40">
              <p className="text-sm font-medium text-foreground mb-3">Redes sociais</p>
              <div className="flex gap-3">
                {[
                  { icon: "Li", label: "LinkedIn", href: "#" },
                  { icon: "X", label: "X (Twitter)", href: "#" },
                  { icon: "Gh", label: "GitHub", href: "#" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="h-10 w-10 rounded-full bg-surface-2 border border-border hover:border-brand/50 flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-brand transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Calendar link */}
            <div className="pt-4 border-t border-border/40">
              <Link
                href="https://app.cal.com/m/demonstracao"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border/60 bg-surface-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-3 transition-colors"
              >
                Agendar reunião
              </Link>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-[var(--radius-xl)] p-6 sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight">Envie uma mensagem</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Responderemos assim que possível. Para assuntos urgentes, prefira ligar por email.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-border/40 bg-surface-1/40 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de algo mais?{" "}
            <Link href="/security" className="text-brand hover:text-brand-hover transition-colors font-medium">
              Central de Segurança
            </Link>{" "}
            ou{" "}
            <Link href="/#faq" className="text-brand hover:text-brand-hover transition-colors font-medium">
              Perguntas Frequentes
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
