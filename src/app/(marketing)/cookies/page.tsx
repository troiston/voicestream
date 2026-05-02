import type { Metadata } from "next";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { CookiePreferencesReopen } from "@/components/marketing/cookie-preferences-reopen";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { COOKIE_PREFERENCES_STORAGE_KEY } from "@/lib/cookie-consent-key";

const rows = [
  { name: "cv-cookie-preferences", purpose: "Lembrar a sua escolha (aceitar / rejeitar)", duration: "1 ano (persistente, localStorage)", type: "Essenciais" },
  { name: "__Secure-better-auth.session_token", purpose: "Manter o usuário autenticado durante a sessão", duration: "Até logout ou expiração da sessão", type: "Essenciais" },
  { name: "theme (next-themes)", purpose: "Preferência de tema claro/escuro", duration: "Persistente", type: "Preferência" },
] as const;

const LAST_UPDATED = "2026-04-20";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Cookies e armazenamento local utilizados no site VoiceStream (MVP) e reabertura de preferências.",
  alternates: { canonical: "/cookies" },
  openGraph: { url: "/cookies" },
};

export default function CookiesPage() {
  const siteUrl = getPublicSiteUrl();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
      <JsonLd
        id="jsonld-breadcrumbs-cookies"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${siteUrl}/` },
          { name: "Política de cookies", url: `${siteUrl}/cookies` },
        ])}
      />
      <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Política de cookies</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: {LAST_UPDATED}.</p>
      <p className="mt-3 text-muted-foreground">
        O banner no rodapé aplica a sua preferência, persistida com a chave de armazenamento
        <span className="ms-1 font-mono text-sm">{` ${COOKIE_PREFERENCES_STORAGE_KEY} `}</span> em
        <code className="mx-0.5 rounded border border-border/50 px-0.5 font-mono text-xs">localStorage</code>
        (sem cookies de publicidade reais no MVP).
      </p>
      <section className="mt-8" aria-labelledby="c-table">
        <h2 className="text-2xl font-bold" id="c-table">Tabela de cookies e armazenamento</h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-sm)] border border-border/60">
          <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
            <caption className="px-2 py-2 text-xs text-muted-foreground">Nomes técnicos e duração indicativa</caption>
            <thead className="border-b border-border/60 bg-surface-1/30">
              <tr>
                <th className="p-2 font-medium" scope="col">Nome</th>
                <th className="p-2 font-medium" scope="col">Finalidade</th>
                <th className="p-2 font-medium" scope="col">Duração</th>
                <th className="p-2 font-medium" scope="col">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-border/30">
                  <td className="p-2 font-mono text-xs text-foreground/90">{r.name}</td>
                  <td className="p-2 text-muted-foreground">{r.purpose}</td>
                  <td className="p-2 text-muted-foreground">{r.duration}</td>
                  <td className="p-2 text-muted-foreground">{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-10" aria-labelledby="c-ctrl">
        <h2 className="text-2xl font-bold" id="c-ctrl">Gestão de preferências</h2>
        <p className="mt-2 text-sm text-muted-foreground">Remove a escolha guardada e mostra o banner de novo (útil se mudar de dispositivo ou limpar o site com demasiada frequência — aqui fica o atalho de produto).</p>
        <div className="mt-4">
          <CookiePreferencesReopen />
        </div>
      </section>
    </div>
  );
}
