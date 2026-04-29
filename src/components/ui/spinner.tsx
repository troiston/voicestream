import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = "Carregando" }: SpinnerProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground"
        aria-hidden="true"
      />
      <span className="text-sm text-foreground/70">{label}</span>
    </div>
  );
}

