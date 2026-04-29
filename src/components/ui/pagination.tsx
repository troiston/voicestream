import Link from "next/link";

import { cn } from "@/lib/utils";

export function Pagination({
  current,
  total,
  baseHref,
  query,
}: {
  current: number;
  total: number;
  baseHref: string;
  query: string;
}) {
  if (total <= 1) {
    return null;
  }
  const build = (p: number) => {
    const s = new URLSearchParams();
    s.set(query, String(p));
    return `${baseHref}?${s.toString()}`;
  };
  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1 py-4">
      <PaginationLink
        href={build(Math.max(1, current - 1))}
        label="Página anterior"
        disabled={current <= 1}
        rel="prev"
      />
      <span className="px-2 text-sm text-muted-foreground" aria-current="true">
        Página {current} de {total}
      </span>
      <PaginationLink
        href={build(Math.min(total, current + 1))}
        label="Página seguinte"
        disabled={current >= total}
        rel="next"
      />
    </nav>
  );
}

function PaginationLink({
  href,
  label,
  disabled,
  rel,
}: {
  href: string;
  label: string;
  disabled?: boolean;
  rel: string;
}) {
  if (disabled) {
    return (
      <span
        className={cn(
          "min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-border px-3",
          "inline-flex text-sm text-muted-foreground/50",
        )}
        aria-disabled
      >
        {rel === "prev" ? "‹" : "›"}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-border px-3 text-sm font-medium hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      rel={rel}
      aria-label={label}
    >
      {rel === "prev" ? "‹" : "›"}
    </Link>
  );
}
