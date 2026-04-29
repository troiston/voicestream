"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  LayoutDashboard,
  Layers,
  Mic,
  CheckSquare,
  Plug,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  X,
  Menu,
  FileText,
  CheckSquare as CheckIcon,
  Receipt,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState, type ReactNode } from "react"

import { logoutAction } from "@/features/auth/actions"
import { APP_NAV } from "@/lib/nav/app-nav"
import { CloudVoiceLogo } from "@/components/brand/cloud-voice-logo"
import { AppBreadcrumbs } from "./app-breadcrumbs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useModifierKey } from "@/lib/use-modifier-key"
import { Avatar } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const NAV_ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/onboarding": Sparkles,
  "/spaces": Layers,
  "/capture": Mic,
  "/tasks": CheckSquare,
  "/integrations": Plug,
  "/billing": CreditCard,
  "/usage": BarChart3,
  "/team": Users,
  "/settings": Settings,
}

type NavGroup = {
  label: string
  items: Array<{ href: string; label: string }>
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Painel" },
      { href: "/spaces", label: "Espaços" },
      { href: "/capture", label: "Capturar" },
      { href: "/tasks", label: "Tarefas" },
    ]
  },
  {
    label: "Conta",
    items: [
      { href: "/billing", label: "Cobrança" },
      { href: "/usage", label: "Uso" },
      { href: "/team", label: "Equipe" },
      { href: "/settings", label: "Configurações" },
    ]
  }
]

type Notification = {
  id: number
  read: boolean
  icon: keyof typeof NotificationIcons
  title: string
  desc: string
  time: string
}

