// New-post dialog: title (required, derives an editable kebab-case slug), headline
// (required, one of the four frontmatter keys the collection schema enforces), and
// created_at (defaults to today). Submitting maps to a post.create over the WS; the app
// closes this on the ok post.result (the new tab arrives via tabs/active).

import { useEffect, useState } from "react";
import { kebabSlug } from "./slug";

export interface NewPostFields {
  title: string;
  slug: string;
  headline: string;
  created_at: string;
}

interface NewPostDialogProps {
  creating: boolean;
  error: string | null;
  /** Seeds the title on mount (e.g. the command-palette search term). The slug derives from
   *  it until the author edits the slug. Defaults to empty for the plain "New post" button. */
  initialTitle?: string;
  onSubmit: (fields: NewPostFields) => void;
  onClose: () => void;
}

function today(): string {
  // Local calendar date, not UTC: toISOString() is UTC, so an author in a behind-UTC timezone (e.g.
  // US Pacific) late in the day would pre-fill tomorrow's date. created_at is date-only, which the
  // preview and route read as UTC midnight consistently, so the author's local day is the right seed.
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function NewPostDialog({ creating, error, initialTitle = "", onSubmit, onClose }: NewPostDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState("");
  // Once the author edits the slug, stop auto-deriving it from the title.
  const [slugTouched, setSlugTouched] = useState(false);
  const [headline, setHeadline] = useState("");
  const [createdAt, setCreatedAt] = useState(today());

  // Esc closes the dialog (mirrors the backdrop click), but not mid-create: a create is
  // in flight and the tab arrives via the post.result the app is still awaiting; window-level
  // so it fires regardless of which field (or nothing) holds focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !creating) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [creating, onClose]);

  const effectiveSlug = slugTouched ? slug : kebabSlug(title);
  // headline is required: a blank one fails the frontmatter contract server-side ("missing or
  // empty frontmatter key: headline"), so gate on it here rather than round-tripping to fail.
  const canSubmit =
    title.trim().length > 0 && effectiveSlug.length > 0 && headline.trim().length > 0 && !creating;

  function submit(): void {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), slug: effectiveSlug, headline: headline.trim(), created_at: createdAt });
  }

  return (
    <div className="newpost">
      <header className="newpost__head">
        <h2>New post</h2>
      </header>

      <div className="newpost__form">
        <label className="newpost__field">
          <span className="newpost__label">Title</span>
          <input
            className="input"
            autoFocus
            value={title}
            placeholder="Aligning a Skyline"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </label>
        <label className="newpost__field">
          <span className="newpost__label">Slug</span>
          <input
            className="input input--mono"
            value={effectiveSlug}
            placeholder="aligning-a-skyline"
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(kebabSlug(e.target.value));
            }}
          />
        </label>
        <label className="newpost__field">
          <span className="newpost__label">Headline</span>
          <input
            className="input"
            value={headline}
            placeholder="teaching a horizon to stand up straight"
            onChange={(e) => setHeadline(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </label>
        <label className="newpost__field">
          <span className="newpost__label">Created</span>
          <input
            className="input input--mono"
            value={createdAt}
            placeholder="YYYY-MM-DD"
            inputMode="numeric"
            pattern="\d{4}-\d{2}-\d{2}"
            onChange={(e) => setCreatedAt(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="newpost__error">{error}</p>}

      <footer className="newpost__foot">
        <button className="btn btn--ghost" onClick={onClose} disabled={creating}>
          Cancel
        </button>
        <button className="btn btn--primary" onClick={submit} disabled={!canSubmit}>
          {creating ? "Creating…" : "Create"}
        </button>
      </footer>
    </div>
  );
}
