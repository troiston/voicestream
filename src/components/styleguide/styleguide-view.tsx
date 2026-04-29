import Image from "next/image";
import type { ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { DataTable } from "@/components/ui/data-table";
import { DenseMenu } from "@/components/ui/dense-menu";
import { SimpleDialog } from "@/components/ui/dialog-frame";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleSheet } from "@/components/ui/simple-sheet";
import { SimpleTabs } from "@/components/ui/simple-tabs";
import { Spinner } from "@/components/ui/spinner";
import { SwitchControl } from "@/components/ui/switch-control";
import { Textarea } from "@/components/ui/textarea";

const TOC: ReadonlyArray<{ id: string; label: string }> = [
  { id: "guia", label: "Sobre" },
  { id: "cores", label: "Cores" },
  { id: "tipografia", label: "Tipografia" },
  { id: "botoes", label: "Botões" },
  { id: "badges", label: "Badges" },
  { id: "utilitarios", label: "Utilitários" },
  { id: "cards", label: "Cards" },
  { id: "tokens", label: "Tokens" },
  { id: "espacamento", label: "Espaçamento" },
  { id: "formularios", label: "Formulários" },
  { id: "feedback", label: "Feedback" },
  { id: "navegacao", label: "Navegação" },
  { id: "dados", label: "Dados" },
  { id: "sobreposicoes", label: "Sobreposições" },
  { id: "espacos", label: "Espaços" },
  { id: "painel", label: "Painel" },
  { id: "gravacao", label: "Gravação" },
  { id: "marca", label: "Logos" },
  { id: "movimento", label: "Motion" },
];

const COLOR_TOKENS = [
  { name: "background", var: "--background" },
  { name: "foreground", var: "--foreground" },
  { name: "surface-1", var: "--surface-1" },
  { name: "surface-2", var: "--surface-2" },
  { name: "surface-3", var: "--surface-3" },
  { name: "brand", var: "--brand" },
  { name: "info", var: "--info" },
  { name: "success", var: "--success" },
  { name: "warning", var: "--warning" },
  { name: "danger", var: "--danger" },
  { name: "muted", var: "--muted" },
  { name: "border", var: "--border" },
];

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  description?: string;
};

function Section({ id, title, children, description }: SectionProps) {
  return (
    <section
      className="scroll-mt-24 space-y-4 border-b border-border/50 pb-16"
      id={id}
      aria-labelledby={`${id}-h`}
    >
      <h2
        className="text-[length:var(--text-2xl)] font-semibold tracking-tight"
        id={`${id}-h`}
      >
        {title}
      </h2>
      {description ? <p className="text-foreground/70 text-[length:var(--text-sm)]">{description}</p> : null}
      {children}
    </section>
  );
}

