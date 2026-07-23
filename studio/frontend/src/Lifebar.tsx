// The single lifebar renderer (grammar: origin -> your work -> target). Pure data in (a
// GitPostState, the <root> label, and which surface is asking), pure JSX out; no store access, so
// the tab bar and the palette never render the same post differently.

import type { GitPostState } from "../../shared/protocol";

export type LifebarVariant = "full" | "compact";

export interface LifebarPart {
  key: string;
  text: string;
  className: string;
  title?: string;
}

// Full variant bounds the trail to this many dots before collapsing the rest into an ellipsis;
// compact never bounds (every glyph already carries its own count).
const MAX_FULL_TRAIL = 4;

function trailParts(pushed: number, unpushed: number, incoming: number, variant: LifebarVariant): LifebarPart[] {
  if (variant === "compact") {
    const parts: LifebarPart[] = [];
    if (pushed > 0) {
      parts.push({ key: "pushed", text: `●${pushed}`, className: "lifebar__dot lifebar__dot--pushed", title: `${pushed} pushed to origin` });
    }
    if (unpushed > 0) {
      parts.push({ key: "unpushed", text: `○${unpushed}`, className: "lifebar__dot lifebar__dot--unpushed", title: `${unpushed} local, not pushed` });
    }
    if (incoming > 0) {
      parts.push({ key: "incoming", text: `◍${incoming}`, className: "lifebar__dot lifebar__dot--incoming", title: `${incoming} incoming from its own remote` });
    }
    return parts;
  }
  // One glyph per commit, ordered pushed then local-only then incoming, bounded then an ellipsis.
  const glyphs = [
    ...Array<{ text: string; kind: string }>(pushed).fill({ text: "●", kind: "pushed" }),
    ...Array<{ text: string; kind: string }>(unpushed).fill({ text: "○", kind: "unpushed" }),
    ...Array<{ text: string; kind: string }>(incoming).fill({ text: "◍", kind: "incoming" }),
  ];
  const parts = glyphs
    .slice(0, MAX_FULL_TRAIL)
    .map((g, i): LifebarPart => ({ key: `dot-${i}`, text: g.text, className: `lifebar__dot lifebar__dot--${g.kind}` }));
  if (glyphs.length > MAX_FULL_TRAIL) parts.push({ key: "overflow", text: "⋯", className: "lifebar__overflow" });
  return parts;
}

/** Pure fact-to-glyph mapping, separated from JSX so the mapping is testable without rendering. */
export function lifebarParts(post: GitPostState, root: string, variant: LifebarVariant): LifebarPart[] {
  const pushed = Math.max(post.ahead - post.unpushed, 0);
  const inSync = post.ahead === 0;
  // Nothing to show: no unlanded work, nothing incoming from its own remote, working tree clean.
  const collapsed = inSync && post.incoming === 0 && post.uncommitted === false;

  const target: LifebarPart = inSync
    ? { key: "target", text: `▸${root}`, className: "lifebar__target lifebar__target--synced", title: `In sync with ${root}` }
    : { key: "target", text: `▹${root}`, className: "lifebar__target lifebar__target--pending", title: `Not yet published to ${root}` };

  const parts: LifebarPart[] = [];

  if (!collapsed) {
    parts.push(
      post.inRoot
        ? { key: "cap", text: "◉", className: "lifebar__cap lifebar__cap--in-root", title: `Based on the version already in ${root}` }
        : { key: "cap", text: "│", className: "lifebar__cap lifebar__cap--net-new", title: `Forked off ${root}, not in it yet` },
    );
    parts.push(...trailParts(pushed, post.unpushed, post.incoming, variant));
  }

  parts.push(target);

  if (!collapsed) {
    if (post.uncommitted === true) {
      parts.push({ key: "adorn", text: "✎", className: "lifebar__adorn lifebar__adorn--uncommitted", title: "Uncommitted edits" });
    } else if (post.uncommitted === null) {
      parts.push({ key: "adorn", text: "◌", className: "lifebar__adorn lifebar__adorn--unknown", title: "No worktree — uncommitted status unknown" });
    }
  }

  // Behind is a separate warning, never a trail dot, and shows regardless of collapse.
  if (post.behind > 0) {
    parts.push(
      variant === "compact"
        ? { key: "behind", text: `⚠↓${post.behind}`, className: "lifebar__behind", title: `${post.behind} behind ${root} — update to catch up` }
        : { key: "behind", text: `⚠ ${post.behind} behind ${root}`, className: "lifebar__behind", title: "Update to catch up" },
    );
  }

  return parts;
}

export function Lifebar({ post, root, variant }: { post: GitPostState; root: string; variant: LifebarVariant }) {
  return (
    <span className={`lifebar lifebar--${variant}`}>
      {lifebarParts(post, root, variant).map((p) => (
        <span key={p.key} className={p.className} title={p.title}>
          {p.text}
        </span>
      ))}
    </span>
  );
}
