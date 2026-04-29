import type { Metadata } from "next";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { mockInvites, mockTeamMembers } from "@/lib/mocks/team";
import type { UserRole } from "@/types/team";
import { TeamInviteDialog } from "@/components/app/team-invite-dialog";

export const metadata: Metadata = {
  title: "Equipe",
  description: "Membros, convites e papéis.",
  robots: { index: false, follow: false },
};

function roleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrador";
    case "membro":
      return "Membro";
    case "convidado":
      return "Convidado";
  }
}

function roleBadgeVariant(role: UserRole): "default" | "muted" | "outline" {
  if (role === "admin") {
    return "default";
  }
  if (role === "membro") {
    return "muted";
  }
  return "outline";
}

function formatSeen(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Membros com acesso à organização e convites pendentes (mock).
        </p>
      </div>

      <section aria-labelledby="members-heading">
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <h2 id="members-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Membros
            </h2>
            <TeamInviteDialog />
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table aria-label="Membros da equipe e respectivos papéis">
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">E-mail</TableHead>
                  <TableHead className="text-muted-foreground">Papel</TableHead>
                  <TableHead className="text-muted-foreground">Última atividade</TableHead>
                  <TableHead className="text-muted-foreground">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTeamMembers.map((m) => (
                  <TableRow key={m.id} className="border-border/60 hover:bg-surface-2/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} />
                        <span className="font-medium text-foreground">{m.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(m.role)}>{roleLabel(m.role)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <time dateTime={m.lastSeenAt}>{formatSeen(m.lastSeenAt)}</time>
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" className="min-h-11" disabled>
                        Gerir (mock)
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="invites-heading">
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader>
            <h2 id="invites-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Convites pendentes
            </h2>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {mockInvites.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Sem convites em curso.</p>
            ) : (
              <Table aria-label="Convites enviados e estado">
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">E-mail</TableHead>
                    <TableHead className="text-muted-foreground">Papel</TableHead>
                    <TableHead className="text-muted-foreground">Enviado</TableHead>
                    <TableHead className="text-muted-foreground">
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvites.map((inv) => (
                    <TableRow key={inv.id} className="border-border/60 hover:bg-surface-2/50 transition-colors">
                      <TableCell className="font-medium text-foreground">{inv.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant(inv.role)}>{roleLabel(inv.role)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <time dateTime={inv.sentAt}>{formatSeen(inv.sentAt)}</time>
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="secondary" size="sm" className="min-h-11" disabled>
                          Reenviar (mock)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
