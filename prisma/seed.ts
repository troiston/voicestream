/**
 * Seed idempotente de dados de demonstração.
 *
 * Convenção: todos os registos demo têm `isDemo: true` no `User` raiz.
 * `wipe-demo.ts` apaga apenas registos com este marcador.
 *
 * Uso: `npm run db:seed`. Para apagar dados demo: `npm run db:demo:wipe`.
 */

import { PrismaClient, SpaceKind, TaskStatus, TaskPriority } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_USERS = [
  {
    email: "demo.owner@demo.local",
    name: "Demo Owner",
    plan: "pro",
  },
  {
    email: "demo.member@demo.local",
    name: "Demo Member",
    plan: "free",
  },
];

// Mock data inline (não importado para evitar future shape changes)
const MOCK_SPACES = [
  { id: "sp_1", name: "Família", description: "Calendário, compras, conversas de casa", icon: "home" },
  { id: "sp_2", name: "Trabalho — Produto", description: "Decisões, reuniões, follow-ups de sprint", icon: "work" },
  { id: "sp_3", name: "Pessoal", description: "Hábitos, notas, reflexões de voz", icon: "self" },
];

const MOCK_CAPTURES = [
  { id: "cap_1", title: "Notas rápidas — ideias produto", at: "2026-04-24T14:20:00.000Z", durationSec: 42 },
  { id: "cap_2", title: "Reunião stand-up (resumo)", at: "2026-04-23T09:05:00.000Z", durationSec: 180 },
];

const MOCK_TASKS = [
  { id: "t_1", title: "Rever transcrição da reunião com cliente", description: "Validar nomes próprios e ações acordadas.", status: "pendente", priority: "alta", dueAt: "2026-04-28" },
  { id: "t_2", title: "Partilhar resumo no Slack", description: "Canal #produto — incluir bullets e próximos passos.", status: "em_curso", priority: "media", dueAt: "2026-04-26" },
  { id: "t_4", title: "Sincronizar calendário da equipe", description: "Confirmar disponibilidade para sprint review.", status: "pendente", priority: "media", dueAt: "2026-05-02" },
];

function mapSpaceKind(name: string): SpaceKind {
  if (name.includes("Família")) return SpaceKind.familia;
  if (name.includes("Trabalho") || name.includes("Produto")) return SpaceKind.trabalho;
  if (name.includes("Saúde")) return SpaceKind.saude;
  if (name.includes("Finanças")) return SpaceKind.financas;
  return SpaceKind.pessoal;
}

async function seedUser(email: string, name: string, plan: string) {
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, isDemo: true, emailVerified: true },
    update: { name, isDemo: true },
  });

  if (plan !== "free") {
    const customerId = `cus_demo_${user.id}`;
    const subId = `sub_demo_${user.id}`;
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subId },
      create: {
        userId: user.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subId,
        stripePriceId: `price_demo_${plan}`,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        status: "active",
        stripePriceId: `price_demo_${plan}`,
      },
    });
  }

  await prisma.usage.create({
    data: {
      userId: user.id,
      type: "demo.event",
      quantity: 1,
      metadata: { source: "seed", plan },
    },
  });

  return user;
}

async function seedSpaces(ownerUserId: string) {
  const spaces = [];
  for (const mockSpace of MOCK_SPACES) {
    const space = await prisma.space.upsert({
      where: { id: mockSpace.id },
      create: {
        id: mockSpace.id,
        ownerId: ownerUserId,
        name: mockSpace.name,
        description: mockSpace.description,
        kind: mapSpaceKind(mockSpace.name),
        icon: mockSpace.icon,
      },
      update: {
        name: mockSpace.name,
        description: mockSpace.description,
      },
    });
    spaces.push(space);
  }
  return spaces;
}

async function seedSpaceMembers(memberUserId: string, spaceId: string) {
  await prisma.spaceMember.upsert({
    where: { spaceId_userId: { spaceId, userId: memberUserId } },
    create: {
      spaceId,
      userId: memberUserId,
      role: "membro",
      status: "active",
      joinedAt: new Date(),
    },
    update: {
      status: "active",
    },
  });
}

