import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { blogMdxComponents } from "@/components/mdx/blog-mdx-components";

export async function compileBlogMdx(source: string) {
  return compileMDX({
    source,
    components: blogMdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });
}
