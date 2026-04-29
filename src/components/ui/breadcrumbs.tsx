import Link from "next/link";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href: string; current?: boolean };

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((i, idx) => (
          <li key={i.href + i.label} className="inline-flex max-w-full items-center gap-1">
            {idx > 0 ? <span className="text-foreground/30" aria-hidden="true">/</span> : null}
            {i.current ? (
              <span className="font-medium text-foreground" aria-current="page">
                {i.label}
              </span>
            ) : (
              <Link
                className={cn("truncate decoration-accent/0 hover:decoration-auto hover:underline")}
                href={i.href}
              >
                {i.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