export function StyleguideView() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-0 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:gap-10">
      <div className="lg:sticky lg:top-24 lg:w-52 lg:shrink-0">
        <nav aria-label="Nesta página" className="rounded-[var(--radius-lg)] border border-border bg-surface-1 p-3">
          <p className="text-sm font-semibold">Índice</p>
          <ol className="mt-2 space-y-1 text-sm">
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  className="text-foreground/60 underline-offset-2 hover:underline"
                  href={`#${item.id}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="min-w-0 flex-1 space-y-16" id="styleguide-main" tabIndex={-1}>
        <div className="space-y-2" id="guia">
          <h1 className="text-[length:var(--text-3xl)] font-extrabold tracking-tight">
            Guia de estilos
          </h1>
          <p className="text-foreground/60 text-[length:var(--text-lg)]">
            Referência viva do Design System (Fase 1D) — em português (pt-BR). O objetivo é
            aprovar o &ldquo;preview&rdquo; antes de avançar para a especificação técnica.
          </p>
        </div>

        <Section
          id="cores"
          title="Sistema de Cores"
          description="Swatches dos tokens CSS principais. Cada cor é derivada de OKLCH e responde ao tema claro/escuro."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {COLOR_TOKENS.map((c) => (
              <div key={c.name} className="space-y-2">
                <div
                  className="h-24 rounded-[var(--radius-lg)] border border-border shadow-sm"
                  style={{ background: `var(${c.var})` }}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.var}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="tipografia"
          title="Tipografia"
          description="Escala fluida e responsiva. Hierarquia clara com tamanhos que se adaptam ao viewport."
        >
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">--text-4xl</p>
                  <h3 className="text-[length:var(--text-4xl)] font-extrabold tracking-tight">
                    Título principal máxima hierarquia
                  </h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">--text-3xl</p>
                  <h3 className="text-[length:var(--text-3xl)] font-bold tracking-tight">
                    Seção bloco importante
                  </h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">--text-2xl</p>
                  <h4 className="text-[length:var(--text-2xl)] font-semibold">
                    Subsseção contexto local
                  </h4>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">--text-lg</p>
                  <p className="text-[length:var(--text-lg)] text-foreground/90">
                    Destaque ênfase em parágrafo importante; leitura cómoda.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">--text-base</p>
                  <p className="text-[length:var(--text-base)] text-foreground/80">
                    Corpo texto padrão; tamanho responsivo e fluido; acessível em qualquer tela.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">--text-sm</p>
                  <p className="text-[length:var(--text-sm)] text-foreground/70">
                    Suporte rótulos, metadados e informação secundária em UI densos.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">--text-xs</p>
                  <p className="text-[length:var(--text-xs)] text-foreground/50">
                    Legenda datas, horas, refs não use para conteúdo importante.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          id="botoes"
          title="Botões"
          description="Variantes de botão com todos os sizes: primary, outline, ghost, danger, link."
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Tamanho padrão (h-9)</p>
              <div className="flex flex-wrap gap-3">
                <Button>Primário</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Perigo</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Pequeno (h-8)</p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Primário</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="secondary" size="sm">Secundário</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="danger" size="sm">Perigo</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Grande (h-10)</p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg">Primário</Button>
                <Button variant="outline" size="lg">Outline</Button>
                <Button variant="secondary" size="lg">Secundário</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Ícone</p>
              <div className="flex flex-wrap gap-3">
                <Button size="icon">+</Button>
                <Button size="icon-sm">+</Button>
                <Button size="icon-xs">+</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Estados</p>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Desativado</Button>
                <Button isLoading loadingLabel="Carregando">Carregando</Button>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="badges"
          title="Badges"
          description="Etiquetas com variantes semânticas: default, success, info, warning, danger, outline, muted."
        >
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="muted">Muted</Badge>
            <Badge variant="success">Sucesso</Badge>
            <Badge variant="info">Informação</Badge>
            <Badge variant="warning">Aviso</Badge>
            <Badge variant="danger">Perigo</Badge>
            <Badge variant="destructive">Destrutivo</Badge>
          </div>
        </Section>

        <Section
          id="utilitarios"
          title="Classes Utilitárias"
          description="Helpers visuais reutilizáveis: glass-card, gradient-text, glow-accent, btn-gradient."
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">glass-card</p>
              <div className="glass-card rounded-lg p-6">
                <p className="text-foreground">Superfície translúcida com blur padrão para painéis e cards.</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">gradient-text</p>
              <p className="gradient-text text-2xl font-bold">Texto com gradiente indigo para violet</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">gradient-border</p>
              <div className="gradient-border rounded-lg p-4">
                <p className="text-sm text-foreground">Borda com gradiente usando background-clip.</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">glow-accent</p>
              <div className="glow-accent rounded-lg bg-surface-2 p-6">
                <p className="text-foreground">Elemento com sombra brilhante de destaque.</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">btn-gradient</p>
              <button className="btn-gradient rounded-lg px-6 py-3 font-medium">
                Botão com Gradiente
              </button>
            </div>
          </div>
        </Section>

        <Section
          id="cards"
          title="Cards"
          description="Componente Card com header, content, footer múltiplos layouts."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Simples</CardTitle>
                <CardDescription>Com título e descrição</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">Conteúdo do card suporta qualquer elemento React.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Com Footer</CardTitle>
                <CardDescription>Rodapé para ações</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">Conteúdo principal aqui.</p>
              </CardContent>
              <div className="border-t border-border/50 p-4 flex gap-2">
                <Button size="sm">Ação 1</Button>
                <Button size="sm" variant="outline">Ação 2</Button>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          id="tokens"
          title="Tokens (OKLCH)"
          description="Valores copiáveis dos tokens CSS. Superfícies, semântica, sombras e raios."
        >
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              { name: "background", css: "var(--background)" },
              { name: "foreground", css: "var(--foreground)" },
              { name: "brand", css: "var(--brand)" },
              { name: "info", css: "var(--info)" },
              { name: "success", css: "var(--success)" },
              { name: "warning", css: "var(--warning)" },
              { name: "danger", css: "var(--danger)" },
              { name: "border", css: "var(--border)" },
              { name: "muted", css: "var(--muted)" },
            ].map((t) => (
              <div
                key={t.name}
                className="glass-card rounded-lg p-3 space-y-1"
              >
                <p className="text-xs font-medium text-foreground">{t.name}</p>
                <code className="text-xs text-muted-foreground break-all font-mono">{t.css}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="espacamento"
          title="Espaçamento, raios e sombras"
          description="Material: superfícies em camadas. Linear: densidade e bordas finas. Use gap-4/6 para seções, p-4/p-6 em painéis e --radius-md em controles."
        >
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/80">
            <li>Elevação leve: --shadow-sm para separar camadas sem exagero</li>
            <li>Destaque: --shadow-md para painel lateral ou sheet com foco</li>
            <li>Raios: radius-md em campos, radius-lg em cards</li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <div
              className="h-24 w-32 rounded-[var(--radius-sm)] border border-dashed border-border/60 p-2 text-xs text-foreground/50"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              shadow-sm
            </div>
            <div
              className="h-24 w-32 rounded-[var(--radius-lg)] border border-border/60 p-2 text-xs text-foreground/50"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              shadow-md
            </div>
          </div>
        </Section>

        <Section id="formularios" title="Formulários" description="Input, área, seleção, checkbox e interruptor.">
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              name="ex-email"
              label="E-mail"
              type="email"
              placeholder="voce@exemplo.com"
            />
            <Textarea
              name="ex-nota"
              label="Anotação"
              placeholder="Escreva o contexto da reunião…"
              rows={3}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="ex-sel">
                Projetou/Espaço
              </label>
              <select
                id="ex-sel"
                className="h-12 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm"
              >
                <option>Equipe interna</option>
                <option>Cliente Nordic Bank</option>
                <option>Parceiro Studio 12</option>
              </select>
            </div>
            <div className="space-y-4">
              <CheckboxField
                id="ex-cb-1"
                name="c1"
                label="Concordo com o registro de áudio neste Espaço"
                description="Alinhado ao princípio de consentimento explícito (PRD / privacidade)."
              />
              <SwitchControl label="Notificações de resumo por e-mail" defaultChecked />
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium">Botões</p>
              <div className="flex flex-wrap gap-3">
                <Button>Primário</Button>
                <Button variant="secondary" type="button">Secundário</Button>
                <Button variant="ghost" type="button">Contorno mínimo</Button>
                <Button variant="danger" type="button">Destrutivo</Button>
                <Button isLoading loadingLabel="Salvando" type="button" />
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="feedback"
          title="Feedback (alertas e pistas)"
          description="Não usamos lib de toast para mensagens persistentes, prefira Alert."
        >
          <div className="space-y-3">
            <Alert
              variant="info"
              title="Em fila"
              description="O resumo será processado após a transcrição (estimativa mock)."
            />
            <p className="text-sm text-foreground/60">
              Toast efêmero: opcional em SPEC; hoje, documentamos intenção via alerta in-line para não
              acrescentar dependências.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface-1 p-4">
                <span className="text-sm">Carregando</span>
                <Spinner label="Processando" />
              </div>
              <div className="space-y-2 rounded-[var(--radius-lg)] border border-border p-4">
                <p className="text-sm font-medium">Conteúdo a carregar (skeleton)</p>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="navegacao"
          title="Navegação densa"
          description="Abas para alternância local; dropdown com details (sem lib)."
        >
          <SimpleTabs
            items={[
              {
                id: "a",
                label: "Espaço",
                content: <p>Contexto do time e regras de acesso (mock).</p>,
              },
              {
                id: "b",
                label: "Ações",
                content: <p>Lista densa de automações (mock) padrão Linear: compacto, escaneável.</p>,
              },
            ]}
          />
          <div className="mt-6">
            <DenseMenu label="Menu (mock)" />
          </div>
        </Section>

        <Section id="dados" title="Dados" description="Tabelas e etiquetas.">
          <DataTable
            rowKey={(r) => r.id}
            aria-label="Exemplo de tabela densa"
            columns={[
              { key: "a", header: "Espaço", cell: (r) => r.esp },
              { key: "b", header: "Estado", cell: (r) => r.estado },
              { key: "c", header: "Etiqueta", cell: (r) => <Badge>{r.tipo}</Badge> },
            ]}
            rows={[
              { id: "1", esp: "Vendas B2B", estado: "Ativo", tipo: "E2EE" },
              { id: "2", esp: "Suporte L1", estado: "Atenção", tipo: "Backlog" },
            ]}
          />
        </Section>

        <Section id="sobreposicoes" title="Sobreposições" description="Diálogo (modal) e painel lateral.">
          <div className="flex flex-wrap gap-4">
            <SimpleDialog
              trigger="Abrir diálogo informativo"
              title="Confirmar envio de resumo"
              description="Esta ação notifica o time selecionado (mock)."
              confirmLabel="Enviar"
            >
              <p className="text-sm text-foreground/80">Nenhum dado é gravado fora do Espaço (ADR-0003).</p>
            </SimpleDialog>
            <SimpleDialog
              trigger="Ação destrutiva (mock)"
              title="Excluir trecho de transcrição"
              description="A exclusão remove o trecho e referências (mock)."
              confirmLabel="Excluir"
              variant="danger"
            >
              <p className="text-sm text-foreground/80">Confirmação clara, sem eufemismos; fluxo a detalhar na SPEC.</p>
            </SimpleDialog>
            <SimpleSheet sideLabel="Abrir painel" title="Detalhes (mock)">
              <p>Conteúdo denso, estilo painel de contexto.</p>
            </SimpleSheet>
          </div>
        </Section>

        <Section
          id="espacos"
          title="Espaços (padrão de produto)"
          description="Cores e regras E2EE em nível informativo (ADR-0004)."
        >
          <div className="flex flex-wrap gap-2">
            <Badge>Produção</Badge>
            <Badge variant="warning">Homologação</Badge>
            <Badge variant="muted">Somente leitura</Badge>
            <Badge variant="outline" className="text-xs">
              E2EE: chaves por Espaço
            </Badge>
          </div>
          <p className="text-sm text-foreground/60">
            Visual neutro: destaque de produção vem de contexto e políticas, não de sinal
            berrante. Homolog/staging: warning e borda, sem competir com o conteúdo.
          </p>
        </Section>

        <Section
          id="painel"
          title="Painel de ações (autonomia, mock)"
          description="Mapeado ao ADR-0003: estado visível, confirmação, recuperação de erro."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: "Inativo", d: "Ações disponíveis, sem execução em andamento" },
              { t: "Executando", d: "Bloqueio local no que for necessário + rota de progresso" },
              { t: "Solicitando dado", d: "Não anunciar tudo com modal: formulário in-line" },
              { t: "Falha", d: "Causa provável, retry e link para o Espaço" },
            ].map((x) => (
              <Card key={x.t} className="p-0">
                <CardHeader>
                  <CardTitle className="text-base">{x.t}</CardTitle>
                  <CardDescription>{x.d}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          id="gravacao"
          title="Gravação e microfone (mock)"
          description="Cópia e estados acessíveis, sem lógica real ainda."
        >
          <div
            className="rounded-[var(--radius-lg)] border border-amber-500/40 bg-warning/10 p-4"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium">Gravando (demonstração)</p>
            <p className="text-sm text-foreground/80">
              Indicar ao usuário o que fica no Espaço e o que nunca deixa o dispositivo, quando
              a SPEC estiver congelada.
            </p>
          </div>
        </Section>

        <Section id="marca" title="Candidatos de logótipo" description="Compare em contexto.">
          <ul className="mb-4 list-disc pl-5 text-sm text-foreground/70">
            <li>Escolha: legibilidade, contraste, originalidade, encaixe com navbar</li>
            <li>Integrado no site: logo-01 na barra de navegação (marca definitiva)</li>
          </ul>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, n) => {
              const i = n + 1;
              const numpad = i < 10 ? `0${i}` : `${i}`;
              return (
                <li
                  key={i}
                  className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-1 p-2"
                >
                  <Image
                    className="h-16 w-full object-contain"
                    width={200}
                    height={80}
                    src={`/brand/logos/logo-${numpad}.png`}
                    alt={`Candidato de logo ${i}`}
                    sizes="(max-width: 768px) 40vw, 20vw"
                  />
                  <p className="mt-2 text-center text-xs text-foreground/60">logo-{numpad}</p>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          id="movimento"
          title="Motion e preferência do sistema"
          description="Animar só opacity e transform. Respeite prefers-reduced-motion (constituição e CSS)."
        >
          <p className="text-sm text-foreground/60">
            No Tailwind, prefixe padrão com motion-safe: (ex. micro-transições). Para
            usuários com redução, use motion-reduce:transition-none (ex.: interruptor).
          </p>
          <div
            className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground motion-safe:transition motion-safe:duration-200 motion-safe:hover:scale-[1.01] motion-safe:active:scale-[0.99] motion-reduce:transform-none"
          >
            Passe o rato (or foco) ligeiro aumento, só em motion-safe
          </div>
        </Section>
      </div>
    </div>
  );
}
