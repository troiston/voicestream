import type { Metadata } from "next"
import { Suspense } from "react"
import { ResetForm } from "@/components/auth/reset-form"

export const metadata: Metadata = {
  title: "Redefinir senha",
  robots: { index: false, follow: false },
}

export default function ResetPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Redefinir senha</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Escolha uma nova senha segura para a sua conta.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground text-center" role="status">A carregar…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  )
}
