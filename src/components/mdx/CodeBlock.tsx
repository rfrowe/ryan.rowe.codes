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
 * Rendered client:load (not client:only) so the highlighted source is present in the static
 * HTML, not only after hydration.
 *
 * `source` is a plain prop, not JSX children: Astro pre-renders an island's children into an
 * opaque HTML placeholder, so raw source passed as children would arrive escaped. Props
 * other than `children` pass through untouched.
 *
 * The theme toggle mutates `data-theme` directly without firing an event, so observe that
 * attribute to stay theme-reactive. Initial state matches the server default (dark unless
 * the OS prefers light) so hydration doesn't repaint the block in the common case.
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
