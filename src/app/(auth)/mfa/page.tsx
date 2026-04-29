import type { Metadata } from "next"
import { MfaView } from "@/components/auth/mfa-form"

export const metadata: Metadata = {
  title: "Verificação MFA",
  robots: { index: false, follow: false },
}

export default function MfaPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Autenticação em dois passos</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Introduza o código da sua aplicação autenticadora.
        </p>
      </div>
      <MfaView />
    </div>
  )
}
