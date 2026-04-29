import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie a sua conta CloudVoice.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/register" },
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Criar a sua conta</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Comece gratuitamente — sem cartão de crédito
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-brand hover:text-brand-hover transition-colors"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
