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

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export type InvoiceRow = {
  id: string;
  number: string | null;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  hostedInvoiceUrl: string | null;
  pdfUrl: string | null;
};

function formatInvoiceAmount(amountCents: number, currency: string): string {
  return money.format(amountCents / 100);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(iso));
}

function statusBadgeVariant(status: string): "default" | "success" | "warning" | "destructive" {
  switch (status.toLowerCase()) {
    case "paid":
      return "success";
    case "open":
      return "warning";
    case "void":
    case "uncollectible":
      return "destructive";
    default:
      return "default";
  }
}

function statusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
      return "Pago";
    case "open":
      return "Em aberto";
    case "void":
      return "Anulada";
    case "uncollectible":
      return "Não cobrada";
    default:
      return status;
  }
}

interface InvoicesTableProps {
  invoices: InvoiceRow[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const handleViewInvoice = (invoice: InvoiceRow) => {
    if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, "_blank");
    } else {
      toast.info("Link da fatura não disponível");
    }
  };

  const handleDownload = (invoice: InvoiceRow) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, "_blank");
    } else {
      toast.info("PDF não disponível para download");
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma fatura disponível</p>
      </div>
    );
  }

  return (
    <Table aria-label="Histórico de faturas">
      <TableHeader>
        <TableRow className="border-border/60 hover:bg-transparent">
          <TableHead className="text-muted-foreground">Data</TableHead>
          <TableHead className="text-muted-foreground">Nº Fatura</TableHead>
          <TableHead className="text-muted-foreground">Valor</TableHead>
          <TableHead className="text-muted-foreground">Estado</TableHead>
          <TableHead className="text-muted-foreground">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id} className="border-border/60 hover:bg-surface-2/50 transition-colors">
            <TableCell>
              <time dateTime={inv.createdAt}>{formatDate(inv.createdAt)}</time>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {inv.number || "—"}
            </TableCell>
            <TableCell className="font-medium text-foreground">
              {formatInvoiceAmount(inv.amountCents, inv.currency)}
            </TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant(inv.status)}>
                {statusLabel(inv.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {inv.hostedInvoiceUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11"
                    onClick={() => handleViewInvoice(inv)}
                  >
                    Ver
                  </Button>
                )}
                {inv.pdfUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11"
                    onClick={() => handleDownload(inv)}
                  >
                    PDF
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
