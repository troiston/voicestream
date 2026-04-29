import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { getPublicSiteUrl } from "@/lib/public-site-url";

const LAST_UPDATED = "2026-04-25";

const toc = [
  { href: "#responsavel", label: "Responsável pelo tratamento" },
  { href: "#dados", label: "Dados pessoais tratados" },
  { href: "#finalidades", label: "Finalidades do tratamento" },
  { href: "#bases-legais", label: "Bases legais (RGPD e LGPD)" },
  { href: "#conservacao", label: "Prazos de conservação" },
  { href: "#direitos", label: "Direitos dos titulares" },
  { href: "#transferencias", label: "Transferências internacionais" },
  { href: "#cookies", label: "Cookies e tecnologias similares" },
  { href: "#dpo", label: "Contato e encarregado de proteção de dados" },
] as const;

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do CloudVoice: responsável, dados tratados, finalidades, bases legais RGPD/LGPD, conservação, direitos, transferências, cookies e contato do DPO.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    url: "/privacy",
    title: "Política de Privacidade | CloudVoice",
    description:
      "Informação sobre tratamento de dados pessoais no âmbito do Regulamento (UE) 2016/679 (RGPD) e da Lei n.º 13.709/2018 (LGPD — Brasil), quando aplicável.",
  },
};

