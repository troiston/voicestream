import { z } from "zod";

const email = z
  .string()
  .min(1, "O email é obrigatório")
  .email("Introduza um email válido");

const password = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(128, "A senha é longa de mais");

export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, "A senha é obrigatória"),
  remember: z
    .enum(["on", "off"])
    .default("off")
    .transform((v) => v === "on"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "O nome é obrigatório").max(100),
    email: email,
    password: password,
    confirmPassword: z.string().min(8, "Confirme a senha"),
    acceptTos: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine((d) => d.acceptTos === "on", {
    message: "Deve aceitar os termos para continuar",
    path: ["acceptTos"],
  });

export const forgotPasswordSchema = z.object({
  email: email,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token em falta"),
    password: password,
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

export const verifyEmailResendSchema = z.object({
  email: email.optional(),
});

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Código de 6 dígitos")
    .regex(/^\d{6}$/, "Apenas dígitos"),
});

export const mfaRecoverySchema = z.object({
  code: z.string().min(8, "Código de recuperação inválido").max(64),
});

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: email,
  subject: z.enum(["suporte", "vendas", "imprensa", "parcerias", "outro"]),
  message: z.string().min(20).max(5000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
