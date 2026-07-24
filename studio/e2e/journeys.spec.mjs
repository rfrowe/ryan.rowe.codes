// Studio UI journeys — driven through the real SPA in a browser (⌘P, dialogs, CodeMirror, banners),
// asserting on rendered UI AND git ground-truth in the isolated sandbox. Each journey creates its own
// post (unique slug) so they stay independent despite sharing one booted studio.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { test, expect, RUN_AGENT } from "./fixtures.mjs";

// Drive ⌘P → "Create new post" → the New-post dialog, exactly like a user. Returns the post's stem.
async function createPost(page, { title, slug, headline, date }) {
  await page.keyboard.press("ControlOrMeta+p");
  const palette = page.getByRole("dialog", { name: "Open or create a post" });
  await expect(palette).toBeVisible();
  await palette.getByRole("textbox").first().fill(title);
  await page.getByText(/Create new post/).first().click();

  const dialog = page.getByRole("heading", { name: "New post" });
  await expect(dialog).toBeVisible();
  await page.getByPlaceholder("aligning-a-skyline").fill(slug);
  await page.getByPlaceholder("teaching a horizon to stand up straight").fill(headline);
  const created = page.getByPlaceholder("YYYY-MM-DD");
  await created.fill(date);
  // exact: a prior journey's "Create Edit" tab button would otherwise collide with a substring match.
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("heading", { name: "New post" })).toBeHidden();
  return `${date}_${slug}`;
}

// Replace the whole editor buffer (CodeMirror) with `content`, like select-all + paste.
async function setEditor(page, content) {
  const ed = page.locator(".cm-content").first();
  await ed.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(content);
}

test("create a post (⌘P + New-post dialog) → edit in the editor → autosave lands on disk", async ({ studioPage: page, studio }) => {
  const { gh } = studio;
  const stem = await createPost(page, { title: "Create Edit", slug: "create-edit", headline: "h", date: "2026-07-10" });
  // Create ground truth: a worktree + isolation branch exist for the new post.
  expect(gh.localBranch(`blog/${stem}`), "isolation branch created").toBeTruthy();
  expect(gh.worktreeExists(stem), "worktree created").toBeTruthy();

  // Edit in CodeMirror; the SPA autosaves the buffer to the post's worktree file.
  const edited = gh.seedPost("Create Edit", "create-edit", "h", "2026-07-10").replace("Start writing…", "First real paragraph.");
  await setEditor(page, edited);
  // Autosave ground truth: the edited bytes land in the post's worktree file (autosave is async).
  const file = `${gh.worktreeDir(stem)}/src/content/blog/${stem}.mdx`;
  await expect.poll(() => { try { return readFileSync(file, "utf8"); } catch { return ""; } }, { timeout: 15_000, message: "autosave lands the edit on disk" })
    .toContain("First real paragraph.");
});

