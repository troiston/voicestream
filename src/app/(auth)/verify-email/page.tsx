import type { Metadata } from "next"
import { Suspense } from "react"
import { VerifyContent } from "@/components/auth/verify-content"

export const metadata: Metadata = {
  title: "Verificar email",
  robots: { index: false, follow: false },
}

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Verificar o seu email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Verifique a sua caixa de entrada para confirmar a conta.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground text-center">A carregar…</p>}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
