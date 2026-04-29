import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";

const site = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça o CloudVoice: missão, valores, equipe e história. Redefindo o registro de voz com privacidade e contexto.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

type TeamMember = {
  initials: string;
  name: string;
  role: string;
  bio: string;
  linkedIn?: string;
};

type TimelineEvent = {
  year: string;
  month?: string;
  title: string;
  description: string;
};

const teamMembers: TeamMember[] = [
  {
    initials: "AC",
    name: "Ana Carolina Silva",
    role: "CEO & Co-Founder",
    bio: "Visionária de tecnologia de voz e contexto, com 8 anos em startups de IA. Anteriormente VP de Produto em uma plataforma de processamento de áudio.",
    linkedIn: "#",
  },
  {
    initials: "RM",
    name: "Rafael Mendes",
    role: "CTO & Co-Founder",
    bio: "Especialista em infraestrutura distribuída e processamento de tempo real. Ex-engenheiro sênior no Google Cloud Platform.",
    linkedIn: "#",
  },
  {
    initials: "BO",
    name: "Beatriz Oliveira",
    role: "Design Lead",
    bio: "Líder de design com foco em acessibilidade e experiência inclusiva. Acredita que bom design significa menos complexidade, não mais.",
    linkedIn: "#",
  },
  {
    initials: "LC",
    name: "Lucas Costa",
    role: "Senior Engineer",
    bio: "Desenvolvedor full-stack apaixonado por escalabilidade. Contribuidor ao Next.js e especialista em otimização de performance.",
    linkedIn: "#",
  },
  {
    initials: "MS",
    name: "Mariana Santos",
    role: "Product Manager",
    bio: "Estrategista de produto com background em metodologias ágeis. Focada em entender problemas reais de usuários antes de qualquer código.",
    linkedIn: "#",
  },
];

const timeline: TimelineEvent[] = [
  {
    year: "2024",
    month: "Jan",
    title: "Exploração de Oportunidade",
    description: "Identificamos um padrão em profissionais: a necessidade de manter contextos separados enquanto registram conversas. CloudVoice nasce da pergunta: e se a voz fosse organizada como o pensamento?",
  },
  {
    year: "2024",
    month: "Jun",
    title: "Protótipo Funcional",
    description: "Primeiros usuários beta testam a capacidade de organizar anotações por Espaço. Feedback: simplicidade é o superpower.",
  },
  {
    year: "2025",
    month: "Mar",
    title: "Especificação & Design",
    description: "Finalizamos a arquitetura de privacidade, design system e padrões de UX. Landing page e painel mock publicados.",
  },
  {
    year: "2025",
    month: "Nov",
    title: "Série de Beta Privada",
    description: "Onboarding de 500 usuários selecionados. Validação de problem-market fit em paralelo.",
  },
  {
    year: "2026",
    month: "Abr",
    title: "Integrações & Pipeline de Voz",
    description: "Lançamento do pipeline de transcrição em tempo real, integrações com Slack, Google Workspace e Notion.",
  },
  {
    year: "2026",
    month: "Jun",
    title: "Disponibilidade Geral",
    description: "CloudVoice sai do beta. Suporte para SSO, relatórios avançados e API de terceiros ao vivo.",
  },
];

const pressOutlets = [
  { name: "TechCrunch Brasil", role: "A startup que quer reimaginar como as empresas capturam ideias" },
  { name: "Startups.com.br", role: "CloudVoice levanta R$2M em seed para revolucionar capturas de voz" },
  { name: "Pequenas Empresas & Grandes Negócios", role: "Ferramenta gratuita ajuda profissionais a organizar anotações em voz" },
];

