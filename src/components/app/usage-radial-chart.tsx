interface UsageRadialChartProps {
  used: number;
  total: number;
  label: string;
}

export function UsageRadialChart({ used, total, label }: UsageRadialChartProps) {
  const percent = Math.min(Math.round((used / total) * 100), 100);
  const isWarning = percent >= 80;
  const color = isWarning ? "var(--warning)" : "var(--brand)";

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${percent}%, var(--surface-3) 0%)`,
        }}
      />
      <div className="absolute inset-3 rounded-full bg-surface-1" />
      <div className="relative text-center">
        <p className="text-2xl font-bold tabular-nums text-foreground">{percent}%</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
