"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { User, SlidersHorizontal, Mic, Bell, Monitor, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import { DevicesSection } from "./devices-section";
import { NotificationsSection } from "./notifications-section";
import { PreferencesSection } from "./preferences-section";
import { ProfileSection } from "./profile-section";
import { SecuritySection } from "./security-section";
import { VoiceSection } from "./voice-section";

const SECTIONS = [
  { id: "primeiros-passos", label: "Primeiros passos", icon: Sparkles },
  { id: "perfil", label: "Perfil", icon: User },
  { id: "preferencias", label: "Preferências", icon: SlidersHorizontal },
  { id: "voz", label: "Voz", icon: Mic },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "dispositivos", label: "Dispositivos", icon: Monitor },
  { id: "seguranca", label: "Segurança", icon: Shield },
] as const;

interface SettingsPageViewProps {
  twoFactorEnabled?: boolean;
  connectedProviders?: string[];
  user?: {
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    phone: string | null;
    notificationPrefs?: unknown;
  } | null;
}

export function SettingsPageView({ twoFactorEnabled = false, connectedProviders = [], user }: SettingsPageViewProps) {
  const [activeSection, setActiveSection] = useState<string>("perfil");

  // Scroll-spy: IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-80px 0px -66% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  }, []);

  // Mobile: pills layout
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preferências da conta e do produto VoiceStream.
        </p>
      </div>

      {/* Layout: desktop grid ou mobile pills */}
      <div className={cn(
        "gap-8",
        isMobile ? "space-y-6" : "grid grid-cols-[220px_1fr]"
      )}>
        {/* Nav esquerda - sticky no desktop */}
        <nav className={cn(
          "space-y-1",
          !isMobile && "sticky top-20 self-start"
        )}>
          {isMobile && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    activeSection === id
                      ? "bg-brand text-brand-foreground"
                      : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}

          {!isMobile && (
            <div className="space-y-1">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(id);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeSection === id
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </a>
              ))}
            </div>
          )}
        </nav>

        {/* Seções */}
        <div className="space-y-6">
          <section id="primeiros-passos" className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Primeiros passos</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reabra a configuração inicial de privacidade, voz e integrações quando precisar revisar a experiência.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                Abrir configuração
              </Link>
            </div>
          </section>

          <section id="perfil">
            {user && <ProfileSection user={user} />}
          </section>

          <section id="preferencias">
            <PreferencesSection />
          </section>

          <section id="voz">
            <VoiceSection />
          </section>

          <section id="notificacoes">
            <NotificationsSection
              connectedProviders={connectedProviders}
              initialPrefs={user?.notificationPrefs as Record<string, boolean> | undefined}
            />
          </section>

          <section id="dispositivos">
            <DevicesSection />
          </section>

          <section id="seguranca">
            <SecuritySection twoFactorEnabled={twoFactorEnabled} />
          </section>
        </div>
      </div>
    </div>
  );
}
