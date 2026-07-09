import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark as light, materialOceanic as dark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { shadows } from "@styles/theme.css.ts";

type Mode = "light" | "dark";

const isMode = (value: string | undefined): value is Mode => value === "light" || value === "dark";

interface Props {
  language: string;
  source: string;
}

/**
 * Ported from src/components/blog/code.tsx. Rendered `client:load` (not `client:only`):
 * the quine's syntax-highlighted source must exist in the static build output (Phase 4's
 * verification greps the emitted dist HTML for it), so this needs a server-rendered
 * initial pass, then hydration.
 *
 * `source` is a plain prop, not JSX children: Astro pre-renders any *children* passed to
 * a UI-framework island into an opaque HTML placeholder before handing it to the
 * component (its cross-framework slot bridge), which would hand this component an
 * escaped-HTML wrapper object instead of the raw source string. Props other than
 * `children` pass through untouched, so the quine's raw text has to travel as one.
 *
 * There's no shared theme-mode context in Astro (unlike the pre-migration
 * `useThemeMode()`), and the toggle island (ThemeToggle.tsx) mutates `data-theme`
 * directly without dispatching an event. A `MutationObserver` on that attribute is the
 * only way to stay theme-reactive without one. The initial state matches the
 * server-rendered default (dark unless the OS prefers light -- see theme.css.ts/
 * theme-script.ts) so hydration doesn't visibly repaint the block for the common case.
 */
const CodeBlock = ({ language, source }: Props) => {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    const documentElement = document.documentElement;

    const sync = () => {
      const current = documentElement.dataset.theme;
      setMode(isMode(current) ? current : "dark");
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  const style = mode === "light" ? light : dark;

  return (
    <SyntaxHighlighter
      language={language}
      showLineNumbers
      style={style}
      customStyle={{ borderRadius: "10px", boxShadow: shadows[3] }}
    >
      {source}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
