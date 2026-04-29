import Link from "next/link";

import { cn } from "@/lib/utils";

export function DenseMenu({ label }: { label: string }) {
  return (
    <details className="group relative w-fit">
      <summary
        className={cn(
          "flex list-none min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3",
          "text-sm font-medium text-foreground ring-1 ring-border",
          "hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {label}
        <span
          className="text-foreground/40 group-open:rotate-180"
          style={{ display: "inline-block", transition: "transform 0.2s" }}
          aria-hidden
        >
          ▼
        </span>
      </summary>
      <ul
        className="absolute z-40 mt-1 w-56 min-w-48 rounded-[var(--radius-md)] border border-border bg-surface-1 p-1 shadow-sm"
        role="menu"
      >
        <li>
          <Link
            className="block min-h-11 w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm hover:bg-surface-2"
            href="/"
          >
            Ir para a página inicial
          </Link>
        </li>
        <li>
          <span className="block min-h-11 w-full cursor-default rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-foreground/50">
            Ação mock (Espaço atual: Equipe A)
          </span>
        </li>
        <li>
          <span className="block min-h-11 w-full cursor-default rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-foreground/50">
            Ação mock (Espaço: Cliente B)
          </span>
        </li>
      </ul>
    </details>
  );
}
