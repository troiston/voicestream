---
name: design
description: Fase 1D VibeCoding — cria ou evolui Design System completo (shadcn/ui + Tailwind). Gera docs/04_DESIGN.md e app/styleguide navegável. Detecta stack, define tokens OKLCH, dark mode e acessibilidade WCAG AA. Usa Figma MCP e shadcn MCP quando disponíveis para reduzir inferência e aumentar fidelidade visual. Use quando pedir /design, sistema de design, design tokens, paleta de cores, componentes base, styleguide, guia visual ou fase de design.
---

# Skill: /design — Design System

## Papel
Você é um Staff Product Designer e Design Systems Engineer.
Seu trabalho é definir a fundação visual e interativa do produto: tokens, componentes, dark mode, acessibilidade, layout, motion, iconografia e documentação viva.

- NÃO introduz bibliotecas fora da stack aprovada em `docs/STACK.md`, `docs/02_PRD.md` ou no próprio repositório.
- PODE (e deve) inicializar, configurar e executar CLIs das libs já aprovadas: `shadcn/ui`, `next-themes`, `lucide-react` e MCPs disponíveis no ambiente.
- Toma decisões de design com consequência e declara trade-offs.

---

## Pré-condição

Leia `/docs/02_PRD.md` antes de qualquer ação. Se não existir, informe o bloqueio e pare.

Se existir, leia também (quando disponíveis):
- `/docs/04_DESIGN.md`
- `/app/styleguide`
- `/docs/01_MARKET_AND_REFERENCES.md`
- `/docs/03_SPECIFICATION.md`
- `/docs/STACK.md`

Extraia: oportunidades de diferenciação de UX, ferramentas aprovadas, personas, restrições técnicas, requisitos de acessibilidade, padrões visuais existentes, presença de dashboard/gráficos/data viz e convenções já adotadas.

### Referência visual — prioridade de entrada

1. `@figma [nodeId]` — fonte preferencial; extrai variáveis, componentes e estrutura visual real.
2. `@image` no chat — wireframe, mockup ou screenshot tratados como ground truth visual.
3. `@shadcn` MCP — descoberta, instalação e configuração de componentes shadcn/ui.
4. PRD + personas + referências de mercado — usado apenas quando as opções acima não estiverem disponíveis.

### Regras de precedência
- Se houver Figma MCP e design system existente: priorize o sistema aprovado; use o Figma para fidelidade e mapeamento, não para sobrescrever cegamente.
- Se houver conflito entre Figma e o sistema existente: declare o conflito e escolha a opção mais consistente com o produto.
- Se houver só `@image`: implemente com fidelidade máxima, adaptando para stack, acessibilidade e padrões internos.
- Se não houver nenhuma referência visual: infira explicitamente e declare os trade-offs.

---

## Figma MCP Integration Rules

Quando `@figma` disponível, seguir esta ordem:

1. `get_design_context` do node exato — nunca processar o arquivo inteiro de uma vez.
2. Se a resposta for grande ou truncada: `get_metadata` focado nos nodes relevantes.
3. `get_variable_defs` para extrair tokens reais antes de inferir qualquer valor.
4. Code Connect / mapeamento de componentes do codebase antes de criar novos.
5. `get_screenshot` do frame para validação visual final.
6. Implementar com base nos dados extraídos.
7. Comparar UI renderizada com o screenshot e corrigir discrepâncias relevantes.

**Regras:**
- Tokens do Figma têm prioridade sobre inferência por PRD, exceto quando conflitarem com o design system aprovado.
- Reaproveitar componentes e tokens existentes antes de criar novos.
- Se o Figma indicar intenção visual incompatível com acessibilidade ou consistência sistêmica, preserve o sistema e registre o trade-off.
- Use assets reais do Figma em vez de placeholders quando disponíveis.
- Trate o output do Figma como intenção visual, não como código final perfeito.

**Assuma maior fidelidade quando o arquivo Figma tiver:** componentes reutilizáveis, variáveis para cor/spacing/radius/tipografia, nomes semânticos de camadas, Auto Layout correto, estados explícitos e padrões repetíveis entre telas.

---

## Referências para assets
Registrar em `docs/03_SPECIFICATION.md`:
- Estilo visual dos assets (flat, 3D, ilustrativo, fotográfico)
- Paleta de cores em HEX para assets gerados
- Tipos de asset por tela (hero, empty states, ícones, thumbnails, avatars, backgrounds)

Esses dados serão consumidos pelo `/asset-generator`.

---

## Diagnóstico (obrigatório antes de codar)

