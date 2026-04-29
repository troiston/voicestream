import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Entrar",
  description: "Aceda à sua conta CloudVoice.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Entre na sua conta CloudVoice
        </p>
      </div>

      <LoginForm />

      <div className="space-y-3 text-center text-sm">
        <p>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Esqueci a senha
          </Link>
        </p>
        <p className="text-muted-foreground">
          Sem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-brand hover:text-brand-hover transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>

      <div className="border-t border-border/60 pt-4 text-center">
        <p className="mb-3 text-xs text-muted-foreground">ou continuar com</p>
        <div className="flex gap-2">
          <span className="flex-1 rounded-[var(--radius-md)] border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground/60 text-center">
            Google (em breve)
          </span>
          <span className="flex-1 rounded-[var(--radius-md)] border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground/60 text-center">
            Microsoft (em breve)
          </span>
        </div>
      </div>
    </div>
  )
}
