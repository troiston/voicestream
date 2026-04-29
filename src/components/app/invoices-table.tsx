"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { MockInvoice } from "@/lib/mocks/invoices";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatInvoiceAmount(inv: MockInvoice): string {
  return money.format(inv.amountCents / 100);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(iso));
}

interface InvoicesTableProps {
  invoices: MockInvoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const handleDownload = (inv: MockInvoice) => {
    toast.info("Fatura em formato mock — documento não disponível para download");
  };

  return (
    <Table aria-label="Lista de faturas em modo demonstração">
      <TableHeader>
        <TableRow className="border-border/60 hover:bg-transparent">
          <TableHead className="text-muted-foreground">Data</TableHead>
          <TableHead className="text-muted-foreground">Valor</TableHead>
          <TableHead className="text-muted-foreground">Estado</TableHead>
          <TableHead className="text-muted-foreground">Documento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id} className="border-border/60 hover:bg-surface-2/50 transition-colors">
            <TableCell>
              <time dateTime={inv.date}>{formatDate(inv.date)}</time>
            </TableCell>
            <TableCell className="font-medium text-foreground">{formatInvoiceAmount(inv)}</TableCell>
            <TableCell>
              <Badge variant={inv.status === "pago" ? "success" : "warning"}>
                {inv.status === "pago" ? "Pago" : "Em aberto"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() => handleDownload(inv)}
              >
                {inv.pdfLabel}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
