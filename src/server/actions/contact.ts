"use server";

import { contactFormSchema } from "@/features/auth/schemas";

export type ContactActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; formErrors: Record<string, string[]>; message?: string }
  | { status: "submitting" };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { status: "error", formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  await sleep(450);
  if (Math.random() < 0.05) {
    return { status: "error", formErrors: {}, message: "Serviço indisponível. Tente mais tarde (mock). " };
  }
  return { status: "success" };
}
