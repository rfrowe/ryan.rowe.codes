// Renders a tool call's details for review: the diff for an edit, the incoming contents for a
// write, the command for Bash, or a clean key/value list for anything else. Shared by the
// permission prompt (approve what you can actually see) and the transcript's tool cards.

import { toolDetail, type DiffLine } from "./toolDetails";

/** Split a path into dir (dimmed) and basename (emphasized) so the filename reads at a glance. */
function FileHeader({ path }: { path: string }) {
  if (!path) return null;
  const slash = path.lastIndexOf("/");
  const dir = slash === -1 ? "" : path.slice(0, slash + 1);
  const name = slash === -1 ? path : path.slice(slash + 1);
  return (
    <div className="tdetail__file" title={path}>
      {dir && <span className="tdetail__file-dir">{dir}</span>}
      <span className="tdetail__file-name">{name}</span>
    </div>
  );
}

function gutter(kind: DiffLine["kind"]): string {
  return kind === "add" ? "+" : kind === "del" ? "−" : " ";
}

function Lines({ lines, className }: { lines: DiffLine[]; className?: string }) {
  return (
    <div className={`tdetail__diff ${className ?? ""}`}>
      {lines.map((ln, i) => (
        <div key={i} className={`tdetail__line tdetail__line--${ln.kind}`}>
          <span className="tdetail__gutter" aria-hidden="true">
            {gutter(ln.kind)}
          </span>
          {/* Non-breaking space keeps blank lines from collapsing to zero height. */}
          <span className="tdetail__text">{ln.text.length > 0 ? ln.text : " "}</span>
        </div>
      ))}
    </div>
  );
}

export function ToolDetailView({ toolName, input }: { toolName: string; input: unknown }) {
  const detail = toolDetail(toolName, input);

  if (detail.kind === "diff") {
    const empty = detail.sections.every((s) => s.lines.length === 0);
    return (
      <div className="tdetail">
        <FileHeader path={detail.filePath} />
        {empty ? (
          <p className="tdetail__empty">No textual change.</p>
        ) : (
          detail.sections.map((s, i) => (
            <div key={i} className="tdetail__section">
              {s.label && <div className="tdetail__section-label">{s.label}</div>}
              <Lines lines={s.lines} />
            </div>
          ))
        )}
      </div>
    );
  }

  if (detail.kind === "write") {
    // No prior text to diff against at approval time, so present the incoming contents as adds.
    const lines: DiffLine[] = detail.content.split("\n").map((text) => ({ kind: "add", text }));
    return (
      <div className="tdetail">
        <FileHeader path={detail.filePath} />
        <Lines lines={lines} className="tdetail__diff--write" />
      </div>
    );
  }

  if (detail.kind === "command") {
    return (
      <div className="tdetail">
        {detail.description && <div className="tdetail__desc">{detail.description}</div>}
        <pre className="tdetail__cmd">
          <span className="tdetail__cmd-sigil" aria-hidden="true">
            ${" "}
          </span>
          {detail.command}
        </pre>
      </div>
    );
  }

  if (detail.fields.length === 0) {
    return <p className="tdetail tdetail__empty">No arguments.</p>;
  }
  return (
    <dl className="tdetail tdetail__fields">
      {detail.fields.map((f) => (
        <div key={f.key} className="tdetail__field">
          <dt className="tdetail__key">{f.key}</dt>
          <dd className="tdetail__val">
            {f.block ? <pre className="tdetail__block">{f.value}</pre> : <span className="tdetail__inline">{f.value}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
