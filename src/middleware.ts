import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getS3PublicOrigin(): string | null {
  const raw = process.env.S3_PUBLIC_ENDPOINT ?? process.env.S3_ENDPOINT;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const s3Origin = getS3PublicOrigin();

  const connectSrc = [
    "'self'",
    "https://api.stripe.com",
    "https://*.stripe.com",
    "https://static.cloudflareinsights.com",
    s3Origin,
  ]
    .filter(Boolean)
    .join(" ");

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: https: blob:",
    "media-src 'self' blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.stripe.com https://static.cloudflareinsights.com",
    `connect-src ${connectSrc}`,
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
