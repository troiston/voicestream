import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { articleJsonLd, JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";
import { compileBlogMdx } from "@/lib/blog-mdx";
import { tocFromBody } from "@/lib/blog-toc";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { getPublicSiteUrl } from "@/lib/public-site-url";

type Params = { slug: string };

type PageProps = { params: Promise<Params> | Params };

export async function generateMetadata(p: PageProps): Promise<Metadata> {
  const p_ = await p.params;
  const a = getPostBySlug(p_.slug);
  if (!a) {
    return { title: "Não encontrado" };
  }
  const base = getPublicSiteUrl();
  return {
    metadataBase: new URL(base),
    title: a.title,
    description: a.description,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${a.slug}`,
      title: a.title,
      description: a.description,
    },
  };
}

export default async function BlogArticlePage(p: PageProps) {
  const p_ = await p.params;
  const post = getPostBySlug(p_.slug);
  if (!post) {
    notFound();
  }
  const s = getPublicSiteUrl();
  const full = `${s}/blog/${post.slug}`;
  const coverUrl = post.coverImage.startsWith("http") ? post.coverImage : `${s}${post.coverImage}`;
  const toc = tocFromBody(post.body);
  const other = getAllPosts().filter((q) => q.slug !== post.slug);
  const { content } = await compileBlogMdx(post.body);

  return (
    <article>
      <JsonLd
        id="jsonld-bc-article"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${s}/` },
          { name: "Blog", url: `${s}/blog` },
          { name: post.title, url: full },
        ])}
      />
      <JsonLd
        id="jsonld-article"
        data={articleJsonLd({
          headline: post.title,
          datePublished: post.date,
          dateModified: post.date,
          authorName: post.author,
          imageUrl: coverUrl,
          pageUrl: full,
          description: post.description,
        })}
      />
      <header className="mx-auto max-w-2xl border-b border-border px-4 py-10">
        <p className="text-sm text-muted-foreground">
          {post.category} · {post.readMinutes} min de leitura
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <p className="text-sm text-foreground/80">{post.description}</p>
        <p className="text-sm text-foreground/60" aria-label={`Autor: ${post.author}`}>
          {post.author} — {post.date}
        </p>
        <div
          className="relative mt-3 aspect-[21/9] w-full max-h-64 overflow-hidden rounded-[var(--radius-lg)]"
          aria-label="ilustração (mock)"
        >
          <Image
            className="h-auto w-full object-contain"
            width={800}
            height={420}
            src={post.coverImage}
            priority
            alt={`Ilustração, ${post.title}`}
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
        <p className="mt-2 text-xs text-foreground/60" aria-label="etiqueta">
          {post.tags.map((e) => (
            <span key={e} className="me-1 inline" aria-hidden>
              #{e}
            </span>
          ))}
        </p>
      </header>
      <div className="mx-auto max-w-3xl px-4 sm:flex sm:gap-8">
        {toc.length > 0 ? (
          <nav
            className="mb-6 w-full self-start border border-dashed border-border p-2 text-sm sm:sticky sm:top-4 sm:mb-0 sm:max-w-[11rem] sm:shrink-0"
            aria-label="Nesta página"
            aria-labelledby="h-toc"
          >
            <h2 className="text-xs font-bold uppercase" id="h-toc" aria-hidden>
              Índice
            </h2>
            <ol className="m-0 list-decimal space-y-1 p-0 ps-4">
              {toc.map((r) => (
                <li key={r.id}>
                  <a className="min-h-11 text-foreground" href={`#h-${r.id}`}>
                    {r.t}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="min-w-0 flex-1 max-w-3xl py-8 pe-0 ps-0" aria-label="Corpo do artigo">
          {content}
        </div>
      </div>
      <div className="mx-auto max-w-3xl border-t border-border px-4">
        <section className="py-8" aria-label="Mais a ler" aria-labelledby="rel-h">
          <h2 className="text-base font-bold" id="rel-h">
            Relacionados
          </h2>
          <ul className="m-0 list-outside p-0 ps-5" aria-label="Sugestões, mock">
            {other.length === 0 ? (
              <li>Sem itens, mock</li>
            ) : (
              other.map((a) => (
                <li key={a.slug}>
                  <Link className="min-h-11 text-accent" href={`/blog/${a.slug}`}>
                    {a.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}
