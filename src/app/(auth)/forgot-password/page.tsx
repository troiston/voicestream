import type { Metadata } from "next"
import { ForgotForm } from "@/components/auth/forgot-form"

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Pedir link de redefinição para a sua conta VoiceStream.",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enviaremos instruções para o seu email, se a conta existir.
        </p>
      </div>
      <ForgotForm />
    </div>
  )
}
