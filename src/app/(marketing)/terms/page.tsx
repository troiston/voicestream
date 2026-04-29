import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { getPublicSiteUrl } from "@/lib/public-site-url";

const LAST_UPDATED = "2026-04-25";

const toc = [
  { href: "#definicoes", label: "Definições" },
  { href: "#servico", label: "Serviço e aceitação" },
  { href: "#contas", label: "Contas, idade e segurança" },
  { href: "#pagamentos", label: "Planos, preços e pagamentos" },
  { href: "#limites", label: "Disponibilidade e limitação de responsabilidade" },
  { href: "#propriedade-intelectual", label: "Propriedade intelectual" },
  { href: "#rescisao", label: "Rescisão e suspensão" },
  { href: "#lei-aplicavel", label: "Lei aplicável e litígios" },
] as const;

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso do CloudVoice: definições, utilização do serviço, contas, pagamentos, limites, propriedade intelectual, rescisão e lei aplicável.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    url: "/terms",
    title: "Termos de Uso | CloudVoice",
    description:
      "Condições gerais de utilização da plataforma CloudVoice (captura de voz, Espaços, transcrição e tarefas).",
  },
};

export default function TermsPage() {
  const siteUrl = getPublicSiteUrl();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
      <JsonLd
        id="jsonld-breadcrumbs-terms"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${siteUrl}/` },
          { name: "Termos de Uso", url: `${siteUrl}/terms` },
        ])}
      />
      <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização:{" "}
        <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>. Leia também a{" "}
        <Link className="text-brand hover:text-brand-hover underline transition-colors decoration-dotted hover:decoration-solid" href="/privacy">
          Política de Privacidade
        </Link>
        .
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Estes Termos de Uso («Termos») regulam o acesso e a utilização do website, aplicações e
        serviços associados da marca CloudVoice («Serviço»), operados pela entidade indicada no
        website ou no contrato de prestação de serviços («nós», «nos» ou «CloudVoice»). Ao criar
        conta, subscrever um plano ou utilizar o Serviço, aceita ficar vinculado a estes Termos. Se
        não concordar, não utilize o Serviço.
      </p>

      <nav
        className="mt-8 rounded-[var(--radius-sm)] border border-dashed border-border/80 bg-surface-1/50 p-4"
        aria-label="Índice dos Termos de Uso"
      >
        <p className="text-sm font-medium text-foreground">Índice</p>
        <ol className="m-0 mt-2 list-decimal space-y-1 ps-5 text-sm text-foreground/80">
          {toc.map((item) => (
            <li key={item.href}>
              <a className="underline decoration-dotted hover:decoration-solid" href={item.href}>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-12 text-sm leading-relaxed text-muted-foreground">
        <section id="definicoes" aria-labelledby="terms-definicoes">
          <h2 className="text-2xl font-bold text-foreground" id="terms-definicoes">
            1. Definições
          </h2>
          <ul className="mt-4 list-disc space-y-2 ps-5">
            <li>
              <strong className="text-foreground">Conta:</strong> perfil autenticado que permite
              aceder ao Serviço.
            </li>
            <li>
              <strong className="text-foreground">Conteúdo do usuário:</strong> áudio, texto,
              arquivos, metadados e outras informações que carrega ou gera através do Serviço.
            </li>
            <li>
              <strong className="text-foreground">Espaço:</strong> área lógica no Serviço onde o
              Conteúdo do usuário é organizado e isolado conforme as regras do produto.
            </li>
            <li>
              <strong className="text-foreground">Plano:</strong> conjunto de funcionalidades,
              limites e preços contratados (incluindo períodos experimentais quando existam).
            </li>
          </ul>
        </section>

        <section id="servico" aria-labelledby="terms-servico">
          <h2 className="text-2xl font-bold text-foreground" id="terms-servico">
            2. Serviço e aceitação
          </h2>
          <p className="mt-4">
            O CloudVoice oferece ferramentas para captar voz, transcrever, resumir e transformar
            informação em tarefas ou fluxos de trabalho, incluindo compartilhamento em equipe quando
            ativada. O Serviço é fornecido «tal como está» e «conforme disponível», salvo garantias
            legais imperativas não excluíveis.
          </p>
          <p className="mt-4">
            Podemos alterar funcionalidades, interfaces ou dependências técnicas para manter a
            segurança, cumprir a lei ou evoluir o produto. Quando a alteração for material e
            prejudicial, procuraremos avisar com antecedência razoável (por exemplo por e-mail ou
            aviso na aplicação), sem prejuízo de alterações urgentes por motivos legais ou de
            segurança.
          </p>
        </section>

        <section id="contas" aria-labelledby="terms-contas">
          <h2 className="text-2xl font-bold text-foreground" id="terms-contas">
            3. Contas, idade e segurança
          </h2>
          <p className="mt-4">
            Compromete-se a fornecer dados de registo verdadeiros e atualizados. É responsável pela
            confidencialidade das credenciais e por toda a atividade realizada na sua Conta. Deve
            notificar-nos de imediato em caso de uso não autorizado.
          </p>
          <p className="mt-4">
            O Serviço não se destina a menores de 16 anos (ou idade superior exigida na sua
            jurisdição). Se tiver conhecimento de registo por menor, contacte{" "}
            <a className="text-brand hover:text-brand-hover underline transition-colors" href="mailto:privacidade@cloudvoice.com.br">
              privacidade@cloudvoice.com.br
            </a>
            .
          </p>
        </section>

        <section id="pagamentos" aria-labelledby="terms-pagamentos">
          <h2 className="text-2xl font-bold text-foreground" id="terms-pagamentos">
            4. Planos, preços e pagamentos
          </h2>
          <p className="mt-4">
            Os preços, moeda, impostos aplicáveis e ciclos de faturação constam da página de
            preços ou da proposta comercial. Ao subscrever um Plano pago, autoriza a cobrança
            conforme o método de pagamento indicado. Pode cancelar a renovação automática nas
            definições de faturação; o cancelamento produz efeitos no fim do período já pago,
            salvo disposição em contrário na interface ou no contrato específico.
          </p>
          <p className="mt-4">
            Reembolsos, créditos e exceções comerciais seguem a política então publicada ou acordada
            por escrito. A falta de pagamento pode implicar downgrade, suspensão ou rescisão do
            acesso a funcionalidades pagas.
          </p>
        </section>

        <section id="limites" aria-labelledby="terms-limites">
          <h2 className="text-2xl font-bold text-foreground" id="terms-limites">
            5. Disponibilidade e limitação de responsabilidade
          </h2>
          <p className="mt-4">
            Esforçamo-nos por manter o Serviço disponível, mas não garantimos acessibilidade
            ininterrupta. Manutenções programadas, falhas de redes de terceiros, casos de força
            maior ou ataques podem afetar o Serviço.
          </p>
          <p className="mt-4">
            Na máxima medida permitida pela lei aplicável, excluímos responsabilidade por lucros
            cessantes, perda de dados indirecta, danos consequenciais ou especiais, e por decisões
            tomadas com base em saídas automáticas (resumos, classificações ou sugestões), que deve
            sempre validar no contexto adequado.
          </p>
          <p className="mt-4">
            Nada nestes Termos limita responsabilidade por dolo, culpa grave, morte ou lesões
            corporais causadas por negligência nossa, ou outras situações em que a exclusão seja
            ilícita.
          </p>
        </section>

        <section id="propriedade-intelectual" aria-labelledby="terms-pi">
          <h2 className="text-2xl font-bold text-foreground" id="terms-pi">
            6. Propriedade intelectual
          </h2>
          <p className="mt-4">
            Entre si e a CloudVoice, mantém a titularidade sobre o seu Conteúdo do usuário.
            Concede-nos uma licença não exclusiva, mundial e revogável, estritamente necessária para
            operar, melhorar e proteger o Serviço (por exemplo alojamento, processamento de voz e
            texto, cópias de segurança e prevenção de abuso), nos termos da{" "}
            <Link className="text-brand hover:text-brand-hover underline transition-colors" href="/privacy">
              Política de Privacidade
            </Link>
            .
          </p>
          <p className="mt-4">
            O software, marcas, design, documentação e restantes elementos do Serviço pertencem à
            CloudVoice ou aos seus licenciadores. Não adquire qualquer direito sobre esses elementos
            para além da licença limitada de utilização do Serviço conforme estes Termos.
          </p>
        </section>

        <section id="rescisao" aria-labelledby="terms-rescisao">
          <h2 className="text-2xl font-bold text-foreground" id="terms-rescisao">
            7. Rescisão e suspensão
          </h2>
          <p className="mt-4">
            Pode encerrar a Conta a qualquer momento através das definições da aplicação ou
            contactando o suporte. Podemos suspender ou encerrar o acesso em caso de violação destes
            Termos, risco de segurança, ordem judicial ou incumprimento de pagamento.
          </p>
          <p className="mt-4">
            Após o encerramento, aplicam-se os prazos de conservação e eliminação descritos na
            Política de Privacidade e nas opções de exportação então disponíveis.
          </p>
        </section>

        <section id="lei-aplicavel" aria-labelledby="terms-lei">
          <h2 className="text-2xl font-bold text-foreground" id="terms-lei">
            8. Lei aplicável e litígios
          </h2>
          <p className="mt-4">
            Salvo norma imperativa em contrário ou cláusula específica num contrato empresarial
            assinado entre as partes, estes Termos regem-se pelas leis da República Portuguesa. Os
            tribunais da comarca de Lisboa têm jurisdição exclusiva, com renúncia a qualquer outro,
            salvo se for consumidor e a lei nacional conferir foro imperativo diferente.
          </p>
          <p className="mt-4">
            Em caso de litígio como consumidor na União Europeia, pode recorrer à plataforma europeia
            de resolução de litígios em linha (RLL) ou a entidades de resolução alternativa de
            litígios reconhecidas.
          </p>
          <p className="mt-4">
            Questões sobre estes Termos:{" "}
            <a className="text-brand hover:text-brand-hover underline transition-colors" href="mailto:legal@cloudvoice.com.br">
              legal@cloudvoice.com.br
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
