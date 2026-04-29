# 05_DESIGN.md — Design System (Fase 1D)

> **Status:** Em andamento  
> **Objetivo desta fase:** definir o contrato de UI/UX (tokens + componentes + padrões) e deixar um **preview visual aprovável** para liberar o gate de entrada da SPEC (`docs/06_SPECIFICATION.md`).

---

## Resultado esperado (o que “pronto” significa)

Ao final da Fase 1D, devem existir:

- **Tokens em OKLCH** com light/dark e mapeamento para Tailwind v4 via `@theme`.
- **Tipografia fluida** (escala em `clamp()`), com exemplos no styleguide.
- **Spacing, radii e sombras** definidos como tokens e usados em componentes base.
- **Componentes base** (estilo shadcn/ui, minimalista) com estados e acessibilidade WCAG 2.2 AA.
- **Styleguide navegável** em `src/app/(marketing)/styleguide/` (página + *layout* com *skip* e `StyleguideView`) com **índice interno**, tudo em **pt-BR** e com secções: tokens, tipografia, espaçamento, form, feedback, dados, sobreposições, padrões *Espaços* / *Painel*, gravação, motion, grelha de logótipos.
- Definição objetiva do que é **“preview aprovado”** (checklist + capturas de tela a coletar).

**Revisão 2026-04:** a landing, blocos de marketing, auth e o painel receberam **cópia e hierarquia** alinhadas ao PRD, sem implementar lógica de negócio (continua a valer: **sem feature real** fora do contrato da SPEC). Ver também `docs/INTERNAL_DESIGN_QA.md` (Onda 0, resumo de i18n/SEO/a11y).

---

## Onde fica o preview (fonte de verdade visual)

- **Styleguide**: `src/app/(marketing)/styleguide/page.tsx` + `layout.tsx` (descobrível: link **só em desenvolvimento** na *navbar*, rota pública ainda *noindex*).
- **Vista (conteúdo)**: `src/components/styleguide/styleguide-view.tsx`
- **Tokens (CSS)**: `src/app/globals.css` (também `::backdrop` para `<dialog>`)

> O styleguide é a “sala de inspeção” do design: tudo o que for padrão (tokens, componentes, estados) deve aparecer aqui antes de ir para implementação pesada.

## Marca e ícones

- **Candidatos (histórico)**: `public/brand/logos/logo-01.png` … `logo-10.png` (ver `public/brand/brief-logos.md`).
- **Marca definitiva: `logo-01.png`**, fundo transparente, na *navbar* (`/brand/logos/...`); ficheiro base também em `src/app/icon.png` e `src/app/apple-icon.png` (metadados gerados pelo Next).
- **Open Graph** (`src/app/opengraph-image.tsx`): composição 1200×630 com o mesmo *asset* (logo-01) sobre o cartão, alinhada ao ton CloudVoice.

---

## Tokens (OKLCH) + light/dark

### Princípios

- **OKLCH como fonte de verdade**: todas as cores definidas em `oklch(L% C H)` para consistência perceptual e suporte wide-gamut.
- **Light/dark**: padrão **Sistema** (`next-themes` + classe `dark` no `<html>`), com **toggle** na *navbar* / *header*; o utilizador pode forçar claro ou escuro e repor a preferência com **Sistema** após um tema explícito.
- **Semântica primeiro**: tokens nomeados por papel (background, foreground, border, success, danger…), não por cor (“blue-500”).
- **Híbrido Material-ish + Linear**: densidade e clareza (B2B), com superfícies em camadas e “calor” sutil (sem parecer genérico).

### Tokens implementados (mínimo)

Definidos em `src/app/globals.css`:

- **Core**: `--background`, `--foreground`
- **Surfaces (camadas)**: `--surface-1`, `--surface-2`, `--surface-3`
- **Neutral**: `--muted`, `--muted-foreground`, `--border`, `--ring`
- **Accent**: `--accent`, `--accent-foreground`
- **Semantic**: `--info`, `--success`, `--warning`, `--danger`
- **Elevation**: `--shadow-sm`, `--shadow-md`
- **Radii**: `--radius-sm`, `--radius-md`, `--radius-lg`

E mapeados para Tailwind via:

- `@theme inline { --color-foreground: var(--foreground); ... }`

---

## Tipografia (fluid type com clamp)

### Regras

- **Uma escala fluida** baseada em `clamp(min, preferred, max)`.
- **Body**: `line-height` 1.6 (leitura), headings com tracking leve e peso maior.
- **Sem media queries para font-size**: a escala cresce de forma contínua.

