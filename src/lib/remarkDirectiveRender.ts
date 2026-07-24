import { h } from "hastscript";
import { visit, SKIP } from "unist-util-visit";
import type { Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type {} from "mdast-util-to-hast";

// Directives that apply their attributes straight to the wrapped node instead of wrapping
// it - e.g. `:::class{.spaced}` puts the class on the `ul` itself, so `ul.spaced` CSS works.
const UNWRAP_DIRECTIVES = new Set(["class"]);

export default function remarkDirectiveRender() {
  return (tree: Root) => {
    visit(tree, "containerDirective", (node: ContainerDirective, index, parent) => {
      if (index === undefined || !parent) return;

      if (UNWRAP_DIRECTIVES.has(node.name)) {
        const [target] = node.children;
        if (!target) {
          throw new Error(`:::${node.name} must wrap exactly one element`);
        }
        const { properties } = h("", node.attributes ?? {});
        const data = target.data ?? (target.data = {});
        data.hProperties = { ...data.hProperties, ...properties };
        parent.children.splice(index, 1, ...node.children);
        return [SKIP, index];
      }

      const { tagName, properties } = h(node.name, node.attributes ?? {});
      const data = node.data ?? (node.data = {});
      data.hName = tagName;
      data.hProperties = properties;
    });
  };
}