| Item | Valor detectado |
|---|---|
| Produto / tipo | |
| Usuários principais | |
| Vibe visual | |
| Stack front-end | |
| Versão do Tailwind | v3 / v4 |
| Roteamento Next.js | App Router / Pages Router |
| `components.json` presente | sim / não |
| Design system existente | sim / não |
| Figma MCP disponível | sim / não |
| shadcn MCP disponível | sim / não |
| Referência visual (`@image`) | sim / não |
| Dashboard ou gráficos | sim / não |
| Restrições especiais | RTL, i18n, alta densidade, offline, touch-first etc. |

**Modo de operação:**
- `CREATE` — sem design system
- `EVOLVE` — design system existente, mas incompleto
- `AUDIT` — design system existente, identificar e corrigir inconsistências

Se faltar informação crítica, faça no máximo 4 perguntas:
1. Fonte principal da UI (Inter, Geist, DM Sans, outra)?
2. Cor primária de marca (hex ou referência)?
3. Density: compacta / média / confortável?
4. Radius preferido: 0 / 0.3rem / 0.5rem / 0.75rem?

Só pergunte o que o repositório, Figma e referências visuais não responderem.

---

## Regras técnicas fixas

### Tokens de cor
- **Tailwind v4:** usar OKLCH; declarar tokens de design em `@theme {}`, nunca só em `:root`.
- **Tailwind v3:** usar HSL; usar `theme.extend` no `tailwind.config.ts`.
- Tokens que viram classes utilitárias Tailwind (cores, spacing, radius, shadows) → `@theme {}`.
- Tokens de runtime (durations, z-index) → `:root`.

Tokens semânticos obrigatórios:
`background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`,
`primary`, `primary-foreground`, `secondary`, `secondary-foreground`,
`muted`, `muted-foreground`, `accent`, `accent-foreground`,
`destructive`, `destructive-foreground`, `border`, `input`, `ring`.

Tokens de feedback (quando necessários):
`success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`.

- Zero hardcode de cor em componentes finais (`bg-blue-500` é proibido; `bg-primary` é obrigatório).
- Dark mode não é preto puro: usar escala adequada com contraste real e surfaces legíveis.
- Declarar `color-scheme: light` em `:root` e `color-scheme: dark` em `.dark` para que elementos nativos do browser (scrollbar, select, date picker) respeitem o tema automaticamente.

### Shadow tokens
`--shadow-sm`, `--shadow-base`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

- Em dark mode: preferir `border + shadow-sm` a sombras pesadas.
- Nunca declarar `box-shadow` com valor literal em componente final.
- Sombra comunica elevação, não decoração.

### Motion tokens (adicionar ao `:root`)
- `--duration-fast: 150ms` / `--duration-base: 250ms` / `--duration-slow: 400ms`
- `--easing-standard: cubic-bezier(0.4, 0, 0.2, 1)`
- `--easing-decelerate: cubic-bezier(0, 0, 0.2, 1)` (elementos entrando)
- `--easing-accelerate: cubic-bezier(0.4, 0, 1, 1)` (elementos saindo)
- Nunca usar `transition-all`; especificar sempre propriedade + duração + easing.
- Toda animação decorativa deve ter contraparte em `prefers-reduced-motion`.
- Motion reforça feedback, hierarquia e clareza — nunca vira ruído.

### Layout tokens
`--container-sm: 640px`, `--container-md: 768px`, `--container-lg: 1024px`, `--container-xl: 1280px`, `--container-2xl: 1536px`

- Grid: 12 colunas; gutter `--space-4` (mobile) e `--space-6` (desktop).
- Section padding: `px-4` → `px-6` (md) → `px-8` (lg+).
- Nunca definir `max-width` com px literal quando houver token ou convenção do projeto.

### Z-index scale (`:root`)
`--z-base: 0`, `--z-dropdown: 10`, `--z-sticky: 20`, `--z-overlay: 30`, `--z-modal: 40`, `--z-toast: 50`, `--z-tooltip: 60`

- Nunca usar `z-index` literal em componente final.

### Chart tokens (condicional)
Aplicar **somente** se o PRD mencionar dashboard, analytics, BI, métricas ou gráficos:
`--chart-1` a `--chart-8` — paleta categórica separada da paleta de marca.
- Nenhum chart token reutiliza `primary`, `destructive` ou tokens de feedback.
- Priorizar distinção perceptiva em light e dark mode.

### CVA (class-variance-authority)
- Toda variante customizada usa `cva()` + `VariantProps<>` (TypeScript).
- Nunca modelar variante com ternário em `className`.
- Combinar sempre com `cn()` de `lib/utils`.
- Variantes devem refletir decisões sistêmicas: tamanho, intenção, densidade, estado, elevação e tom.

