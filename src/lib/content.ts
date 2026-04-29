import fs from "node:fs";
import path from "node:path";

import type { BlogPost, ChangelogEntry, ChangelogType } from "@/types/blog";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");
const CHANGELOG_DIR = path.join(ROOT, "content", "changelog");

type ParsedFrontmatter = Record<string, string>;

/** Remove aspas YAML simples de valores escalares. */
function unwrapScalar(v: string): string {
  let t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  return t;
}

function parseSimpleFrontmatter(raw: string): { data: ParsedFrontmatter; body: string } {
  if (!raw.startsWith("---\n")) {
    return { data: {}, body: raw };
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { data: {}, body: raw };
  }
  const block = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const data: ParsedFrontmatter = {};
  for (const line of block.split("\n")) {
    if (!line.trim() || line.startsWith("#")) {
      continue;
    }
    const idx = line.indexOf(":");
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) {
      data[key] = unwrapScalar(value);
    }
  }
  return { data, body };
}

function splitTags(s: string): string[] {
  if (!s) {
    return [];
  }
  return s.split(",").map((t) => t.trim().replaceAll('"', "")).filter(Boolean);
}

/**
 * Ficheiros `.mdx` com frontmatter mínimo em `content/blog/`.
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    return null;
  }
  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseSimpleFrontmatter(raw);
  const title = data.title ?? slug;
  const description = data.description ?? "";
  const date = data.date ?? "";
  const author = data.author ?? "Equipa CloudVoice";
  const category = data.category ?? "Produto";
  const tags = splitTags(data.tags ?? "");
  const coverImage = data.coverImage ?? "/brand/logos/logo-01.png";
  const readMinutes = data.readMinutes ? Number.parseInt(data.readMinutes, 10) : 4;

  return {
    slug,
    title,
    description,
    date,
    author,
    category,
    tags,
    coverImage,
    readMinutes: Number.isFinite(readMinutes) ? readMinutes : 4,
    body: body.trim(),
  };
}

export function getAllPosts(): BlogPost[] {
  return getAllPostSlugs()
    .map((s) => getPostBySlug(s))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

const CHANGE_TYPES: ChangelogType[] = ["novo", "melhoria", "correcao"];

function isChangelogType(s: string): s is ChangelogType {
  return (CHANGE_TYPES as string[]).includes(s);
}

export function getChangelogEntries(): ChangelogEntry[] {
  if (!fs.existsSync(CHANGELOG_DIR)) {
    return [];
  }
  const files = fs.readdirSync(CHANGELOG_DIR).filter((f) => f.endsWith(".md"));
  const out: ChangelogEntry[] = [];
  for (const file of files) {
    const id = file.replace(/\.md$/, "");
    const full = path.join(CHANGELOG_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const { data, body } = parseSimpleFrontmatter(raw);
    const t = (data.type ?? "melhoria").toLowerCase();
    const type: ChangelogType = isChangelogType(t) ? t : "melhoria";
    out.push({
      id,
      date: data.date ?? "2026-01-01",
      type,
      title: data.title ?? id,
      body: body.trim(),
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
