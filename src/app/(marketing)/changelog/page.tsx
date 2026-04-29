import type { Metadata } from "next";
import { getChangelogEntries } from "@/lib/content";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { ChangelogClient } from "./changelog-client";

const site = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Alterações, melhorias e notas técnicas (arquivo local).",
  alternates: { canonical: "/changelog" },
  openGraph: { url: "/changelog" },
};

export default function ChangelogPage() {
  const s = site();
  const items = getChangelogEntries();
  return (
    <div>
      <JsonLd
        id="jsonld-cg"
        data={breadcrumbListJsonLd([{ name: "Início", url: `${s}/` }, { name: "Changelog", url: `${s}/changelog` }])}
      />
      <section className="mx-auto max-w-2xl px-4 py-10" aria-labelledby="cg1">
        <h1 className="text-3xl font-bold" id="cg1">Changelog</h1>
        <p className="mt-1 text-sm text-foreground/60">Entradas a partir de {`content/changelog`}, mock.</p>
        <ChangelogClient initial={items} />
      </section>
    </div>
  );
}
