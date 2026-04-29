"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type NotificationPrefs = Record<string, Record<string, boolean>>;

const EVENTS = [
  "Transcrição concluída",
  "Nova tarefa",
  "Menção",
  "Resumo semanal",
  "Alerta de cobrança",
] as const;

const CHANNELS = ["Email", "Push", "Slack"] as const;

export function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    "Transcrição concluída": { Email: true, Push: true, Slack: false },
    "Nova tarefa": { Email: false, Push: true, Slack: true },
    "Menção": { Email: true, Push: true, Slack: true },
    "Resumo semanal": { Email: true, Push: false, Slack: false },
    "Alerta de cobrança": { Email: true, Push: false, Slack: false },
  });

  const togglePref = (event: string, channel: string) => {
    setPrefs((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [channel]: !prev[event]?.[channel],
      },
    }));
  };

  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Notificações</h2>
        <CardDescription>Canais de notificação por tipo de evento (mock).</CardDescription>
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
        <p className="text-xs text-muted-foreground mt-4">
          As preferências são armazenadas localmente até conectar o backend.
        </p>
      </CardContent>
    </Card>
  );
}
