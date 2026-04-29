# INTERNAL_DESIGN_QA — CloudVoice (revisão estática + alinhamento ao plano)

**Data:** 2026-04-25  
**Autor:** agente (subagente Builder / QA estático, conforme plano `frontend_completo_cloudvoice_0315b380`)  
**Escopo:** matriz por rota (tema claro/escuro, a11y checklist aplicável, SEO, estados UI). **Sem** captura de screenshots nesta passagem — apenas leitura de código e convenções do repositório.

**Referências globais (todas as rotas):**

- Tema: [`src/components/providers/app-theme-provider.tsx`](../src/components/providers/app-theme-provider.tsx) (`next-themes`, `attribute="class"`) + tokens em [`src/app/globals.css`](../src/app/globals.css) (incl. `.dark`).
- Metadados base: [`src/app/layout.tsx`](../src/app/layout.tsx) (`metadataBase`, `title` template, OG/Twitter default).
- JSON-LD **Organization** (marketing): [`src/app/(marketing)/layout.tsx`](../src/app/(marketing)/layout.tsx) (`organizationJsonLd`).
- Boundaries: [`src/app/loading.tsx`](../src/app/loading.tsx), [`src/app/error.tsx`](../src/app/error.tsx), [`src/app/not-found.tsx`](../src/app/not-found.tsx); grupos [`(marketing)/loading.tsx`](../src/app/(marketing)/loading.tsx), [`(auth)/loading.tsx`](../src/app/(auth)/loading.tsx), [`(app)/loading.tsx`](../src/app/(app)/loading.tsx); [`(marketing)/error.tsx`](../src/app/(marketing)/error.tsx), [`(auth)/error.tsx`](../src/app/(auth)/error.tsx), [`(app)/error.tsx`](../src/app/(app)/error.tsx).
- Skip-link: marketing [`(marketing)/layout.tsx`](../src/app/(marketing)/layout.tsx); app [`src/components/app/app-shell.tsx`](../src/components/app/app-shell.tsx). **Auth:** sem skip dedicado no [`(auth)/layout.tsx`](../src/app/(auth)/layout.tsx) (ver secção *Loop / follow-ups*).

**Legenda colunas**

| Coluna | Significado |
|--------|-------------|
| **Tema** | Uso de `bg-background` / `text-foreground` / `border-border` e ausência de hardcodes que quebrem dark mode; verificação estática. |
| **A11y** | Checklist aplicável em código: 1× `h1` por página (amostragem por ficheiro), landmarks (`main`, `nav` onde aplicável), `aria-labelledby` em secções relevantes, labels em formulários, alvos ≥44px onde Tailwind `min-h-11`/`min-w-11` aplicado, `prefers-reduced-motion` em animações críticas (amostragem em motion). **Não** substitui corrida axe/Playwright (pendente no plano W4L). |
| **SEO** | `export const metadata` / `generateMetadata`: `title`, `description`, `alternates.canonical` e `openGraph.url` onde exigido; `robots` noindex em áreas privadas; JSON-LD alinhado ao tipo de página. |
| **Estados** | `loading.tsx` por segmento ou rota; `error.tsx` por grupo; `notFound()` em dados dinâmicos; estados **empty/error/success** em UI (forms, listas) quando aplicável ao domínio da página. |

---

## Matriz — Marketing (público)