const NotificationIcons = {
  FileText,
  CheckSquare: CheckIcon,
  Users,
  Receipt,
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, read: false, icon: "FileText", title: "Transcrição concluída", desc: "Reunião de equipe - 45 min", time: "há 5 min" },
  { id: 2, read: false, icon: "CheckSquare", title: "Nova tarefa criada", desc: '"Revisar relatório Q2"', time: "há 23 min" },
  { id: 3, read: true, icon: "Users", title: "Espaço compartilhado", desc: "Ana adicionou você ao espaço Produto", time: "há 2h" },
  { id: 4, read: true, icon: "Receipt", title: "Fatura disponível", desc: "Fatura de Abril 2026 pronta", time: "há 1d" },
]

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: ReactNode
  userName: string
  userEmail: string
}) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState("")
  const mod = useModifierKey()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setSearchOpen((v) => !v)
      setQuery("")
    }
    if (e.key === "Escape") {
      setSearchOpen(false)
      setUserMenuOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onKey])

  useEffect(() => {
    document.body.dataset.e2eApp = "1"
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Skip link */}
        <a
          className="sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:not-sr-only focus:rounded-[var(--radius-md)] focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
          href="#app-content"
        >
          Pular para o conteúdo
        </a>

        {/* ── Sidebar desktop ── */}
        <aside
          className={cn(
            "hidden lg:flex lg:flex-col",
            "relative min-h-0 border-r border-border/60",
            "bg-surface-1/80 backdrop-blur-xl",
            "transition-all duration-200",
            collapsed ? "w-[3.5rem]" : "w-[15rem]"
          )}
          aria-label="Navegação principal"
        >
          {/* Logo */}
          <div className={cn(
            "flex h-16 shrink-0 items-center border-b border-border/60",
            collapsed ? "justify-center px-2" : "px-4"
          )}>
            <CloudVoiceLogo size="sm" showWordmark={!collapsed} priority />
          </div>

          {/* Nav */}
          <nav className="min-h-0 flex-1 overflow-y-auto p-2 space-y-0.5">
            {APP_NAV.map((item) => {
              const Icon = NAV_ICONS[item.href] ?? LayoutDashboard
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-sm font-medium transition-colors",
                          "border",
                          isActive
                            ? "border-brand/20 bg-brand/10 text-brand"
                            : "border-transparent text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-brand")} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    }
                  />
                  {collapsed && (
                    <TooltipContent side="right" className="text-xs">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </nav>

          {/* Collapse toggle */}
          <div className="shrink-0 border-t border-border/60 p-2">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-pressed={collapsed}
              aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
              className={cn(
                "flex w-full items-center rounded-[var(--radius-md)] px-2.5 py-2 text-sm text-muted-foreground",
                "hover:bg-surface-2/60 hover:text-foreground transition-colors",
                collapsed ? "justify-center" : "gap-2"
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Recolher</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ── Main column ── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* ── Header ── */}
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
              {/* Left: mobile menu + breadcrumbs */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Abrir menu"
                  className="lg:hidden flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-border/60 text-muted-foreground hover:bg-surface-2/60 hover:text-foreground transition-colors"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <AppBreadcrumbs />
              </div>

              {/* Right: search, bell, theme, user */}
              <div className="flex shrink-0 items-center gap-1.5">
                {/* Search button */}
                <button
                  type="button"
                  onClick={() => { setSearchOpen(true); setQuery("") }}
                  aria-keyshortcuts="Control+K"
                  className={cn(
                    "hidden sm:inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border/60 px-2.5 py-1.5",
                    "bg-surface-2/50 text-sm text-muted-foreground transition-colors",
                    "hover:border-brand/30 hover:text-foreground"
                  )}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="text-xs">Procurar</span>
                  <kbd className="font-mono text-xs opacity-50" aria-hidden>{mod}K</kbd>
                </button>

                {/* Bell */}
                <button
                  type="button"
                  aria-label="Notificações"
                  onClick={() => setNotifOpen(true)}
                  className="relative flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground hover:bg-surface-2/60 hover:text-foreground transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
                </button>

                <ThemeToggle />

                {/* User menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-[var(--radius-md)] border border-transparent px-1.5 py-1 text-sm hover:border-border/60 hover:bg-surface-2/60 transition-colors"
                  >
                    <Avatar name={userName} size="sm" />
                    <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:block">
                      {userName}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                        aria-hidden
                      />
                      <div
                        role="menu"
                        className={cn(
                          "absolute end-0 top-full z-50 mt-1.5",
                          "w-56 rounded-[var(--radius-lg)] border border-border/60",
                          "bg-surface-1/95 backdrop-blur-xl shadow-lg"
                        )}
                      >
                        <div className="border-b border-border/60 px-3 py-2.5">
                          <p className="text-xs font-semibold truncate">{userName}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">{userEmail}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/settings"
                            role="menuitem"
                            className="flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-sm text-muted-foreground hover:bg-surface-2/60 hover:text-foreground transition-colors"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            Configurações
                          </Link>
                          <form action={logoutAction}>
                            <button
                              type="submit"
                              role="menuitem"
                              className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              Terminar sessão
                            </button>
                          </form>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* ── Search dialog ── */}
          {searchOpen && (
            <SearchDialog
              onClose={() => setSearchOpen(false)}
              query={query}
              onQuery={setQuery}
            />
          )}

          {/* ── Content ── */}
          <main className="min-w-0 flex-1" id="app-content">
            <motion.div
              className="px-4 py-6 sm:px-6 lg:px-8"
              initial={false}
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: 6 },
                    animate: {
                      opacity: 1,
                      y: 0,
                      transition: { type: "spring" as const, stiffness: 200, damping: 28 },
                    },
                  })}
            >
              {children}
            </motion.div>
          </main>
        </div>

        {/* ── Mobile Sheet ── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[15rem] bg-surface-1/95 backdrop-blur-xl border-r border-border/60 p-0">
            <SheetHeader className="border-b border-border/60 px-4 py-4">
              <SheetTitle className="text-left">
                <CloudVoiceLogo size="sm" />
              </SheetTitle>
            </SheetHeader>
            <nav className="p-2 space-y-0.5">
              {APP_NAV.map((item) => {
                const Icon = NAV_ICONS[item.href] ?? LayoutDashboard
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-sm font-medium transition-colors border",
                      isActive
                        ? "border-brand/20 bg-brand/10 text-brand"
                        : "border-transparent text-muted-foreground hover:bg-surface-2/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* ── Notifications Sheet ── */}
        <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
          <SheetContent side="right" className="w-[22rem] bg-surface-1/95 backdrop-blur-xl border-l border-border/60 p-0 flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Notificações</SheetTitle>
            </SheetHeader>
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 pr-12">
              <span className="text-sm font-semibold text-foreground">Notificações</span>
              {notifications.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                  className="text-xs text-brand hover:text-brand-hover transition-colors"
                >
                  Marcar tudo como lido
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  Nenhuma notificação
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {notifications.map((notif) => {
                    const Icon = NotificationIcons[notif.icon]
                    return (
                      <li
                        key={notif.id}
                        className={cn(
                          "flex gap-3 px-4 py-3 transition-colors hover:bg-surface-2/40",
                          !notif.read && "bg-brand/5"
                        )}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug text-foreground">{notif.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">{notif.desc}</p>
                          <p className="mt-1 text-xs text-muted-foreground/60">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  )
}

function SearchDialog({
  onClose,
  query,
  onQuery,
}: {
  onClose: () => void
  query: string
  onQuery: (s: string) => void
}) {
  const mod = useModifierKey()
  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal aria-label="Procurar">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Fechar procura"
        onClick={onClose}
      />
      <div className={cn(
        "absolute left-1/2 top-20 w-[min(100%-2rem,28rem)] -translate-x-1/2",
        "rounded-[var(--radius-xl)] border border-border/60",
        "bg-surface-1/95 backdrop-blur-xl shadow-lg p-1"
      )}>
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border/60 bg-surface-2/50 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            autoFocus
            type="search"
            placeholder="Procurar espaços, tarefas, gravações…"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="px-3 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Procura em desenvolvimento — utilize a navegação lateral
          </p>
        </div>
        <div className="border-t border-border/60 px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>ESC para fechar</span>
          <kbd className="font-mono opacity-50">{mod}K</kbd>
        </div>
      </div>
    </div>
  )
}