### Tokens implementados (mínimo)

Em `src/app/globals.css`:

- `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`, `--text-4xl`

> O styleguide demonstra o uso via classes do tipo `text-[length:var(--text-base)]` (e.g. `--text-sm`, `--text-lg`).

---

## Spacing, radii e sombras

### Spacing

- **Tailwind spacing scale** segue como base (padrão do framework).
- Para componentes-chave, usamos padrões consistentes:
  - **Alturas**: inputs e botões com `h-12` (44px+ touch target)
  - **Containers**: cards e blocos com `p-4` (base) / `p-6` (seção)
  - **Gaps**: `gap-2` (micro), `gap-3/4` (padrão), `gap-6` (seções)

### Radii

- `--radius-sm` (controles pequenos)
- `--radius-md` (inputs, campos)
- `--radius-lg` (cards, painéis)

Diretriz de estilo:

- **Bordas suaves, sem “pílula” por padrão**: preferir `radius-md` em botões/inputs e `radius-lg` em cards/painéis.
- **Elevação sutil**: sombras apenas para separar camadas; evitar “card flutuando” em toda UI.

### Sombras

- `--shadow-sm` para delinear elevação leve sem “sujar” o layout.
- `--shadow-md` reservado para elementos proeminentes (modais/painéis).

---

## Componentes base (estilo shadcn/ui, sem dependências extras)

> Meta: ter componentes “suficientemente bons” para alinhar visual + estados + a11y, sem introduzir acoplamento prematuro.

Implementados em `src/components/ui/`:

- `Button`
  - Variantes: `primary`, `secondary`, `ghost`, `danger`
  - Estados: default, hover/focus, disabled, loading (`aria-busy`)
- `Input`
  - A11y: `label` obrigatório, `aria-describedby` para hint/erro, `aria-invalid`
- `Textarea` (mesma superfície de erro/hint)
- `Badge` (variante semântica leve, sem *chip* acessível ainda mapeado a dados vivos)
- `CheckboxField` (checkbox + texto)
- `SwitchControl` (interruptor, `role="switch"`, client)
- `DataTable` (tabela densa, `aria-label`, cabeçalho sem `role` redundante)
- `SimpleDialog` (`dialog-frame.tsx`) + `SimpleSheet` + `SimpleTabs` (client, HTML nativo; sem Radix, sem dependências adicionais)
- `DenseMenu` (menu denso, `<details>` + *links* mock)
- `Alert`
  - Variantes: info/success/warning/danger (uso como status/feedback)
- `Card` (+ subcomponentes de layout)
- `Spinner` (texto + indicador)
- `Skeleton`

### Estados obrigatórios (contrato do projeto)

Toda tela/feature deve explicitar:

- **Loading**: feedback imediato e claro (não só skeleton decorativo).
- **Empty**: explicar por que está vazio e qual é o próximo passo.
- **Error**: mensagem acionável + recuperação (retry/contato/voltar).
- **Success**: confirmação sucinta (sem bloquear fluxo).

O styleguide reúne exemplos mínimos de **loading** (spinner, skeleton) e pistas vazias/empty, além de *alert* e documentação de **toast** (hoje, preferência: `Alert` in-line, sem *toast* library).

---

## Acessibilidade (WCAG 2.2 AA) — baseline

Checklist mínimo aplicado aos componentes base:

- **Foco visível consistente**: `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` em controles interativos.
- **Touch targets**: controles principais com altura mínima ~44px.
- **Labels**: inputs sempre com label associada (`htmlFor` + `id`).
- **Erros anunciáveis**: inputs com `aria-invalid` e `aria-describedby` apontando para mensagem.
- **Não depender apenas de cor**: estados críticos (erro/sucesso) têm texto e hierarquia (título + descrição).

Pendências típicas para a etapa de auditoria (Fase 4d) — não bloqueiam o gate da SPEC:

- Teste com leitor de tela (NVDA/VoiceOver) para fluxos reais.
- Contraste calculado token-a-token (especialmente semantic on background).

---

## Diretrizes de UI para “Espaços” (cores/labels/ícones)

> “Espaço” = unidade de trabalho/ambiente (ex.: workspace, projeto, instância, ambiente, cliente).

### Regras de naming (labels)

- **Nome do Espaço**: curto, único, humano (evitar IDs).
- **Slug (opcional)**: usado em URL; não exibir como principal.
- **Ambiente** (quando aplicável): `Produção`, `Staging`, `Dev` (labels consistentes).

### Cores (comunicação semântica)

