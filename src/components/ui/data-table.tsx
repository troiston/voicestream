import type React from "react";

import { cn } from "@/lib/utils";

type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => React.ReactNode;
};

export type DataTableProps<T> = {
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: ReadonlyArray<T>;
  "aria-label": string;
  className?: string;
  rowKey: (row: T) => string;
};

export function DataTable<T>({
  columns,
  rows,
  "aria-label": ariaLabel,
  className,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
      <table
        className={cn("w-full min-w-[32rem] border-collapse text-left text-sm", className)}
        aria-label={ariaLabel}
      >
        <thead>
          <tr className="border-b border-border bg-surface-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn("p-3 first:pl-4 last:pr-4", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border/80 last:border-0 hover:bg-surface-1/50"
            >
              {columns.map((col) => (
                <td
                  key={`${rowKey(row)}-${col.key}`}
                  className={cn("p-3 first:pl-4 last:pr-4", col.className)}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
