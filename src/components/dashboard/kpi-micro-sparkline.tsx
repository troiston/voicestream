/**
 * KPI Micro-Sparkline — 60×24px inline SVG com polyline e fill area.
 * Props: data array de até 7 valores, normaliza dinamicamente.
 */

export interface KpiMicroSparklineProps {
  data: number[];
}

export function KpiMicroSparkline({ data }: KpiMicroSparklineProps) {
  const width = 60;
  const height = 24;

  // Normalizar valores para caber em 0-24 de altura
  const max = Math.max(...data, 1);
  const normalized = data.map((v) => (v / max) * height);

  // Calcular pontos polyline (SVG coordinates)
  const points = normalized
    .map((y, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const yCoord = height - y;
      return `${x.toFixed(1)},${yCoord.toFixed(1)}`;
    })
    .join(" ");

  // Calcular polygon para fill area (linha + fechado)
  const fillPoints = normalized
    .map((y, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const yCoord = height - y;
      return `${x.toFixed(1)},${yCoord.toFixed(1)}`;
    });
  fillPoints.push(`${width},${height}`);
  fillPoints.push(`0,${height}`);
  const polygonPoints = fillPoints.join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="h-6 w-15"
      aria-hidden="true"
    >
      {/* Fill area com opacity */}
      <polygon
        points={polygonPoints}
        fill="var(--brand)"
        opacity="0.15"
      />
      {/* Polyline stroke */}
      <polyline
        points={points}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
