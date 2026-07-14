import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";

export default [
  {
    // Skip build output, deps, and the studio's per-post git worktrees (each an isolated checkout of
    // the whole repo, not source to lint; nested tsconfigs otherwise confuse the parser).
    ignores: [
      "dist/",
      "**/dist/",
      ".astro/",
      "node_modules/",
      ".worktrees/",
      ".claude/worktrees/",
      "src/content/blog/2022-03-11_algorithmic-art/assets/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // `_`-prefixed names are intentionally unused (destructured throwaways, callback args).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // Allow short-circuit / ternary statements, e.g. `timer === undefined || clearTimeout(timer)`.
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
    },
  },
  {
    // `.d.ts` shims (e.g. the `*.astro` module declaration) legitimately use `any`.
    files: ["**/*.d.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];
