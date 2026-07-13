/**
 * Formats a post's `created_at` as `YYYY-MM-DD` in UTC.
 *
 * The site's post URLs (`/blog/<date>/<slug>`) are derived from this value, so it
 * must stay stable regardless of the host machine's local timezone.
 */
export const formatPostDate = (date: Date): string => date.toISOString().slice(0, 10)