export default function PrivacyPage() {
  const siteUrl = getPublicSiteUrl();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
      <JsonLd
        id="jsonld-breadcrumbs-privacy"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${siteUrl}/` },
          { name: "Política de Privacidade", url: `${siteUrl}/privacy` },
        ])}
      />
      <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Esta Política de Privacidade descreve como a entidade que opera o serviço CloudVoice
        («CloudVoice», «nós» ou «nos») trata dados pessoais quando utiliza o nosso website,
        aplicações e serviços associados («Serviço»). O responsável pelo tratamento é a sociedade
        ou entidade identificada no website (dados societários, NIPC/NIF e sede) ou no contrato de
        prestação de serviços que celebrar connosco; em caso de divergência, prevalecem os dados
        contratuais.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Tratamos dados pessoais em conformidade com o Regulamento (UE) 2016/679 («RGPD») quando o
        Serviço se destina ou afeta pessoas singulares na União Europeia, e com a Lei Federal n.º
        13.709 de 2018 («LGPD») quando o enquadramento territorial e material da LGPD se aplicar a
        titulares no Brasil. Para titulares fora destes âmbitos, aplicam-se também princípios de
        transparência, minimização e segurança descritos abaixo.
      </p>

      <nav
        className="mt-8 rounded-[var(--radius-sm)] border border-dashed border-border/80 bg-surface-1/50 p-4"
        aria-label="Índice da Política de Privacidade"
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
        <section id="responsavel" aria-labelledby="priv-resp">
          <h2 className="text-2xl font-bold text-foreground" id="priv-resp">
            1. Responsável pelo tratamento
          </h2>
          <p className="mt-4">
            O responsável pelo tratamento decide «para que fins» e «de que forma» os seus dados
            pessoais são tratados no Serviço. Os contatos gerais constam na página{" "}
            <Link className="text-brand hover:text-brand-hover underline transition-colors" href="/contact">
              Contato
            </Link>
            . Para questões específicas de privacidade e direitos dos titulares, utilize o endereço
            indicado na secção{" "}
            <a className="text-brand hover:text-brand-hover underline transition-colors" href="#dpo">
              Contato e encarregado de proteção de dados
            </a>
            .
          </p>
        </section>

        <section id="dados" aria-labelledby="priv-dados">
          <h2 className="text-2xl font-bold text-foreground" id="priv-dados">
            2. Dados pessoais tratados
          </h2>
          <p className="mt-4">Consoante as funcionalidades que utilizar, podemos tratar, entre outros:</p>
          <ul className="mt-4 list-disc space-y-2 ps-5">
            <li>
              <strong className="text-foreground">Dados de conta e identificação:</strong> nome,
              endereço de e-mail, identificador de usuário, preferências de perfil e idioma.
            </li>
            <li>
              <strong className="text-foreground">Dados de utilização e dispositivo:</strong>
              registos técnicos (endereço IP abreviado ou pseudónimo quando possível), tipo de
              navegador, sistema operativo, data/hora de acesso e eventos de produto necessários à
              segurança e melhoria do Serviço.
            </li>
            <li>
              <strong className="text-foreground">Conteúdo de voz e derivados:</strong> gravações de
              áudio, transcrições, resumos, etiquetas e tarefas geradas a partir do seu Conteúdo,
              organizados por Espaço conforme a configuração do produto.
            </li>
            <li>
              <strong className="text-foreground">Dados de faturação:</strong> quando subscreve
              planos pagos, dados de faturação e pagamento processados pelo prestador de pagamentos
              (a CloudVoice não armazena o número completo do cartão nos seus servidores, salvo
              indicação em contrário na interface de checkout).
            </li>
            <li>
              <strong className="text-foreground">Dados de suporte:</strong> mensagens que nos envia
              por formulário ou e-mail.
            </li>
          </ul>
          <p className="mt-4">
            A voz e dados biométricos inferidos podem merecer regime reforçado em certas
            jurisdições. Avaliamos o impacto em produto e documentação de segurança e aplicamos
            medidas técnicas e organizativas adequadas.
          </p>
        </section>

        <section id="finalidades" aria-labelledby="priv-fin">
          <h2 className="text-2xl font-bold text-foreground" id="priv-fin">
            3. Finalidades do tratamento
          </h2>
          <ul className="mt-4 list-disc space-y-2 ps-5">
            <li>Prestação, manutenção e melhoria do Serviço (incluindo modelos de permissão por Espaço).</li>
            <li>Autenticação, segurança, prevenção de fraude e abuso.</li>
            <li>Faturação, gestão de subscrições e cumprimento de obrigações contabilísticas e fiscais.</li>
            <li>Comunicações operacionais (por exemplo alterações aos termos ou incidentes de segurança).</li>
            <li>Comunicações de marketing, apenas com base legal adequada (por exemplo consentimento).</li>
            <li>Cumprimento de obrigações legais e resposta a pedidos legítimos das autoridades.</li>
          </ul>
        </section>

        <section id="bases-legais" aria-labelledby="priv-bases">
          <h2 className="text-2xl font-bold text-foreground" id="priv-bases">
            4. Bases legais (RGPD e LGPD)
          </h2>
          <p className="mt-4">
            Fundamentamos o tratamento numa ou mais das seguintes bases, conforme o caso concreto:
          </p>
          <ul className="mt-4 list-disc space-y-2 ps-5">
            <li>
              <strong className="text-foreground">Execução de contrato ou diligências pré-contratuais</strong>{" "}
              (art. 6.º, n.º 1, al. b) RGPD; art. 7º, V da LGPD) — para operar a Conta, processar
              conteúdos que solicita e gerir a sua subscrição.
            </li>
            <li>
              <strong className="text-foreground">Interesses legítimos</strong> (art. 6.º, n.º 1, al.
              f) RGPD; art. 7º, IX da LGPD), equilibrados com os seus direitos — por exemplo
              deteção de incidentes, métricas agregadas de estabilidade, melhoria do produto e
              comunicação de alterações relevantes, quando não exigido consentimento específico.
            </li>
            <li>
              <strong className="text-foreground">Consentimento</strong> (art. 6.º, n.º 1, al. a)
              RGPD; art. 7º, I da LGPD) — quando ativar funcionalidades opcionais, cookies não
              essenciais ou comunicações de marketing, conforme indicado no momento da recolha.
            </li>
            <li>
              <strong className="text-foreground">Obrigação legal</strong> (art. 6.º, n.º 1, al. c)
              RGPD; art. 7º, II da LGPD) — por exemplo conservação de faturas ou resposta a ordens
              judiciais.
            </li>
          </ul>
        </section>

        <section id="conservacao" aria-labelledby="priv-cons">
          <h2 className="text-2xl font-bold text-foreground" id="priv-cons">
            5. Prazos de conservação
          </h2>
          <p className="mt-4">
            Conservamos dados apenas pelo tempo necessário às finalidades descritas, incluindo
            prazos legais de arquivo (por exemplo fiscal). Após encerramento da Conta, eliminamos ou
            anonimizamos dados num prazo razoável, salvo quando a conservação for exigida por lei
            ou para defesa de direitos em litígio. Prazos específicos por categoria podem constar
            das definições do produto (por exemplo retenção por Espaço).
          </p>
        </section>

        <section id="direitos" aria-labelledby="priv-dir">
          <h2 className="text-2xl font-bold text-foreground" id="priv-dir">
            6. Direitos dos titulares
          </h2>
          <p className="mt-4">
            Dependendo da lei aplicável, pode solicitar acesso, retificação, apagamento,
            limitação, portabilidade e oposição a tratamentos baseados em interesses legítimos, bem
            como retirar o consentimento quando o tratamento se baseie nele, sem prejudicar a
            licitude do tratamento anterior. No Brasil (LGPD), direitos equivalentes incluem
            confirmação de existência de tratamento, acesso, correção, anonimização, portabilidade,
            eliminação dos dados tratados com consentimento, informação sobre compartilhamento e revogação
            do consentimento.
          </p>
          <p className="mt-4">
            Para exercer direitos, contacte{" "}
            <a className="text-brand hover:text-brand-hover underline transition-colors" href="mailto:privacidade@cloudvoice.com.br">
              privacidade@cloudvoice.com.br
            </a>
            . Pode apresentar reclamação à autoridade de controle da sua residência, trabalho ou do
            local da infração (em Portugal, Comissão Nacional de Proteção de Dados —{" "}
            <a
              className="text-brand hover:text-brand-hover underline transition-colors"
              href="https://www.cnpd.pt"
              rel="noopener noreferrer"
              target="_blank"
            >
              cnpd.pt
            </a>
            ; no Brasil, Autoridade Nacional de Proteção de Dados —{" "}
            <a
              className="text-brand hover:text-brand-hover underline transition-colors"
              href="https://www.gov.br/anpd/"
              rel="noopener noreferrer"
              target="_blank"
            >
              gov.br/anpd
            </a>
            ).
          </p>
        </section>

        <section id="transferencias" aria-labelledby="priv-transf">
          <h2 className="text-2xl font-bold text-foreground" id="priv-transf">
            7. Transferências internacionais
          </h2>
          <p className="mt-4">
            Se utilizar fornecedores situados fora do Espço Económico Europeu ou do seu país, e
            forem transferidos dados pessoais, garantimos salvaguardas adequadas, nomeadamente
            cláusulas contratuais-tipo aprovadas pela Comissão Europeia ou decisões de adequação,
            salvo outra base legal aplicável. Informações adicionais podem ser solicitadas por
            e-mail para o endereço de privacidade.
          </p>
        </section>

        <section id="cookies" aria-labelledby="priv-cookies">
          <h2 className="text-2xl font-bold text-foreground" id="priv-cookies">
            8. Cookies e tecnologias similares
          </h2>
          <p className="mt-4">
            Utilizamos cookies e armazenamento local conforme descrito na nossa{" "}
            <Link className="text-brand hover:text-brand-hover underline transition-colors" href="/cookies">
              Política de cookies
            </Link>
            , incluindo opções de gestão de preferências quando disponíveis na aplicação.
          </p>
        </section>

        <section id="dpo" aria-labelledby="priv-dpo">
          <h2 className="text-2xl font-bold text-foreground" id="priv-dpo">
            9. Contato e encarregado de proteção de dados (DPO / DPD)
          </h2>
          <p className="mt-4">
            Para questões relacionadas com esta Política ou com o tratamento dos seus dados
            pessoais, contacte o Encarregado de Proteção de Dados / Data Protection Officer:
          </p>
          <address className="mt-4 not-italic text-foreground/90">
            <p className="m-0">
              E-mail:{" "}
              <a className="text-brand hover:text-brand-hover underline transition-colors" href="mailto:privacidade@cloudvoice.com.br">
                privacidade@cloudvoice.com.br
              </a>
            </p>
            <p className="mt-2 m-0 text-foreground/70">
              Identificação postal completa do responsável: disponível no website na secção legal
              ou mediante pedido por escrito ao endereço acima.
            </p>
          </address>
          <p className="mt-6 text-xs text-muted-foreground">
            Alterações a esta Política serão publicadas nesta página com data de revisão atualizada.
            Recomendamos consultação periódica. A utilização continuada do Serviço após alterações
            relevantes pode constituir aceitação, quando permitido pela lei aplicável.
          </p>
        </section>
      </div>
    </div>
  );
}