test("rename via frontmatter → accept: banner + Rename worktree renames file/branch/worktree", async ({ studioPage: page, studio }) => {
  const { gh } = studio;
  const stem = await createPost(page, { title: "Rename Me", slug: "rename-before", headline: "h", date: "2026-07-11" });
  expect(gh.localBranch(`blog/${stem}`), "isolation branch created on create").toBeTruthy();

  // Edit the frontmatter slug in the editor → the SPA autosaves → a name-sync banner offers the rename.
  await setEditor(page, gh.seedPost("Rename Me", "rename-after", "h", "2026-07-11"));
  const newStem = "2026-07-11_rename-after";
  await expect(page.getByText(/This post's deployed URL has changed/)).toBeVisible({ timeout: 20_000 });

  // Accept it (the "Complete rename" affordance).
  await page.getByRole("button", { name: "Rename worktree" }).click();

  // Rendered UI: the banner clears once the rename lands.
  await expect(page.getByText(/This post's deployed URL has changed/)).toBeHidden({ timeout: 20_000 });
  // Git ground truth: file, branch, and worktree all moved to the new stem.
  await expect.poll(() => gh.localBranch(`blog/${newStem}`), { timeout: 15_000 }).toBeTruthy();
  expect(gh.localBranch(`blog/${stem}`), "old branch gone").toBeFalsy();
  expect(gh.worktreeExists(newStem), "worktree moved to the new stem").toBeTruthy();
  expect(gh.worktreeExists(stem), "old worktree gone").toBeFalsy();
});

test("adopt + update a behind remote draft from ⌘P: worktree/tracking branch, rebased onto origin", async ({ studioPage: page, studio }) => {
  const { gh } = studio;
  const stem = "2026-07-13_adopt-update";
  // A committed draft pushed from "another session", forked from main...
  gh.seedRemoteDraft(stem, "origin/main", { [`src/content/blog/${stem}.mdx`]: gh.seedPost("Adopt Update", "adopt-update", "h", "2026-07-13") }, "draft: adopt-update");
  // ...then the base moves on origin (a merged PR), so the draft is behind once the studio fetches.
  gh.advanceMain({ "unrelated.txt": "root advance\n" }, "root: advance base");

  // Fetch (⌘⇧F) so the studio learns of the remote draft and the advanced base, then open ⌘P.
  await page.keyboard.press("ControlOrMeta+Shift+f");
  await page.keyboard.press("ControlOrMeta+p");
  const palette = page.getByRole("dialog", { name: "Open or create a post" });
  await expect(palette).toBeVisible();
  await palette.getByRole("textbox").first().fill("adopt-update");
  // The draft row (li.palette__row), waited for since the fetch that surfaces it is async, and
  // disambiguated from the always-present "Create new post" row.
  const draftRow = palette.locator("li.palette__row", { hasText: "adopt-update" }).filter({ hasNotText: "Create new post" });
  await expect(draftRow).toBeVisible({ timeout: 20_000 });

  // The row's "Update" affordance appears only once the studio sees the draft as behind — clicking it
  // adopts the closed draft (worktree + tracking branch) and rebases it onto origin in one action.
  const updateBtn = draftRow.getByRole("button", { name: "Update" });
  await expect(updateBtn).toBeVisible({ timeout: 20_000 });
  await updateBtn.click();

  await expect.poll(() => gh.localBranch(`blog/${stem}`), { timeout: 20_000, message: "adopt created the local tracking branch" }).toBeTruthy();
  expect(gh.worktreeExists(stem), "adopt created the worktree").toBeTruthy();
  await expect.poll(() => gh.containsOrigin(`blog/${stem}`), { timeout: 30_000, message: "update rebased the draft onto origin/main" }).toBeTruthy();
});

test("update an old remote draft whose base moved → conflict handed to the agent (banner) → resolves", async ({ studioPage: page, studio }) => {
  const { gh } = studio;
  const stem = "2026-07-14_conflict";
  const base = gh.git(["rev-parse", "origin/main"], gh.sb.repo);
  // A draft editing the shared file on the post side, forked from the current base...
  gh.seedRemoteDraft(stem, base, {
    [`src/content/blog/${stem}.mdx`]: gh.seedPost("Conflict", "conflict", "h", "2026-07-14"),
    "conflict.txt": "base\npost-side change\n",
  }, "draft: conflict post-side");
  // ...then the base moves on origin, touching the same file's tail differently → a rebase conflict.
  gh.advanceMain({ "conflict.txt": "base\nroot-side change\n" }, "root: conflicting base change");

  // Pin Sonnet + low effort via the composer chips (only matters for the paid resolver turn) — the
  // studio default is Opus 4.8; validate the flow on the cheapest capable model. The chips' own
  // rendered text is dynamic ("model: Opus 4.8", "effort: medium"), so their accessible name isn't
  // the static "Model"/"Reasoning effort" label. getByTitle targets that static title attribute
  // directly instead of relying on a role-name match against ever-changing button text.
  if (RUN_AGENT) {
    await page.getByTitle("Model", { exact: true }).click();
    await page.getByRole("dialog", { name: "Model" }).getByText("Sonnet 5").click();
    await page.getByTitle("Reasoning effort", { exact: true }).click();
    await page.getByRole("dialog", { name: "Reasoning effort" }).getByText("low", { exact: true }).click();
  }

  // Fetch, adopt, and update the behind draft from ⌘P — the update conflicts.
  await page.keyboard.press("ControlOrMeta+Shift+f");
  await page.keyboard.press("ControlOrMeta+p");
  const palette = page.getByRole("dialog", { name: "Open or create a post" });
  await palette.getByRole("textbox").first().fill("conflict");
  // The filter "conflict" narrows to the one draft; take the sole non-create row (its label may be the
  // slug or the frontmatter title, so don't hard-code the text).
  const row = palette.locator("li.palette__row").filter({ hasNotText: "Create new post" }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  await expect(row.getByRole("button", { name: "Update" })).toBeVisible({ timeout: 20_000 });
  await row.getByRole("button", { name: "Update" }).click();

  // Deterministic (no key needed): the conflict is handed to the post's own agent — a "studio" system
  // note appears in the chat, and the worktree is left mid-rebase with conflict markers.
  await expect(page.locator(".msg--system").first()).toBeVisible({ timeout: 30_000 });
  const conflictFile = `${gh.worktreeDir(stem)}/conflict.txt`;
  await expect.poll(() => { try { return readFileSync(conflictFile, "utf8"); } catch { return ""; } }, { timeout: 20_000, message: "rebase conflicted in the worktree" }).toContain("<<<<<<<");

  // The paid half (only with a funded key + STUDIO_E2E_AGENT=1): the agent resolves and the studio
  // finishes the rebase, so the branch ends up containing origin/main with the markers gone.
  if (RUN_AGENT) {
    await expect.poll(() => gh.containsOrigin(`blog/${stem}`), { timeout: 240_000, intervals: [2000], message: "agent resolves + rebase --continue completes" }).toBeTruthy();
    expect(readFileSync(conflictFile, "utf8"), "markers gone after resolution").not.toContain("<<<<<<<");
  }
});

test("reload rehydrates the studio from the connect snapshot", async ({ studioPage: page }) => {
  // A dropped/reloaded socket re-renders purely from the sidecar's connect snapshot.
  await page.reload({ waitUntil: "load" });
  await expect(page.locator(".cm-editor").first()).toBeVisible({ timeout: 20_000 });
});

// Last in the file on purpose: unlike a post's conflict (isolated to that post's own worktree), a root
// conflict leaves the studio's own root worktree (sb.repo) mid-rebase with conflict markers on disk for
// the deterministic (non-agent) half of this journey, so nothing later in a shared-studio run should
// depend on the root being clean afterward.
test("update the studio root whose base moved → conflict handed to the root agent (banner) → resolves", async ({ studioPage: page, studio }) => {
  const { gh } = studio;
  const conflictFile = path.join(gh.sb.repo, "conflict.txt");

  // A local commit directly on the root's own branch (not through the studio)...
  writeFileSync(conflictFile, "base\nroot-local change\n");
  gh.git(["add", "--", "conflict.txt"], gh.sb.repo);
  gh.git(["commit", "-q", "-m", "root: local change"], gh.sb.repo);
  // ...then origin/main moves too, touching the same lines differently, so updating conflicts.
  gh.advanceMain({ "conflict.txt": "base\norigin-side change\n" }, "origin: conflicting change");

  // Pin Sonnet + low effort (model/effort are global session state, not per-post, so this affects the
  // root's turn exactly as it would a post's).
  if (RUN_AGENT) {
    await page.getByTitle("Model", { exact: true }).click();
    await page.getByRole("dialog", { name: "Model" }).getByText("Sonnet 5").click();
    await page.getByTitle("Reasoning effort", { exact: true }).click();
    await page.getByRole("dialog", { name: "Reasoning effort" }).getByText("low", { exact: true }).click();
  }

  // Fetch surfaces the divergence (git.primary.behind > 0), which is what gates the status popover's
  // "Update root" row; accept the native confirm() onUpdateRoot raises for a non-fast-forward root.
  await page.keyboard.press("ControlOrMeta+Shift+f");
  await page.locator(".tabbar__status").hover();
  const updateRootBtn = page.getByRole("button", { name: "Update root" });
  await expect(updateRootBtn).toBeVisible({ timeout: 20_000 });
  page.once("dialog", (dialog) => dialog.accept());
  await updateRootBtn.click();

  // Deterministic (no key needed): the conflict is handed to the root's own agent. A system note
  // appears in the root-conflict banner, and the root worktree is left mid-rebase with conflict markers.
  await expect(page.locator(".rootconflict .msg--system").first()).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => { try { return readFileSync(conflictFile, "utf8"); } catch { return ""; } }, { timeout: 20_000, message: "root rebase conflicted in the worktree" }).toContain("<<<<<<<");

  // The paid half (only with a funded key + STUDIO_E2E_AGENT=1): the agent resolves and the studio
  // finishes the rebase, so the root ends up containing origin/main with the markers gone.
  if (RUN_AGENT) {
    // Poll the branch, not HEAD: HEAD already descends from origin/main mid-rebase; only the branch advances on rebase --continue.
    await expect.poll(() => gh.containsOrigin("main"), { timeout: 240_000, intervals: [2000], message: "agent resolves + rebase --continue completes" }).toBeTruthy();
    expect(readFileSync(conflictFile, "utf8"), "markers gone after resolution").not.toContain("<<<<<<<");
  }
});
