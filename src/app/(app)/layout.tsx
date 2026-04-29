import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { requireSession } from "@/features/auth/guards";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return (
    <AppShell userEmail={session.email} userName={session.name}>
      {children}
    </AppShell>
  );
}
