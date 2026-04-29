"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

import type { BlogPost } from "@/types/blog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = { posts: readonly BlogPost[] };

const CATEGORY_COLORS: Record<string, string> = {
  "Produto": "bg-brand/15 text-brand",
  "Voz": "bg-info/15 text-info",
  "Segurança": "bg-danger/15 text-danger",
  "Desenvolvimento": "bg-success/15 text-success",
};

export function BlogClientFilters({ posts }: Props) {
  const g = useId();
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const allCategories = useMemo(() => {
    return Array.from(new Set(posts.map((p) => p.category)));
  }, [posts]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return posts.filter((p) => {
      const catOk = activeCategory === "all" || p.category === activeCategory;
      if (!catOk) {
        return false;
      }
      if (qq.length === 0) {
        return true;
      }
      return (
        p.title.toLowerCase().includes(qq) ||
        p.description.toLowerCase().includes(qq) ||
        p.author.toLowerCase().includes(qq) ||
        p.category.toLowerCase().includes(qq) ||
        p.tags.some((t) => t.toLowerCase().includes(qq))
      );
    });
  }, [posts, q, activeCategory]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="max-w-md">
        <Input
          id={`${g}-q`}
          name="q"
          label="Procurar artigos"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
          }}
          type="search"
          autoComplete="off"
          placeholder="Título, tag, autor…"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border bg-surface-1 text-foreground hover:border-border/80"
          )}
        >
          Todos
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              activeCategory === cat
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-surface-1 text-foreground hover:border-border/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Post */}
      {featured ? (
        <Link
          href={`/blog/${featured.slug}`}
          className="group block"
          aria-label={`Ler artigo em destaque: ${featured.title}`}
        >
          <div className="glass-card overflow-hidden rounded-xl p-0 transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-6 md:flex-row md:gap-8">
              {/* Gradient Area */}
              <div className="relative md:max-w-[280px] md:shrink-0">
                <div className="bg-gradient-to-br from-brand/20 to-brand/5 aspect-video md:aspect-auto md:h-full rounded-lg w-full md:min-h-[240px] flex items-center justify-center">
                  {featured.coverImage && featured.coverImage !== "/brand/logos/logo-01.png" ? (
                    <Image
                      src={featured.coverImage}
                      width={400}
                      height={300}
                      alt={featured.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Artigo em destaque</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Content */}
              <div className="flex flex-col justify-between gap-4 md:py-2 md:pe-2 flex-1">
                <div>
                  <Badge className={cn("mb-3", CATEGORY_COLORS[featured.category] || "bg-muted text-muted-foreground")}>
                    {featured.category}
                  </Badge>
                  <h2 className="text-2xl font-bold leading-snug text-foreground group-hover:text-brand transition-colors">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-foreground/70 line-clamp-2">
                    {featured.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.readMinutes} min de leitura</span>
                  <span>·</span>
                  <span>Por {featured.author}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ) : null}

      {/* Posts Grid */}
      {rest.length === 0 && filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Sem artigos com estes critérios.</p>
      ) : rest.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group"
              aria-label={`Ler: ${p.title}`}
            >
              <div className="glass-card h-full rounded-xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <Badge className={cn("shrink-0", CATEGORY_COLORS[p.category] || "bg-muted text-muted-foreground")}>
                    {p.category}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3 border-t border-border/50 pt-3">
                  <div className="text-xs text-muted-foreground">
                    {p.date} · {p.readMinutes} min
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Por {p.author}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
