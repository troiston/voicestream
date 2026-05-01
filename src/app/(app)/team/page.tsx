import type { Metadata } from "next";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { getCurrentPlan } from "@/lib/billing/get-current-plan";
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
import type { UserRole } from "@/types/team";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Equipe",
  description: "Membros, convites e papéis.",
  robots: { index: false, follow: false },
};

function roleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "Administrador";
    case "membro":
      return "Membro";
    case "convidado":
      return "Convidado";
    case "owner":
      return "Proprietário";
    default:
      return role;
  }
}

function roleBadgeVariant(role: string): "default" | "muted" | "outline" {
  if (role === "admin" || role === "owner") {
    return "default";
  }
  if (role === "membro") {
    return "muted";
  }
  return "outline";
}

function formatSeen(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function TeamPage() {
  const session = await requireSession();

  const { plan } = await getCurrentPlan(session.userId);

  if (plan !== "enterprise") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Membros colaboradores nos seus espaços e convites pendentes.
          </p>
        </div>
        <section
          className="rounded-[var(--radius-xl)] border-2 border-dashed border-border/50 bg-surface-1/30 p-10 text-center"
          aria-labelledby="upgrade-heading"
        >
          <h2 id="upgrade-heading" className="text-lg font-semibold">
            Funcionalidade exclusiva do plano Empresa
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Convites de equipe disponíveis no plano Empresa. Faça upgrade para colaborar.
          </p>
          <Link href="/billing">
            <Button type="button" className="btn-gradient mt-6" variant="primary">
              Ver planos e fazer upgrade
            </Button>
          </Link>
        </section>
      </div>
    );
  }

  // Get all spaces where user is owner
  const ownedSpaces = await db.space.findMany({
    where: { ownerId: session.userId },
    include: {
      members: {
        where: { status: "active" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  // Get all pending invites sent by user
  const pendingInvites = await db.spaceInvite.findMany({
    where: {
      invitedByUserId: session.userId,
      acceptedAt: null,
    },
    include: {
      space: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Flatten members from all spaces with space context
  const allMembers = ownedSpaces.flatMap(space =>
    space.members.map(m => ({
      id: m.id,
      name: m.user.name || "Sem nome",
      email: m.user.email,
      image: m.user.image,
      role: m.role as UserRole,
      joinedAt: m.joinedAt || m.invitedAt,
      spaceName: space.name,
      spaceId: space.id,
    }))
  );

  const hasNoSpaces = ownedSpaces.length === 0;
  const hasMembers = allMembers.length > 0;
  const hasInvites = pendingInvites.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Membros colaboradores nos seus espaços e convites pendentes.
        </p>
      </div>

      {hasNoSpaces ? (
        <section
          className="rounded-[var(--radius-xl)] border-2 border-dashed border-border/50 bg-surface-1/30 p-10 text-center"
          aria-labelledby="empty-heading"
        >
          <h2 id="empty-heading" className="text-lg font-semibold">
            Sem espaços
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie um espaço para convidar membros e colaboradores.
          </p>
          <Link href="/spaces">
            <Button type="button" className="btn-gradient mt-6" variant="primary">
              Ir para Espaços
            </Button>
          </Link>
        </section>
      ) : (
        <>
          {hasMembers && (
            <section aria-labelledby="members-heading">
              <Card className="border border-border/60 bg-surface-1">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <h2
                    id="members-heading"
                    className="text-lg font-semibold tracking-tight text-foreground"
                  >
                    Membros
                  </h2>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table aria-label="Membros colaboradores e papéis">
                    <TableHeader>
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Nome</TableHead>
                        <TableHead className="text-muted-foreground">E-mail</TableHead>
                        <TableHead className="text-muted-foreground">Papel</TableHead>
                        <TableHead className="text-muted-foreground">Espaço</TableHead>
                        <TableHead className="text-muted-foreground">Data entrada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allMembers.map((m) => (
                        <TableRow
                          key={m.id}
                          className="border-border/60 hover:bg-surface-2/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar name={m.name} src={m.image || undefined} />
                              <span className="font-medium text-foreground">{m.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{m.email}</TableCell>
                          <TableCell>
                            <Badge variant={roleBadgeVariant(m.role)}>
                              {roleLabel(m.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/spaces/${m.spaceId}`}
                              className="text-accent hover:underline underline-offset-2"
                            >
                              {m.spaceName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <time dateTime={m.joinedAt.toISOString()}>
                              {formatSeen(m.joinedAt)}
                            </time>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          )}

          {hasInvites && (
            <section aria-labelledby="invites-heading">
              <Card className="border border-border/60 bg-surface-1">
                <CardHeader>
                  <h2
                    id="invites-heading"
                    className="text-lg font-semibold tracking-tight text-foreground"
                  >
                    Convites pendentes
                  </h2>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table aria-label="Convites enviados e estado">
                    <TableHeader>
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">E-mail</TableHead>
                        <TableHead className="text-muted-foreground">Papel</TableHead>
                        <TableHead className="text-muted-foreground">Espaço</TableHead>
                        <TableHead className="text-muted-foreground">Enviado</TableHead>
                        <TableHead className="text-muted-foreground">
                          <span className="sr-only">Ações</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvites.map((inv) => (
                        <TableRow
                          key={inv.id}
                          className="border-border/60 hover:bg-surface-2/50 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">{inv.email}</TableCell>
                          <TableCell>
                            <Badge variant={roleBadgeVariant(inv.role)}>
                              {roleLabel(inv.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>{inv.space.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <time dateTime={inv.createdAt.toISOString()}>
                              {formatSeen(inv.createdAt)}
                            </time>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="min-h-11"
                              disabled
                            >
                              Reenviar (em breve)
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          )}

          {!hasMembers && !hasInvites && (
            <Card className="border border-border/60 bg-surface-1">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum membro ou convite. Aceda a um espaço para convidar colaboradores.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
