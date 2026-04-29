import type { Metadata } from "next";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { getAllPosts } from "@/lib/content";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { BlogClientFilters } from "./blog-filters";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notas de produto, voz, segurança; conteúdo MDX com frontmatter.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog" },
};

export default function BlogListPage() {
  const s = getPublicSiteUrl();
  const all = getAllPosts();
  return (
    <div>
      <JsonLd
        id="jsonld-bc-b"
        data={breadcrumbListJsonLd([{ name: "Início", url: `${s}/` }, { name: "Blog", url: `${s}/blog` }])}
      />
      <section className="mx-auto max-w-5xl px-4 py-12" aria-labelledby="b-h1">
        <div className="mb-12">
          <h1 className="text-4xl font-bold" id="b-h1">Blog</h1>
          <p className="mt-2 text-foreground/60">
            Conteúdo sobre produto, voz, segurança e desenvolvimento.
          </p>
        </div>
        <BlogClientFilters posts={all} />
        <p className="mt-6 text-xs text-foreground/50">(Busca e filtros funcionam localmente)</p>
      </section>
    </div>
  );
}
