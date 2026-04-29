import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

const DEVICES = [
  { id: "d1", name: "Chrome · Linux", last: "Ativo agora", current: true as const },
  { id: "d2", name: "Safari · iOS", last: "há 2 dias", current: false as const },
] as const;

export function DevicesSection() {
  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Dispositivos</h2>
        <CardDescription>Sessões com sessão mock; revogação virá com API real.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-[var(--radius-md)] border border-border/60 bg-surface-2/30">
          {DEVICES.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.last}</p>
              </div>
              {d.current ? (
                <span className="text-xs font-medium text-[var(--success)]">Este dispositivo</span>
              ) : (
                <button
                  type="button"
                  className="min-h-11 text-sm font-medium text-[var(--danger)] hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Revogar
                </button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
