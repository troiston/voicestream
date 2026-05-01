import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export function DevicesSection() {
  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Dispositivos</h2>
        <CardDescription>Gerencie dispositivos conectados à sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Nenhum dispositivo registrado.</p>
      </CardContent>
    </Card>
  );
}
