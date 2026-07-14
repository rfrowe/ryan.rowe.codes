// Live preview: an iframe pointed at the Astro dev server's rendered post. The URL is
// frontmatter-derived and arrives via preview.url messages, never hardcoded here. When the
// frontmatter is invalid the sidecar sends { valid: false }, and we show the errors instead of
// navigating the iframe into Astro's dev overlay.
//
// The sidecar restarts the Astro daemon in the active post's worktree on every switch (so a new
// post's route resolves), and that restart takes a moment; the URL can arrive before the server
// is answering. Mounting the iframe then would show the browser's "localhost refused to connect".
// So before mounting we probe the URL until it responds, showing a "Starting…" state meanwhile.

import { useEffect, useState } from "react";
import type { PreviewState } from "../../shared/types";

interface PreviewProps {
  preview: PreviewState;
}

// Poll cadence and budget for the readiness probe (~15s before we call it unreachable).
const PROBE_INTERVAL_MS = 300;
const PROBE_MAX_TRIES = 50;

type Phase = "starting" | "ready" | "unreachable";

export function Preview({ preview }: PreviewProps) {
  // Bumping this remounts the iframe (and re-runs the probe), forcing a reload without touching the
  // cross-origin contentWindow or mutating the derived URL.
  const [reloadNonce, setReloadNonce] = useState(0);
  const [phase, setPhase] = useState<Phase>("starting");

  const url = preview.valid ? preview.url : null;

  // Probe the dev server until it answers before mounting the iframe. A no-cors GET resolves once
  // the server is listening (opaque response) and rejects while the port is refused: exactly the
  // "is Astro back up?" signal we need, without needing CORS or reading the body.
  useEffect(() => {
    if (!url) return;
    setPhase("starting");
    let live = true;
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    const probe = async (): Promise<void> => {
      try {
        await fetch(url, { mode: "no-cors", cache: "no-store", signal: AbortSignal.timeout(2000) });
        if (live) setPhase("ready");
      } catch {
        if (!live) return;
        tries += 1;
        if (tries >= PROBE_MAX_TRIES) setPhase("unreachable");
        else timer = setTimeout(() => void probe(), PROBE_INTERVAL_MS);
      }
    };
    void probe();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [url, reloadNonce]);

  return (
    <div className="preview">
      <div className="preview__bar">
        <span className="preview__label">Preview</span>
        <span className="preview__url" title={preview.valid ? preview.url : undefined}>
          {preview.valid ? preview.url : "frontmatter invalid"}
        </span>
        <button
          className="btn btn--ghost"
          onClick={() => setReloadNonce((n) => n + 1)}
          disabled={!preview.valid}
          title="Reload preview"
        >
          Reload
        </button>
      </div>
      {preview.valid ? (
        phase === "ready" ? (
          <iframe
            key={reloadNonce}
            className="preview__frame"
            src={preview.url}
            title="Post preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="preview__status">
            {phase === "starting" ? (
              <>
                <p className="preview__status-title">Starting the preview server…</p>
                <p className="preview__status-hint">Astro is (re)starting in this post's worktree.</p>
              </>
            ) : (
              <>
                <p className="preview__status-title">Preview server didn't respond</p>
                <p className="preview__status-hint">Astro may have failed to start. Hit Reload to try again.</p>
              </>
            )}
          </div>
        )
      ) : (
        <div className="preview__invalid">
          <p className="preview__invalid-title">Preview unavailable — frontmatter is invalid</p>
          <ul className="preview__invalid-list">
            {preview.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          <p className="preview__invalid-hint">
            Fix the required keys (title, slug, headline, created_at) and the preview will resume.
          </p>
        </div>
      )}
    </div>
  );
}
