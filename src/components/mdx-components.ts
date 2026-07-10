import H1 from "./mdx/H1.astro";
import H2 from "./mdx/H2.astro";
import H3 from "./mdx/H3.astro";
import H4 from "./mdx/H4.astro";
import H5 from "./mdx/H5.astro";
import H6 from "./mdx/H6.astro";
import P from "./mdx/P.astro";
import Link from "./mdx/Link.astro";

/**
 * MDX tag overrides passed to `<Content components={mdxComponents} />` in the post route.
 * Only the tags listed here are overridden; everything else renders as plain HTML.
 */
export const mdxComponents = {
  a: Link,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
};