| Rota | Ficheiro `page.tsx` | Tema | A11y | SEO | Estados |
|------|---------------------|------|------|-----|---------|
| `/` | [`(marketing)/page.tsx`](../src/app/(marketing)/page.tsx) | OK | OK (Hero + secções semânticas; skip global) | Completo + BreadcrumbList JSON-LD | Boundary grupo + root |
| `/styleguide` | [`(marketing)/styleguide/page.tsx`](../src/app/(marketing)/styleguide/page.tsx) | OK | Parcial (DS demo; revisar contraste caso a caso) | `title`+`description`+`noindex`; **sem** `canonical` dedicado na página | Boundary grupo |
| `/pricing` | [`(marketing)/pricing/page.tsx`](../src/app/(marketing)/pricing/page.tsx) | OK | OK + toggle período [`price-toggle.tsx`](../src/components/marketing/price-toggle.tsx) (`role="switch"` + `aria-checked`) | Completo + BreadcrumbList + Product/Offer JSON-LD | Boundary |
| `/about` | [`(marketing)/about/page.tsx`](../src/app/(marketing)/about/page.tsx) | OK | OK | Completo + BreadcrumbList | Boundary |
| `/contact` | [`(marketing)/contact/page.tsx`](../src/app/(marketing)/contact/page.tsx) | OK | OK (form + server action / estados — ver componente contacto) | Completo + BreadcrumbList | Loading auth não aplica; success/error no form |
| `/blog` | [`(marketing)/blog/page.tsx`](../src/app/(marketing)/blog/page.tsx) | OK | OK | Completo + BreadcrumbList | Lista com mocks — empty tratável via filtros (revisão: dados sempre presentes em mock) |
| `/blog/[slug]` | [`(marketing)/blog/[slug]/page.tsx`](../src/app/(marketing)/blog/[slug]/page.tsx) | OK | OK (`article`, `Image`+`alt`) | `generateMetadata` + canonical + OG article + Article JSON-LD | **`notFound()`** se slug inválido |
| `/changelog` | [`(marketing)/changelog/page.tsx`](../src/app/(marketing)/changelog/page.tsx) | OK | OK | Completo + BreadcrumbList | Boundary |
| `/security` | [`(marketing)/security/page.tsx`](../src/app/(marketing)/security/page.tsx) | OK | OK | Completo + BreadcrumbList | Boundary |
| `/terms` | [`(marketing)/terms/page.tsx`](../src/app/(marketing)/terms/page.tsx) | OK | OK | Completo + BreadcrumbList | Boundary |
| `/privacy` | [`(marketing)/privacy/page.tsx`](../src/app/(marketing)/privacy/page.tsx) | OK | OK | Completo + BreadcrumbList | Boundary |
| `/cookies` | [`(marketing)/cookies/page.tsx`](../src/app/(marketing)/cookies/page.tsx) | OK | OK + banner global [`cookie-consent-banner.tsx`](../src/components/marketing/cookie-consent-banner.tsx) | Completo + BreadcrumbList | Persistência cliente (consent) |

---

## Matriz — Auth (UI mock)

| Rota | Ficheiro | Tema | A11y | SEO | Estados |
|------|----------|------|------|-----|---------|
| `/login` | [`(auth)/login/page.tsx`](../src/app/(auth)/login/page.tsx) | OK | OK (form); **gap:** sem skip-link no layout auth | `metadata` + `noindex` + canonical `/login` | idle/loading/error via actions |
| `/register` | [`(auth)/register/page.tsx`](../src/app/(auth)/register/page.tsx) | OK | Idem | `noindex` + canonical | Idem |
| `/forgot-password` | [`(auth)/forgot-password/page.tsx`](../src/app/(auth)/forgot-password/page.tsx) | OK | Idem | `noindex` | Mensagem genérica |
| `/reset-password` | [`(auth)/reset-password/page.tsx`](../src/app/(auth)/reset-password/page.tsx) | OK | Idem | `noindex` | Token inválido/expirado (UI) |
| `/verify-email` | [`(auth)/verify-email/page.tsx`](../src/app/(auth)/verify-email/page.tsx) | OK | Idem | `noindex` | Estados query `estado` + [`verify-content.tsx`](../src/components/auth/verify-content.tsx) |
| `/mfa` | [`(auth)/mfa/page.tsx`](../src/app/(auth)/mfa/page.tsx) | OK | Idem | `noindex` | inputs 6 dígitos + recovery (mock) |

Layout auth: [`(auth)/layout.tsx`](../src/app/(auth)/layout.tsx) — `ThemeModeControls`; **sem** landmark `main` dedicado nem skip (card centrado).

---

## Matriz — App (sessão obrigatória)

