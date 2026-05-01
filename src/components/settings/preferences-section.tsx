import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { CheckboxField } from "@/components/ui/checkbox-field";

export function PreferencesSection() {
  return (
    <Card className="border border-border/60 bg-surface-1 shadow-none">
      <CardHeader>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Preferências</h2>
        <CardDescription>Comportamento da app e densidade da UI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CheckboxField
          id="pref-compact"
          label="Lista compacta em tarefas e feeds"
          description="Mais linhas visíveis; menos respiro entre linhas."
        />
        <CheckboxField
          id="pref-reduced-motion"
          label="Respeitar preferência de movimento reduzido do sistema"
          description="Desativa animações decorativas onde aplicável."
          defaultChecked
        />
      </CardContent>
    </Card>
  );
}
