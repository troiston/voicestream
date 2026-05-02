"use client";

import { useCallback, useEffect, useState } from "react";
import { User, SlidersHorizontal, Mic, Bell, Monitor, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

import { DevicesSection } from "./devices-section";
import { NotificationsSection } from "./notifications-section";
import { PreferencesSection } from "./preferences-section";
import { ProfileSection } from "./profile-section";
import { SecuritySection } from "./security-section";
import { VoiceSection } from "./voice-section";

const SECTIONS = [
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
          Preferências da conta e do produto VoiceStream. Dados são mock até a fase de backend.
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
            <NotificationsSection connectedProviders={connectedProviders} />
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
