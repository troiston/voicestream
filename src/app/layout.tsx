import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { CookieConsentBanner } from "@/components/marketing/cookie-consent-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "CloudVoice";
const defaultDescription =
  "CloudVoice — copiloto de vida que organiza conversas, decisões e tarefas em Espaços, com privacidade por contexto.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: defaultDescription,
  // Ícones: ficheiros `icon.png` e `apple-icon.png` em `src/app/` (cópia de logo-01) — o Next gera as meta tags.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: appName,
    title: appName,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AppThemeProvider>
          <ToastProvider>
            {children}
            <CookieConsentBanner />
          </ToastProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
