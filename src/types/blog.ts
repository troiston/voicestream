export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  readMinutes: number;
  slug: string;
};

export type BlogPost = BlogFrontmatter & {
  body: string;
};

export type ChangelogType = "novo" | "melhoria" | "correcao";

export type ChangelogEntry = {
  id: string;
  date: string;
  type: ChangelogType;
  title: string;
  body: string;
};
