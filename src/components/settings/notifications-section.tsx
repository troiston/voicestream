"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateNotificationPrefs } from "@/features/profile/actions";

type NotificationPrefs = Record<string, Record<string, boolean>>;

const EVENTS = [
  "Transcrição concluída",
  "Nova tarefa",
  "Menção",
  "Resumo semanal",
  "Alerta de cobrança",
] as const;

interface NotificationsSectionProps {
  connectedProviders?: string[];
  initialPrefs?: Record<string, boolean>;
}

export function NotificationsSection({ connectedProviders = [], initialPrefs }: NotificationsSectionProps) {
  const channels = ["Email", "Push", ...(connectedProviders.includes("slack") ? ["Slack"] : [])] as const;
  const CHANNELS = channels;

  const defaultPrefs: NotificationPrefs = {
    "Transcrição concluída": { Email: true, Push: true, ...(connectedProviders.includes("slack") ? { Slack: false } : {}) },
    "Nova tarefa": { Email: false, Push: true, ...(connectedProviders.includes("slack") ? { Slack: true } : {}) },
    "Menção": { Email: true, Push: true, ...(connectedProviders.includes("slack") ? { Slack: true } : {}) },
    "Resumo semanal": { Email: true, Push: false, ...(connectedProviders.includes("slack") ? { Slack: false } : {}) },
    "Alerta de cobrança": { Email: true, Push: false, ...(connectedProviders.includes("slack") ? { Slack: false } : {}) },
  };

  const [prefs, setPrefs] = useState<NotificationPrefs>(
    initialPrefs ? (initialPrefs as unknown as NotificationPrefs) : defaultPrefs
  );

  const togglePref = useCallback((event: string, channel: string) => {
    setPrefs((prev) => {
      const updated = {
        ...prev,
        [event]: {
          ...prev[event],
          [channel]: !prev[event]?.[channel],
        },
      };
      // Persist immediately
      updateNotificationPrefs(updated).then(() => {
        toast.success("Preferências salvas");
      }).catch(() => {
        toast.error("Erro ao salvar preferências");
      });
      return updated;
    });
  }, []);

  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Notificações</h2>
        <CardDescription>Canais de notificação por tipo de evento.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left py-3 px-3 font-semibold text-foreground">Evento</th>
                {CHANNELS.map((ch) => (
                  <th key={ch} className="text-center py-3 px-3 font-semibold text-foreground">
                    {ch}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((event) => (
                <tr key={event} className="border-b border-border/60 last:border-0 hover:bg-surface-2/30 transition-colors">
                  <td className="py-4 px-3 font-medium text-foreground">{event}</td>
                  {CHANNELS.map((channel) => (
                    <td key={`${event}-${channel}`} className="py-4 px-3 text-center">
                      <button
                        onClick={() => togglePref(event, channel)}
                        className="inline-flex items-center justify-center"
                        aria-label={`Toggle ${event} for ${channel}`}
                      >
                        <Switch
                          checked={prefs[event]?.[channel] ?? false}
                          onCheckedChange={() => togglePref(event, channel)}
                          className="pointer-events-none"
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
