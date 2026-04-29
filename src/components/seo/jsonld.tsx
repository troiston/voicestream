import React from "react";

type JsonLdProps = {
  data: unknown;
  id?: string;
};

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      {...(id ? { id } : {})}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export type OrganizationJsonLdArgs = {
  name: string;
  url: string;
  logoUrl?: string;
};

export function organizationJsonLd({ name, url, logoUrl }: OrganizationJsonLdArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logoUrl ? { logo: logoUrl } : {}),
  };
}

export type BreadcrumbItem = { name: string; url: string };

export function breadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productPricingJsonLd(args: {
  name: string;
  url: string;
  description: string;
  offers: { name: string; price: string; priceCurrency: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: args.name,
    url: args.url,
    description: args.description,
    offers: args.offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price,
      priceCurrency: o.priceCurrency,
    })),
  };
}

export function articleJsonLd(args: {
  headline: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  imageUrl: string;
  pageUrl: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.headline,
    image: [args.imageUrl],
    datePublished: args.datePublished,
    dateModified: args.dateModified,
    author: { "@type": "Person", name: args.authorName },
    mainEntityOfPage: { "@type": "WebPage", "@id": args.pageUrl },
    description: args.description,
  };
}

