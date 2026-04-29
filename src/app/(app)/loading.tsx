import { Spinner } from "@/components/ui/spinner";

export default function AppGroupLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-1 items-center justify-center p-6"
      role="status"
      aria-live="polite"
    >
      <Spinner label="A carregar o painel" className="gap-3" />
    </div>
  );
}
