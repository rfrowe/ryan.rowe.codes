/// <reference types="astro/client" />

// Plain `tsc` has no resolver for `.astro` files, so this shim lets `.ts` files import
// `.astro` components under `tsc --noEmit`; `astro check` verifies their real prop types.
declare module "*.astro" {
  const Component: (...args: any[]) => any;
  export default Component;
}
