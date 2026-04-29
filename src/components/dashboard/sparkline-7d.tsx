/**
 * Sparkline SVG — apenas transform/opacity-safe; sem animação de path.
 */

export interface Sparkline7dProps {
  values: readonly number[];
  labels: readonly string[];
  title: string;
  description: string;
}

function normalize(values: readonly number[]): number[] {
  if (values.length === 0) {
    return [];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => (v - min) / span);
}

export function Sparkline7d({ values, labels, title, description }: Sparkline7dProps) {
  const n = normalize(values);
  const w = 100;
  const h = 40;
  const pad = 4;
  const pts = n
    .map((y, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(n.length - 1, 1);
      const yy = pad + (1 - y) * (h - pad * 2);
      return `${x.toFixed(1)},${yy.toFixed(1)}`;
    })
    .join(" ");

  return (
    <figure className="space-y-2">
      <figcaption>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </figcaption>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-12 w-full max-w-md text-accent"
        aria-hidden
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts}
        />
        {n.map((y, i) => {
          const x = pad + (i * (w - pad * 2)) / Math.max(n.length - 1, 1);
          const yy = pad + (1 - y) * (h - pad * 2);
          return <circle key={i} cx={x} cy={yy} r="2.5" fill="currentColor" />;
        })}
      </svg>
      <div className="flex max-w-md justify-between gap-1 text-[length:var(--text-xs)] text-muted-foreground">
        {labels.map((lab, i) => (
          <span key={`${lab}-${i}`} className="min-w-0 flex-1 truncate text-center">
            {lab}
          </span>
        ))}
      </div>
    </figure>
  );
}
