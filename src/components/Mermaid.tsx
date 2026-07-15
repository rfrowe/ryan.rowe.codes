import { useEffect, useId, useState } from "react";
import { useThemeMode } from "@lib/useThemeMode";
import * as styles from "./Mermaid.css.ts";

interface MermaidProps {
  /** Raw mermaid diagram source, i.e. the body of the referenced `.mmd` file. */
  code: string;
  /** Accessible name for the rendered diagram, taken from the reference's link text. */
  label?: string;
}

/**
 * Renders a mermaid diagram in the browser. Hydrated with `client:visible` and the mermaid
 * library dynamically imported on mount, so its weight never loads until a diagram scrolls
 * into view. Re-renders on the header light/dark toggle via `useThemeMode`.
 */
export default function Mermaid({ code, label }: MermaidProps) {
  const mode = useThemeMode();
  // mermaid.render() uses this as a DOM id; strip the colons useId() carries so it stays a valid selector.
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        // Diagrams come from the author's own posts, so allow the HTML labels that give <br/> line breaks.
        securityLevel: "loose",
        theme: mode === "dark" ? "dark" : "default",
      });
      try {
        const rendered = await mermaid.render(id, code);
        if (live) {
          setSvg(rendered.svg);
          setFailed(false);
        }
      } catch {
        if (live) setFailed(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [code, mode, id]);

  if (failed) {
    return (
      <pre className={styles.fallback}>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className={styles.diagram}
      role={label ? "img" : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
