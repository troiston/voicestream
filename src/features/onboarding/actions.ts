"use server"

import { db } from "@/lib/db"
import { getSession } from "@/features/auth/session"

/**
 * Mark onboarding as completed for the current user.
 * Called when the wizard's final step is finished.
 */
export async function completeOnboardingAction() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return { ok: false, error: "Não autenticado" }
    }

    await db.user.update({
      where: { id: session.userId },
      data: { onboardingCompletedAt: new Date() }
    })

    return { ok: true }
  } catch (error) {
    console.error("[completeOnboardingAction]", error)
    return { ok: false, error: "Erro ao completar onboarding" }
  }
}
