export function LogoBar() {
  const logos = [
    "Aurora Labs",
    "Banco Sudoeste",
    "Clínica+",
    "Deméter Foods",
    "Escala CX",
    "Grupo RG",
    "Saúde Ativa",
    "Tech Ventures",
  ] as const;

  return (
    <section
      className="border-y border-border/40 bg-surface-1/30 py-12 overflow-hidden"
      aria-labelledby="logo-bar-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p
          id="logo-bar-heading"
          className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/60"
        >
          Equipas-piloto em design
        </p>
        <div className="mt-6 overflow-hidden">
          <div className="flex animate-marquee gap-8 w-max">
            {logos.map((name) => (
              <span
                key={`${name}-1`}
                className="text-sm font-semibold text-muted-foreground/60 transition-colors hover:text-muted-foreground whitespace-nowrap"
              >
                {name}
              </span>
            ))}
            {/* Duplicated for seamless loop */}
            {logos.map((name) => (
              <span
                key={`${name}-2`}
                className="text-sm font-semibold text-muted-foreground/60 transition-colors hover:text-muted-foreground whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