async function seedRecordingsAndTasks(ownerUserId: string, spaceId: string) {
  let recordingCount = 0;
  let taskCount = 0;

  // Criar 2 recordings com transcriptions, summaries e tasks
  for (let i = 0; i < MOCK_CAPTURES.length; i++) {
    const mockCapture = MOCK_CAPTURES[i];
    const recording = await prisma.recording.upsert({
      where: { id: mockCapture.id },
      create: {
        id: mockCapture.id,
        spaceId,
        userId: ownerUserId,
        title: mockCapture.title,
        storageKey: `recordings/demo/${mockCapture.id}.webm`,
        durationSec: mockCapture.durationSec,
        capturedAt: new Date(mockCapture.at),
        status: "summarized",
      },
      update: {
        title: mockCapture.title,
        status: "summarized",
      },
    });
    recordingCount++;

    // Criar transcription
    await prisma.transcription.upsert({
      where: { recordingId: recording.id },
      create: {
        recordingId: recording.id,
        provider: "deepgram",
        language: "pt-BR",
        text: `Transcrição de: ${mockCapture.title}. Conteúdo plausível para demonstração.`,
      },
      update: {
        language: "pt-BR",
      },
    });

    // Criar summary
    const transcription = await prisma.transcription.findUnique({
      where: { recordingId: recording.id },
    });

    if (transcription) {
      await prisma.summary.upsert({
        where: { recordingId: recording.id },
        create: {
          recordingId: recording.id,
          transcriptionId: transcription.id,
          abstract: `Resumo de: ${mockCapture.title}. Discussão sobre próximas ações.`,
          decisions: ["Decisão demo"],
          nextSteps: ["Próximo passo demo"],
        },
        update: {
          abstract: `Resumo de: ${mockCapture.title}. Discussão sobre próximas ações.`,
        },
      });
    }

    // Criar task derivada da recording
    if (i < MOCK_TASKS.length) {
      const mockTask = MOCK_TASKS[i];
      await prisma.task.upsert({
        where: { id: mockTask.id },
        create: {
          id: mockTask.id,
          spaceId,
          recordingId: recording.id,
          creatorUserId: ownerUserId,
          title: mockTask.title,
          description: mockTask.description,
          status: mockTask.status as TaskStatus,
          priority: mockTask.priority as TaskPriority,
          dueAt: mockTask.dueAt ? new Date(mockTask.dueAt) : null,
        },
        update: {
          status: mockTask.status as TaskStatus,
          priority: mockTask.priority as TaskPriority,
        },
      });
      taskCount++;
    }
  }

  // Criar 3 tasks manuais (sem recordingId)
  const remainingTasks = [
    { id: "t_manual_1", title: "Preparar apresentação para cliente", description: "Slides com mockups e timeline.", status: "pendente", priority: "alta", dueAt: "2026-05-05" },
    { id: "t_manual_2", title: "Revisar feedback do team", description: "Consolidar comentários de code review.", status: "em_curso", priority: "media", dueAt: "2026-04-30" },
    { id: "t_manual_3", title: "Atualizar documentação do projeto", description: "Incluir novas features e troubleshooting.", status: "pendente", priority: "baixa", dueAt: null },
  ];

  for (const mockTask of remainingTasks) {
    await prisma.task.upsert({
      where: { id: mockTask.id },
      create: {
        id: mockTask.id,
        spaceId,
        creatorUserId: ownerUserId,
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status as TaskStatus,
        priority: mockTask.priority as TaskPriority,
        dueAt: mockTask.dueAt ? new Date(mockTask.dueAt) : null,
      },
      update: {
        status: mockTask.status as TaskStatus,
        priority: mockTask.priority as TaskPriority,
      },
    });
    taskCount++;
  }

  return { recordingCount, taskCount };
}

async function main() {
  console.log("[seed] populando dados demo (isDemo=true) ...");

  // Seed users
  let ownerUser, memberUser;
  for (const u of DEMO_USERS) {
    const user = await seedUser(u.email, u.name, u.plan);
    console.log(`  - ${user.email} (${u.plan})`);
    if (u.email === "demo.owner@demo.local") ownerUser = user;
    if (u.email === "demo.member@demo.local") memberUser = user;
  }

  if (!ownerUser || !memberUser) {
    throw new Error("Falha ao criar users demo");
  }

  // Seed spaces
  console.log("[seed] criando 3 spaces...");
  const spaces = await seedSpaces(ownerUser.id);
  console.log(`  - ${spaces.length} spaces criadas`);

  // Seed space member
  console.log("[seed] adicionando demo.member ao segundo space...");
  await seedSpaceMembers(memberUser.id, spaces[1].id);

  // Seed recordings, transcriptions, summaries, tasks
  console.log("[seed] populando recordings, transcriptions, summaries e tasks...");
  const { recordingCount, taskCount } = await seedRecordingsAndTasks(ownerUser.id, spaces[0].id);

  console.log(`[seed] ${spaces.length} spaces, ${recordingCount} recordings, ${taskCount} tasks criadas`);
  console.log("[seed] OK. Para apagar apenas dados demo: npm run db:demo:wipe");
}

main()
  .catch((err) => {
    console.error("[seed] falhou:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
