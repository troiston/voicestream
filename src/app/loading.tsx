import { Spinner } from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6"
      role="status"
      aria-live="polite"
    >
      <Spinner label="A carregar a aplicação" className="gap-3" />
      <p className="text-sm text-muted-foreground">A carregar…</p>
    </div>
  );
}
