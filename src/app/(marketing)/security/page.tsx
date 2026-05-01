import type { Metadata } from "next";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { Card } from "@/components/ui/card";
import { getPublicSiteUrl } from "@/lib/public-site-url";

const LAST_UPDATED = "2026-04-20";

const pillars = [
  { title: "Encriptação em trânsito e em repouso", text: "TLS 1.2+ para API e aplicação; arquivos de áudio encriptados em armazenamento (descrição de alvo, não oferta pública ainda)." },
  { title: "Isolamento e RBAC", text: "Espaços, papéis e trilha de auditoria por ação. O MVP ainda não liga a um IdP; o modelo está preparado no design." },
  { title: "Mínimização e portabilidade", text: "Retenção configurável; export (CSV/JSON) previsto; minimização de PII fora de escopo operacional claro." },
] as const;

const subprocessors: { name: string; purpose: string; region: string }[] = [
  { name: "Fornecedor de alojamento (MVP mock)", purpose: "Infraestrutura, cópias de segurança", region: "UE" },
  { name: "Fornecedor de e-mail (MVP mock)", purpose: "Convites, alertas, magic links (quando ativos)", region: "UE" },
  { name: "Fornecedor de analytics (opcional, mock)", purpose: "Agregado de tráfego sem cross-site advertising", region: "UE" },
];

export const metadata: Metadata = {
  title: "Segurança e confiança",
  description:
    "Pilares de segurança, certificações em roteiro, subprocessadores e contato de segurança (VoiceStream).",
  alternates: { canonical: "/security" },
  openGraph: { url: "/security" },
};

export default function SecurityPage() {
  const siteUrl = getPublicSiteUrl();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
      <JsonLd
        id="jsonld-breadcrumbs-security"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${siteUrl}/` },
          { name: "Segurança", url: `${siteUrl}/security` },
        ])}
      />
      <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Segurança e confiança</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: {LAST_UPDATED}. Isto descreve intenção de produto e requisitos de design, não
        ainda acordos ou relatórios formais.
      </p>
      <nav
        className="mt-8 rounded-[var(--radius-sm)] border border-dashed border-border/80 bg-surface-1/50 p-4"
        aria-label="Índice"
      >
        <p className="text-sm font-medium text-foreground">Nesta página</p>
        <ol className="m-0 mt-2 list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
          <li>
            <a className="underline decoration-dotted" href="#pilares">
              Pilares
            </a>
          </li>
          <li>
            <a className="underline decoration-dotted" href="#certificacoes">
              Certificações
            </a>
          </li>
          <li>
            <a className="underline decoration-dotted" href="#subprocessadores">
              Subprocessadores
            </a>
          </li>
          <li>
            <a className="underline decoration-dotted" href="#contato">
              Reportar um problema
            </a>
          </li>
        </ol>
      </nav>
      <section className="mt-10" id="pilares" aria-labelledby="sec-pil">
        <h2 className="text-2xl font-bold" id="sec-pil">
          Pilares
        </h2>
        <ul className="m-0 mt-4 list-none space-y-4 p-0">
          {pillars.map((p) => (
            <li key={p.title}>
              <Card className="p-4">
                <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                <p className="m-0 mt-2 text-sm text-muted-foreground">{p.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12" id="certificacoes" aria-labelledby="sec-cer">
        <h2 className="text-2xl font-bold" id="sec-cer">
          Certificações
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A equipe acompanha ISO 27001 / SOC2 como alvos de roteiro; ainda <strong>não</strong> há
          emblemas formais. Quando a auditoria existir, esta secção liga a relatórios e datas.
        </p>
      </section>
      <section className="mt-12" id="subprocessadores" aria-labelledby="sec-sub">
        <h2 className="text-2xl font-bold" id="sec-sub">
          Subprocessadores
        </h2>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">Lista informativa (MVP) — ajuste antes de tráfego de dados pessoais real.</p>
        <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-border/60">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
            <caption className="px-2 py-2 text-xs text-muted-foreground">Subprocessadores informativos</caption>
            <thead className="border-b border-border/60 bg-surface-1/30">
              <tr>
                <th className="p-2 font-medium" scope="col">Nome</th>
                <th className="p-2 font-medium" scope="col">Finalidade</th>
                <th className="p-2 font-medium" scope="col">Região</th>
              </tr>
            </thead>
            <tbody>
              {subprocessors.map((s) => (
                <tr key={s.name} className="border-b border-border/30">
                  <td className="p-2 text-foreground/90">{s.name}</td>
                  <td className="p-2 text-muted-foreground">{s.purpose}</td>
                  <td className="p-2 text-muted-foreground">{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-12" id="contato" aria-labelledby="sec-co">
        <h2 className="text-2xl font-bold" id="sec-co">
          Reportar um problema
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          E-mail:{" "}
          <a className="min-h-11 text-brand hover:text-brand-hover underline transition-colors" href="mailto:security@voicestream.com.br">
            security@voicestream.com.br
          </a>{" "}
          (fila de triagem, sem SLA pública nesta fase).
        </p>
      </section>
    </div>
  );
}