| Rota | Ficheiro | Tema | A11y | SEO | Estados |
|------|----------|------|------|-----|---------|
| `/dashboard` | [`(app)/dashboard/page.tsx`](../src/app/(app)/dashboard/page.tsx) | OK | OK (shell skip + conteúdo) | `noindex` (correto) | `(app)/loading.tsx` |
| `/spaces` | [`(app)/spaces/page.tsx`](../src/app/(app)/spaces/page.tsx) | OK | OK | `noindex` | **`spaces/loading.tsx`** + modais/forms |
| `/spaces/[id]` | [`(app)/spaces/[id]/page.tsx`](../src/app/(app)/spaces/[id]/page.tsx) | OK | OK | `generateMetadata` + `noindex` | **`notFound()`** se espaço inexistente |
| `/capture` | [`(app)/capture/page.tsx`](../src/app/(app)/capture/page.tsx) | OK | OK + motion reduzível (revisar componente capture) | `noindex` | **`capture/loading.tsx`** + estados orb |
| `/tasks` | [`(app)/tasks/page.tsx`](../src/app/(app)/tasks/page.tsx) | OK | OK | `noindex` | Filtros + drawer |
| `/integrations` | [`(app)/integrations/page.tsx`](../src/app/(app)/integrations/page.tsx) | OK | OK | `noindex` | Grid + modal mock |
| `/billing` | [`(app)/billing/page.tsx`](../src/app/(app)/billing/page.tsx) | OK | OK | `noindex` | Diálogos upgrade |
| `/usage` | [`(app)/usage/page.tsx`](../src/app/(app)/usage/page.tsx) | OK | OK | `noindex` | Gráficos mock |
| `/team` | [`(app)/team/page.tsx`](../src/app/(app)/team/page.tsx) | OK | OK | `noindex` | Convites / papéis |
| `/settings` | [`(app)/settings/page.tsx`](../src/app/(app)/settings/page.tsx) | OK | OK (tabs) | `noindex` | Abas |
| `/onboarding` | [`(app)/onboarding/page.tsx`](../src/app/(app)/onboarding/page.tsx) | OK | OK (wizard) | `noindex` | Stepper / skip |

Shell app: [`src/components/app/app-shell.tsx`](../src/components/app/app-shell.tsx) — skip-link, sidebar/drawer, theme toggle.

---

## Globais e erros

| Destino | Ficheiro | Tema | A11y | SEO | Estados |
|---------|----------|------|------|-----|---------|
| `not-found` (404) | [`src/app/not-found.tsx`](../src/app/not-found.tsx) | OK | OK (heading + CTA) | `metadata` dedicado | N/A |
| `error` (root) | [`src/app/error.tsx`](../src/app/error.tsx) | OK | Client boundary + botão recuperação | Herda | Error UI |
| `loading` (root) | [`src/app/loading.tsx`](../src/app/loading.tsx) | OK | Skeleton/spinner acessível | N/A | Loading global |

---

## Tickets (W4K.5)

**Nenhum blocker encontrado na revisão estática.**

Critérios usados para “blocker” nesta passagem:

- Quebra de build/typecheck ou violação explícita de contrato (metadata ilegível, `notFound` em falta em rota dinâmica obrigatória).
- Ausência total de `metadata` / `robots` em área que deveria estar fechada a indexação.
- Formulário de contacto/auth sem validação Zod no servidor (não observado nas rotas lidas).
- **Não** classificámos como blocker: ausência de skip-link no auth (melhoria), ausência de canonical no styleguide noindex, tarefas W4L (Playwright/axe) ainda pendentes no plano.

---

## Loop Wave 4 (w4-loop)

**Sem iteração adicional necessária** para fechar esta entrega documental: a matriz cobre todas as `page.tsx` listadas no inventário do plano e os boundaries globais.

Follow-ups **menores** (não bloqueiam merge do relatório):

1. Adicionar skip-link + `<main id="main">` em [`(auth)/layout.tsx`](../src/app/(auth)/layout.tsx) para paridade com marketing/app.
2. Opcional: `alternates.canonical` em `/styleguide` por consistência (mantendo `noindex`).
3. Plano: concluir **W4L** (smoke Playwright, fluxos, axe automatizado) e to-dos `w1b-2` (MDX pipeline) / `w1b-5` (RSS) se priorizados.

---

## Alinhamento ao plano (W4L.4 / W5M)

Este documento é o **relatório final de QA de design** referido no plano `frontend_completo_cloudvoice_0315b380`: substitui a necessidade de anexo separado por rota, consolidando evidência por ficheiro e notas de gap. Estado sincronizado com [`docs/DOCS_INDEX.md`](./DOCS_INDEX.md) (secção *Plano frontend CloudVoice*).