- **Produção**: neutro (não “gritar”), destaque só quando houver risco.
- **Staging/Dev**: podem usar `muted` + borda (diferença visual sem competir com conteúdo).
- **Estado do Espaço**:
  - saudável: `success` (uso com parcimônia)
  - atenção: `warning`
  - bloqueado/erro: `danger`

### Ícones (diretriz, não implementação)

- Ícones devem ser **auxiliares** (nunca a única forma de comunicação).
- Ícones interativos sem texto exigem `aria-label`.
- Preferência por um set consistente (ex.: Lucide), mas **sem adicionar dependência** nesta fase.

---

## Diretrizes de UI para Painel de Ações e autonomia

> “Painel de Ações” = área onde o usuário (ou automação/agente) dispara ações e vê progresso/resultados.

### Princípios

- **Sempre visível o estado atual**: o usuário precisa saber “o que está acontecendo agora”.
- **Ações têm confirmação implícita**: após executar, mostrar “success/error” e o efeito na UI.
- **Autonomia com guarda-corpos**:
  - ações destrutivas: exigir confirmação textual (padrão a definir na SPEC)
  - mostrar “o que vai mudar” antes de rodar
  - oferecer “desfazer” quando possível

### Estados obrigatórios no painel

- **Idle**: lista de ações disponíveis + contexto do Espaço atual.
- **Running**: progresso (spinner + texto), bloqueio parcial apenas no que for necessário.
- **Needs input**: pedir informação com formulário e validação (não via modal confuso).
- **Success**: resumo do que foi feito + próximo passo.
- **Error**: causa provável + ação recomendada (retry, ajustar input, suporte).

---

## Definição de “Preview aprovado” (gate para SPEC)

### Checklist de aprovação

O preview está “aprovável” quando:

- **Tokens**: light/dark OKLCH aplicados e visíveis no styleguide (background/foreground/semantic/border).
- **Tipografia fluida**: escala `clamp()` demonstrada e legível em 320px → desktop.
- **Componentes base e extensão**: *Button, Input, Textarea, Alert, Card, Spinner, DataTable, Badge, CheckboxField, SwitchControl* + padrões de *dialog/sheet/tabs* visíveis no guia, com *motion* documentado.
- **A11y baseline**: foco visível, labels, estados de erro anunciáveis, touch targets.
- **Estados de UI**: exemplos de loading/empty/error/success visíveis no styleguide.
- **Diretrizes**: “Espaços” e “Painel de Ações/autonomia” documentados neste arquivo.

### Screenshots a capturar (mais tarde)

Capturar e anexar (ou referenciar) no momento da aprovação:

- **Styleguide em light** (viewport 375x812 e 1440x900)
- **Styleguide em dark** (viewport 375x812 e 1440x900)
- Close dos blocos:
  - Tipografia (escala fluida)
  - Paleta (semantic tokens)
  - Botões (incluindo loading/disabled)
  - Input (hint + erro)
  - Alerts (success/error/warning/info)
  - Loading + Empty blocks

> Observação: a captura pode ser feita via browser/CI mais adiante; o importante é a lista objetiva do que precisa ser evidenciado.

---

## Matriz de páginas (rota, propósito, estados)

> Atualização 2026-04-25 (Onda app): alinha UX documentada às rotas já esboçadas no frontend; estados seguem o contrato global **loading / empty / error / success**.

| Rota | Propósito | Estados de UI |
|------|-----------|-----------------|
| `/` (marketing) | Landing e entrada no produto | loading (suspense), empty N/A, error boundary |
| `/login`, `/register` | Auth (mock UI) | idle, loading (submit), error (validação), success (redirect) |
| `/dashboard` | Visão geral: KPIs, tendência 7d, atividade, quick actions | success (dados mock), empty opcional se KPIs zerados (futuro) |
| `/onboarding` | Wizard 3 passos: privacidade áudio, idioma/voz, integrações | idle por passo, skip → dashboard, complete → dashboard |
| `/settings` | Abas: Perfil, Preferências, Voz, Notificações, Dispositivos, Segurança | success (form mock), error futuro ao guardar |
| `/spaces`, `/capture`, `/tasks`, `/integrations`, `/billing`, `/usage`, `/team` | Áreas de produto (PRD) | loading/empty/error conforme implementação por onda |
| `/styleguide` | Inspeção de design (dev) | success |

---

## Próximos passos após aprovação

- Entrar na Fase 2 e gerar `docs/06_SPECIFICATION.md` usando este documento como contrato de UI/UX.
- Expandir componentes (shadcn/ui “completo”) somente quando houver necessidade real no roadmap de telas (evitar excesso prematuro).