export default function AboutPage() {
  const s = site();
  return (
    <div className="bg-background">
      <JsonLd
        id="jsonld-bc-about"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${s}/` },
          { name: "Sobre", url: `${s}/about` },
        ])}
      />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-glow-hero px-4 pt-20 pb-12 sm:px-6 sm:pt-24"
        aria-labelledby="about-hero"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 id="about-hero" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Organizando o pensamento{" "}
            <span className="gradient-text">em voz</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            CloudVoice reimagina como profissionais e equipes capturam, organizam e executam ideias a partir de conversas. Privacidade, contexto e simplicidade em primeiro lugar.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6" aria-labelledby="mission">
        <div>
          <h2 id="mission" className="text-3xl font-extrabold tracking-tight">
            Nossa <span className="gradient-text">Missão</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Democratizar a capacidade de capturar, organizar e agir sobre conversas de forma privada e inteligente. Queremos que cada profissional sinta-se dono do seu registro de voz.
          </p>

          {/* Pull Quote */}
          <blockquote className="mt-8 border-l-4 border-brand pl-6 py-2 italic text-xl text-muted-foreground">
            <p className="gradient-text">
              &ldquo;A melhor nota é aquela que você captura sem pensar. A melhor ferramenta é a que sai do caminho.&rdquo;
            </p>
          </blockquote>

          <h3 className="mt-12 text-2xl font-bold tracking-tight">Valores que nos guiam</h3>
          <ul className="mt-6 space-y-4">
            {[
              {
                title: "Claridade",
                desc: "Decidir com base no que foi ouvido, não no que faltou reter. Transcrições precisas antes de resumos.",
              },
              {
                title: "Limiar de Atenção",
                desc: "Ações propostas apenas com requisitos e contexto explícitos. Sem alucinações, sem ruído.",
              },
              {
                title: "Contexto, não Pânico",
                desc: "Cada Espaço (projeto, cliente, time) tem suas próprias regras de memória e compartilhamento.",
              },
              {
                title: "Transparência em Segurança",
                desc: "Você sabe exatamente o que a máquina guarda, por quanto tempo e com quem pode compartilhar.",
              },
            ].map((v) => (
              <li key={v.title} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{v.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-t border-border/40 bg-surface-1/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-center">
            A equipe por <span className="gradient-text">trás</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Pessoas apaixonadas por resolver problemas reais. Experiência em plataformas de IA, infraestrutura e produto.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div
                key={member.initials}
                className="glass-card flex flex-col rounded-[var(--radius-lg)] p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full bg-brand/15 text-brand flex items-center justify-center text-xl font-bold">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-brand font-medium">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                {member.linkedIn && (
                  <a
                    href={member.linkedIn}
                    className="mt-4 text-xs text-brand hover:text-brand-hover transition-colors"
                  >
                    Perfil LinkedIn →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6" aria-labelledby="timeline">
        <h2 id="timeline" className="text-3xl font-extrabold tracking-tight">
          Nossa <span className="gradient-text">Jornada</span>
        </h2>

        <div className="mt-12 relative pl-6 border-l-2 border-brand/30">
          {timeline.map((event, idx) => (
            <div key={`${event.year}-${event.month || "full"}`} className="mb-8">
              <div className="absolute -left-4 top-0 h-6 w-6 rounded-full bg-brand border-4 border-background" />
              <div className="ml-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-brand">{event.year}</span>
                  {event.month && <span className="text-xs text-muted-foreground">{event.month}</span>}
                </div>
                <h3 className="mt-1 font-semibold text-foreground">{event.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Press Section */}
      <section className="border-t border-border/40 bg-surface-1/40 px-4 py-20 sm:px-6" aria-labelledby="press">
        <div className="mx-auto max-w-3xl">
          <h2 id="press" className="text-3xl font-extrabold tracking-tight text-center">
            Mencionado pela <span className="gradient-text">mídia</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Confira o que analistas e jornalistas têm dito sobre CloudVoice.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {pressOutlets.map((outlet) => (
              <div
                key={outlet.name}
                className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4"
              >
                <p className="font-semibold text-brand text-sm">{outlet.name}</p>
                <p className="mt-3 text-xs text-muted-foreground">{outlet.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">Tem uma pergunta sobre CloudVoice?</p>
            <Link
              href="mailto:imprensa@cloudvoice.com.br"
              className="mt-2 inline-flex items-center text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              Fale com nossa equipe de imprensa →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