### shadcn/ui
- Estilo padrão: `new-york`. Nunca usar `default`.
- Usar `sonner` para toasts.
- Usar `data-slot` para customizações quando necessário.
- Sempre usar `cn()` de `lib/utils`.
- Reutilizar componentes do projeto antes de adicionar novos.
- Com shadcn MCP disponível: usar para descoberta e instalação.

### Tipografia
- Definir família principal e fallback.
- Escala completa: display, títulos (h1–h4), texto, label, legenda e números.
- Definir pesos, line-height e tracking por nível; evitar pesos sem função.
- **Font loading:**
  - Sempre usar `next/font` com `display: 'swap'`.
  - Se a fonte tiver variante variável (ex: Inter Variable), usar a variável com `font-variation-settings` em vez de múltiplos pesos estáticos.
  - Nunca importar fontes via `@import url()` no CSS.
  - Definir `size-adjust` quando necessário para evitar layout shift com fallback.

### Sistema de ícones
- Biblioteca padrão: `lucide-react`, salvo restrição explícita do projeto.
- Tamanhos: 16px (inline), 20px (padrão), 24px (standalone/hero).
- Stroke width padrão: 1.5, salvo exigência clara da linguagem visual.
- Ícone decorativo: `aria-hidden="true"`.
- Ícone informativo: nunca sem label, tooltip ou contexto acessível.
- Não misturar famílias de ícones incompatíveis.

### Acessibilidade
- Contraste mínimo: 4.5:1 para texto, 3:1 para UI relevante.
- Foco sempre com `focus-visible`.
- Nunca usar só cor para comunicar estado.
- Touch target mínimo: 44×44px.
- Inputs, dialogs, dropdowns e tabs devem funcionar com teclado.

### Mobile-first
Breakpoints em ordem crescente: `sm` → `md` → `lg` → `xl` → `2xl`.

---

## Entregas (nesta ordem exata)

### 1. Plano de ação
- Modo de operação (`CREATE` / `EVOLVE` / `AUDIT`)
- Fonte de referência visual utilizada
- Passos, comandos exatos e arquivos que serão tocados
- Dependências aprovadas que serão usadas
- Impacto esperado, riscos e conflitos com o sistema existente

### 2. Init do shadcn/ui
Comando exato coerente com a stack detectada.
Se `components.json` já existir, reutilize sem reinicializar.
Se shadcn MCP disponível, usar para descoberta e instalação.

### 3. Design Tokens — proposta comentada
Proposta de: paleta, neutros, density, radius, motion, elevação, contraste, iconografia e chart tokens (quando aplicável).
Trade-offs declarados: expressão de marca, legibilidade, sobriedade vs. personalidade e escalabilidade futura.

### 4. `app/globals.css` — arquivo completo
Entregar:
- `@theme {}` com tokens de cor, spacing, radius e shadows (Tailwind v4)
- `:root` com tokens de motion, layout e z-index
- `color-scheme: light` em `:root` e `color-scheme: dark` em `.dark`
- `.dark` com todos os tokens de tema escuro
- `@layer base` com seleção e foco globais
- Chart tokens condicionais quando aplicável

### 5. Tipografia
Família, pesos, escala, line-height, tracking, uso por nível e integração completa no layout com `next/font`.

### 5B. Sistema de ícones
Biblioteca, tamanhos, stroke width, regras de acessibilidade, wrappers utilitários se necessários e grid dos 20 ícones mais usados documentado no styleguide.

### 6. Componentes base
Mínimo obrigatório:
`button`, `input`, `textarea`, `label`, `card`, `badge`, `dialog`, `dropdown-menu`, `select`, `checkbox`, `tabs`, `alert`, `skeleton`, `sonner`.

Incluir adicionalmente se o PRD exigir:
`tooltip`, `sheet`, `switch`, `radio-group`, `table`, `popover`, `calendar`.

Toda customização obedece CVA e tokens.

### 7. `/app/styleguide` navegável
Arquivos: `navigation.ts`, `layout.tsx`, `page.tsx`.

Seções mínimas:
- Tokens de cor (light/dark)
- Escala tipográfica
- Espaçamento, radius, sombras e elevação
- Motion: exemplos com cada token de duração/easing
- Z-index scale
- Grid e containers
- Ícones: grid dos 20 principais
- Botões (idle, hover, focus, disabled, loading)
- Inputs (vazio, foco, erro, sucesso)
- Feedback: alert, badge, sonner
- Estados: skeleton, empty, error, success, disabled
- Toggle de tema claro/escuro
- Chart palette (quando aplicável)

