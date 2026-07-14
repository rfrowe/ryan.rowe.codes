// Renders a unified git diff as colorized lines. Shared by the ship review pane and the
// destructive-op confirm dialog (delete/revert), so both show diffs the same way.

export function DiffView({ diff }: { diff: string }) {
  const lines = diff.split("\n");
  return (
    <pre className="diff">
      {lines.map((line, i) => {
        let cls = "diff__line";
        if (line.startsWith("+++") || line.startsWith("---")) cls += " diff__line--meta";
        else if (line.startsWith("@@")) cls += " diff__line--hunk";
        else if (line.startsWith("+")) cls += " diff__line--add";
        else if (line.startsWith("-")) cls += " diff__line--del";
        else if (line.startsWith("diff ") || line.startsWith("index ")) cls += " diff__line--meta";
        return (
          <span key={i} className={cls}>
            {line || " "}
          </span>
        );
      })}
    </pre>
  );
}
