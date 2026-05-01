"use server";

import { createSpaceSchema } from "@/features/spaces/schemas";
import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import type { ActionResult } from "@/features/auth/actions";
import type { SpaceItem } from "@/types/domain";
import { sendTeamInviteEmail } from "@/lib/email/send-helpers";
import { env } from "@/lib/env";
import crypto from "crypto";
import { z } from "zod";

export type CreateSpaceState = ActionResult<{ space: SpaceItem }> | null;

export async function createSpaceAction(
  _prev: CreateSpaceState,
  formData: FormData,
): Promise<CreateSpaceState> {
  const session = await requireSession();

  const descRaw = formData.get("description");
  const description = typeof descRaw === "string" ? descRaw : "";
  const parsed = createSpaceSchema.safeParse({
    name: formData.get("name"),
    description,
  });

  if (!parsed.success) {
    return {
      ok: false,
      formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // Create space
    const space = await db.space.create({
      data: {
        ownerId: session.userId,
        name: parsed.data.name,
        description: parsed.data.description,
        kind: "pessoal",
        color: "oklch(58% 0.1 240)",
        icon: "default",
      },
    });

    // Create SpaceMember for owner
    await db.spaceMember.create({
      data: {
        spaceId: space.id,
        userId: session.userId,
        role: "owner",
        status: "active",
        joinedAt: new Date(),
      },
    });

    const spaceItem: SpaceItem = {
      id: space.id,
      name: space.name,
      description: space.description || "",
      lastActivity: space.createdAt.toISOString(),
      memberCount: 1,
      color: space.color || "oklch(58% 0.1 240)",
      icon: space.icon || "default",
    };

    return { ok: true, data: { space: spaceItem } };
  } catch (error) {
    console.error("Error creating space:", error);
    return {
      ok: false,
      message: "Não foi possível criar o espaço.",
    };
  }
}

const inviteToSpaceSchema = z.object({
  spaceId: z.string().min(1),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "membro", "convidado"]),
});

export type InviteToSpaceState = ActionResult<{ inviteId: string }> | null;

export async function inviteToSpaceAction(
  _prev: InviteToSpaceState,
  formData: FormData,
): Promise<InviteToSpaceState> {
  const session = await requireSession();

  const parsed = inviteToSpaceSchema.safeParse({
    spaceId: formData.get("spaceId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // Check if user is owner or admin of the space
    const space = await db.space.findUnique({
      where: { id: parsed.data.spaceId },
      include: { owner: { select: { name: true } } },
    });

    if (!space) {
      return { ok: false, message: "Espaço não encontrado." };
    }

    // Check permissions
    if (space.ownerId !== session.userId) {
      const member = await db.spaceMember.findUnique({
        where: {
          spaceId_userId: {
            spaceId: parsed.data.spaceId,
            userId: session.userId,
          },
        },
      });

      if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { ok: false, message: "Permissão negada." };
      }
    }

    // Create invite
    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await db.spaceInvite.create({
      data: {
        spaceId: parsed.data.spaceId,
        invitedByUserId: session.userId,
        email: parsed.data.email,
        role: parsed.data.role,
        token,
        expiresAt,
      },
    });

    // Send email
    const inviterName = space.owner.name || "Um utilizador";
    const acceptUrl = `${env.NEXT_PUBLIC_APP_URL}/invites/${token}`;

    try {
      await sendTeamInviteEmail(
        parsed.data.email,
        inviterName,
        space.name,
        acceptUrl
      );
    } catch (emailError) {
      console.error("Error sending invite email:", emailError);
      // Don't fail if email fails in dev/test
    }

    return { ok: true, data: { inviteId: invite.id } };
  } catch (error) {
    console.error("Error inviting to space:", error);
    return {
      ok: false,
      message: "Não foi possível enviar o convite.",
    };
  }
}
