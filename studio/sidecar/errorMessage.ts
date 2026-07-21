/** An unknown thrown value's message: `err.message` for an Error, else its `String(...)` form. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
