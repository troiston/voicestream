import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { verifyEmailAction } from "@/features/auth/actions"
import { VerifyContent } from "@/components/auth/verify-content"

export const metadata: Metadata = {
  title: "Verificar email",
  robots: { index: false, follow: false },
}

async function VerifyEmailHandler({ token }: { token: string | null }) {
  if (!token) {
    return <VerifyContent />
  }

  const result = await verifyEmailAction(token)

  if (result.ok) {
    redirect("/verify-email?status=success")
  } else {
    redirect("/verify-email?status=error")
  }
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackURL?: string }>
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Verificar o seu email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Verifique a sua caixa de entrada para confirmar a conta.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground text-center">A carregar…</p>}>
        <VerifyEmailWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function VerifyEmailWrapper({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackURL?: string }>
}) {
  const params = await searchParams
  const token = params.token ?? null

  if (token) {
    return <VerifyEmailHandler token={token} />
  }

  return <VerifyContent />
}
