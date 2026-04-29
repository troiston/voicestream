import Image from "next/image";
import Link from "next/link";
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { idFromTitle } from "@/lib/blog-toc";

function textFromNodes(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textFromNodes).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node) && node.props.children !== undefined) {
    return textFromNodes(node.props.children);
  }
  return "";
}

const proseLink =
  "text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function MdxH2({ children, className, ...rest }: ComponentPropsWithoutRef<"h2">) {
  const slug = idFromTitle(textFromNodes(children));
  return (
    <h2
      id={`h-${slug}`}
      className={`mt-8 scroll-m-20 text-2xl font-bold ${className ?? ""}`}
      {...rest}
    >
      {children}
    </h2>
  );
}

/** Evita segundo h1 na página (o título do artigo já é h1). */
function MdxH1({ children, className, ...rest }: ComponentPropsWithoutRef<"h1">) {
  return (
    <p
      className={`mt-6 text-2xl font-semibold tracking-tight ${className ?? ""}`}
      {...rest}
    >
      {children}
    </p>
  );
}

function MdxH3({ children, className, ...rest }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3 className={`mt-6 scroll-m-20 text-xl font-semibold ${className ?? ""}`} {...rest}>
      {children}
    </h3>
  );
}

function MdxA({ href, children, className, ...rest }: ComponentPropsWithoutRef<"a">) {
  const merged = `${proseLink} min-h-11 inline-flex items-center ${className ?? ""}`;
  if (href?.startsWith("/")) {
    return (
      <Link href={href} className={merged} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={merged}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}

function MdxImg({ src, alt, width, height, className }: ComponentPropsWithoutRef<"img">) {
  if (!src || typeof src !== "string") {
    return null;
  }
  const w = typeof width === "number" ? width : 800;
  const h = typeof height === "number" ? height : 450;
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={w}
      height={h}
      className={`my-4 h-auto w-full max-w-full rounded-[var(--radius-lg)] object-cover ${className ?? ""}`}
      sizes="(max-width: 768px) 100vw, 800px"
    />
  );
}

const pClass = "mb-3 text-[length:var(--text-sm)] leading-relaxed text-foreground/90";
const listClass = "my-3 ms-4 list-outside space-y-1 text-[length:var(--text-sm)] text-foreground/90";
const codeInline =
  "rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground before:content-none after:content-none";

/**
 * Mapa fechado de componentes MDX — sem JSX arbitrário no conteúdo além de intrínsecos mapeados.
 * Conteúdo em `content/blog/` é trusted (repositório).
 */
export const blogMdxComponents = {
  h1: MdxH1,
  h2: MdxH2,
  h3: MdxH3,
  p: ({ className, ...rest }: ComponentPropsWithoutRef<"p">) => (
    <p className={`${pClass} ${className ?? ""}`} {...rest} />
  ),
  a: MdxA,
  ul: ({ className, ...rest }: ComponentPropsWithoutRef<"ul">) => (
    <ul className={`${listClass} list-disc ${className ?? ""}`} {...rest} />
  ),
  ol: ({ className, ...rest }: ComponentPropsWithoutRef<"ol">) => (
    <ol className={`${listClass} list-decimal ${className ?? ""}`} {...rest} />
  ),
  li: ({ className, ...rest }: ComponentPropsWithoutRef<"li">) => (
    <li className={`ps-1 ${className ?? ""}`} {...rest} />
  ),
  strong: ({ className, ...rest }: ComponentPropsWithoutRef<"strong">) => (
    <strong className={`font-semibold text-foreground ${className ?? ""}`} {...rest} />
  ),
  em: ({ className, ...rest }: ComponentPropsWithoutRef<"em">) => (
    <em className={`italic ${className ?? ""}`} {...rest} />
  ),
  blockquote: ({ className, ...rest }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={`my-4 border-s-4 border-border ps-4 text-sm text-muted-foreground ${className ?? ""}`}
      {...rest}
    />
  ),
  hr: ({ className, ...rest }: ComponentPropsWithoutRef<"hr">) => (
    <hr className={`my-8 border-border ${className ?? ""}`} {...rest} />
  ),
  code: ({ className, children, ...rest }: ComponentPropsWithoutRef<"code">) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code className={`${codeInline} ${className ?? ""}`} {...rest}>
        {children}
      </code>
    );
  },
  pre: ({ className, ...rest }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className={`my-4 overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-muted p-4 text-sm ${className ?? ""}`}
      {...rest}
    />
  ),
  table: ({ className, ...rest }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 w-full overflow-x-auto">
      <table className={`w-full border-collapse text-sm ${className ?? ""}`} {...rest} />
    </div>
  ),
  thead: ({ className, ...rest }: ComponentPropsWithoutRef<"thead">) => (
    <thead className={`bg-muted/60 ${className ?? ""}`} {...rest} />
  ),
  tbody: ({ className, ...rest }: ComponentPropsWithoutRef<"tbody">) => (
    <tbody className={className} {...rest} />
  ),
  tr: ({ className, ...rest }: ComponentPropsWithoutRef<"tr">) => (
    <tr className={`border-b border-border ${className ?? ""}`} {...rest} />
  ),
  th: ({ className, ...rest }: ComponentPropsWithoutRef<"th">) => (
    <th className={`px-3 py-2 text-start font-semibold ${className ?? ""}`} {...rest} />
  ),
  td: ({ className, ...rest }: ComponentPropsWithoutRef<"td">) => (
    <td className={`px-3 py-2 align-top ${className ?? ""}`} {...rest} />
  ),
  img: MdxImg,
};
