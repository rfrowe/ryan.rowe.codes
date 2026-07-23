import { describe, expect, it } from "vitest";

import { toThreadMessages, type ChatItem } from "./chatRuntime";

describe("toThreadMessages", () => {
  it("tags a system item so SystemMessage can render it calmly instead of as an error", () => {
    const items: ChatItem[] = [{ kind: "system", id: "s1", text: "Resolving a rebase conflict." }];
    const [message] = toThreadMessages(items);
    expect(message).toMatchObject({ role: "system", metadata: { custom: { kind: "system" } } });
  });

  it("tags an error item distinctly from a system item, though both use the system role", () => {
    const items: ChatItem[] = [{ kind: "error", id: "e1", text: "Something failed." }];
    const [message] = toThreadMessages(items);
    expect(message).toMatchObject({ role: "system", metadata: { custom: { kind: "error" } } });
  });
});
