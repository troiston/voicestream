import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // CSP temporariamente simplificada (sem nonce), para não quebrar os scripts do Next/App Router.
  // Quando integrarmos nonce corretamente no App Router, podemos reintroduzir uma policy mais restritiva.
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.stripe.com",
    "connect-src 'self' https://api.stripe.com https://*.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "upgrade-insecure-requests",
  ].join("; ");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!api/webhooks|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
