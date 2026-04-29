import { Spinner } from "@/components/ui/spinner";

export default function MarketingLoading() {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 py-32"
      role="status"
      aria-live="polite"
    >
      <Spinner label="A carregar" />
    </div>
  );
}
