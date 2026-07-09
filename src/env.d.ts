/// <reference types="astro/client" />

// Plain `tsc` (unlike `astro check`) has no built-in resolver for `.astro` files --
// that resolution normally comes from the Astro language server/compiler. This shim
// lets files like mdx-components.ts import `.astro` components under the standalone
// `tsc --noEmit` gate; `astro check` remains the source of truth for their real prop types.
declare module "*.astro" {
  const Component: (...args: any[]) => any;
  export default Component;
}