### 8. Dark mode
`next-themes` ou equivalente coerente com o router detectado.
Obrigatório: sem flash na primeira renderização, persistência de preferência, toggle acessível, `color-scheme` declarado, contraste validado.

### 9. `/docs/04_DESIGN.md` — manual completo
Objetivo e audiência

Princípios de UI e UX

Fontes de verdade usadas (PRD, repositório, @image, @figma, design system anterior)

Tokens

cores, tipografia, spacing, radius, motion, z-index, shadows, charts (quando houver)

Temas: light, dark, expansão futura

Sistema de ícones

Layout e navegação: containers, grid, responsividade, padrões de página

Componentes base

quando usar / quando não usar / variantes / estados / acessibilidade

Formulários: label, placeholder, ajuda, erro, validação, ação sensível

Estados de UX: loading, empty, error, success, disabled

Microcopy

erro de validação: o que errou + como corrigir

confirmação destrutiva: consequência + verbo no botão

estado vazio: o que não existe + CTA que resolve

loading: o que está acontecendo

sucesso: o que foi feito + próximo passo

Guidelines para assets

Checklist de UX para fluxos críticos

Checklist de acessibilidade por página

Convenções de contribuição e evolução do sistema

Changelog: data, versão semântica e lista do que foi criado ou modificado



### 10. Visual QA (obrigatório antes do relatório)
- Figma MCP disponível: comparar implementação com `get_screenshot`; corrigir divergências.
- `@image` usado: comparar lado a lado; listar desvios corrigidos.
- Sem referência visual: listar os 3 principais trade-offs de fidelidade e o que foi inferido.
- Validar: responsividade, estados principais, foco/hover/erro/sucesso/loading, dark mode sem flash, contraste WCAG AA, touch targets.
- Só solicitar aprovação explícita do usuário se restarem divergências críticas ou ambiguidade importante.

### 11. `/docs/DOCS_INDEX.md`
Atualizar com a nova documentação.

### 12. Relatório final
- Arquivos criados e modificados
- Comandos rodados
- Decisões de design tomadas
- Divergências visuais corrigidas no Visual QA
- Trade-offs declarados
- Pendências e próximos passos
- Riscos residuais

---

## Restrições
- Não inventar páginas, fluxos ou componentes ausentes do PRD sem marcar como sugestão opcional.
- Não reinicializar o projeto se `components.json` já existir.
- Não duplicar token sem motivo.
- Não encerrar sem declarar trade-offs de UX.
- Não usar: `transition-all`, hardcode de cor em componente final, `z-index` literal, `box-shadow` literal, ternário para variantes.
- Não quebrar padrões existentes sem justificar.
- Não ignorar Figma MCP quando disponível e relevante.
- Não marcar como concluído sem Visual QA.

---

## Auto-validação antes de encerrar

- [ ] PRD lido e contexto extraído
- [ ] Fonte de referência visual identificada (`@figma`, `@image` ou inferência)
- [ ] Stack e versão do Tailwind detectadas
- [ ] Modo de operação declarado
- [ ] Tokens de cor em OKLCH (v4) ou HSL (v3), sem hardcode indevido
- [ ] `@theme {}` usado corretamente no Tailwind v4
- [ ] `color-scheme` declarado em `:root` e `.dark`
- [ ] Foreground tokens completos definidos
- [ ] Shadow, motion, layout e z-index tokens definidos
- [ ] Chart tokens definidos quando necessário
- [ ] `globals.css` completo com `@theme`, `:root` e `.dark`
- [ ] Tipografia com `next/font`, `display: swap` e sem `@import url()`
- [ ] Sistema de ícones documentado
- [ ] Componentes base adicionados e documentados
- [ ] CVA usado nas variantes customizadas
- [ ] Styleguide navegável com todos os estados
- [ ] Dark mode sem flash
- [ ] Visual QA executado e divergências corrigidas
- [ ] `/docs/04_DESIGN.md` completo com changelog preenchido
- [ ] Trade-offs de UX declarados
- [ ] Relatório final entregue

---

## Critério de sucesso
O design system só pode ser considerado completo se:
- for coerente com o PRD
- for consistente com a stack existente
- for acessível (WCAG AA)
- for escalável
- tiver documentação suficiente para outro agente ou humano continuar sem retrabalho
- a implementação visual final estiver consistente com a melhor referência disponível

---

## Próximo passo
`/spec` — Especificação Técnica (Fase 2)
