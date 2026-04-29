import { Spinner } from "@/components/ui/spinner";

export default function AuthLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <Spinner label="A carregar autenticação" />
    </div>
  );
}
