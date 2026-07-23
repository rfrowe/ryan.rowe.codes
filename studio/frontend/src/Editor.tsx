// CodeMirror 6 editor over the MDX source. Byte-faithful (no reformat), debounced
// autosave through the REST client, and a ⌘K prompt popover anchored at the caret. Stays
// editable through an agent turn; a remote write is rebased onto the live buffer (see
// remoteMerge.ts) rather than locking the buffer for the turn's duration.

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { Annotation, EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { tokyoNightInit } from "@uiw/codemirror-theme-tokyo-night";
import type { DocRev, Range } from "../../shared/types";
import type { PromptContext, PutDocResponse } from "../../shared/protocol";
import { putDoc } from "./api";
import { frontmatterCompletionSource } from "./editor/frontmatterCompletion";
import { recipeSnippetSource } from "./editor/recipeSnippets";
import { mdx } from "./editor/mdx";
import { rebaseRemoteChange } from "./editor/remoteMerge";
import { filePathToUri, getLspClient } from "./lsp/client";
import { docResolvingCompletionSource } from "./lsp/completion";

/** Imperative handle so the app can flush pending autosave before dispatching a prompt. */
export interface EditorHandle {
  flush: () => Promise<void>;
  /**
   * Current buffer text. The app reads this before switching tabs so the outgoing tab's
   * cached buffer stays in sync with what was typed (the editor unmounts on switch, so its
   * CodeMirror state is otherwise lost). Returns null if the view isn't mounted.
   */
  getText: () => string | null;
  /** Opens the ⌘K prompt popover, mirroring the editor's own Mod-k binding; a no-op if the view
   *  isn't mounted or a turn is already in flight. Lets the keymap registry's `agent.directive`
   *  command run the same action the panel's row/click affordance offers. */
  openPrompt: () => void;
}

interface EditorProps {
  path: string;
  /** Text used to seed the buffer at mount only. */
  initialText: string;
  rev: DocRev;
  /** Applied to the buffer whenever `version` increments; see the remote-update effect for how
   *  each `kind` is handled. */
  remoteUpdate: { text: string; version: number; kind: "agent" | "reload" } | null;
  /** An agent turn is in flight; block the ⌘K popover from starting a second one. */
  promptInFlight?: boolean;
  /**
   * A conflict banner is up (an external disk change is awaiting the human's Reload /
   * Keep-mine decision). While true, autosave is suspended so a debounced write can't
   * clobber the external change before it's resolved (docSyncMachine: a conflict gates
   * off `save`). Clearing it resumes saving of the local buffer.
   */
  suspendSave?: boolean;
  /** Reports an accepted rev for this editor's `path` (not the app's active path), so an
   *  in-flight flush that resolves after a tab switch updates the right tab. */
  onRev: (path: string, rev: DocRev) => void;
  onPrompt: (text: string, context: PromptContext) => void;
  onEditorState?: (cursor: number, selection: Range | null, viewport: Range | null) => void;
}

// Drives both durable autosave and the preview refresh cadence (the preview is the Astro dev
// server rendering the file on disk, so it can't update until we write). Lower = snappier preview,
// at the cost of more writes / Astro recompiles while typing. The floor is Astro's own recompile
// time, not this debounce; true per-keystroke preview isn't possible with the real-render iframe.
const AUTOSAVE_MS = 250;
// Continuous typing keeps resetting the trailing debounce, which would never flush (so the
// preview would freeze until you pause). Cap the wait: flush at least this often mid-typing.
const AUTOSAVE_MAX_WAIT_MS = 1000;
const EDITOR_STATE_MS = 150;
// Transient save failures (500 / network / off-contract body) retry against the same rev
// with a bounded linear backoff, so a blip doesn't wedge autosave or hammer the sidecar.
const SAVE_RETRY_MS = 1500;
const SAVE_RETRY_MAX = 5;

// Marks transactions the app applied programmatically, so they don't trigger autosave.
const remoteAnnotation = Annotation.define<boolean>();

// Mirrors mdx.ts's `esm` block-parser rule (same start-of-run condition) as a plain-text check, so
// the toggle-comment override below can tell a real ESM import/export line apart from MDX prose or
// a {…} expression without walking the syntax tree (parseMixed's TSX mount makes both resolve
// through the same language data at that point, with no node-level way to distinguish them there).
function isEsmLine(state: EditorState, pos: number): boolean {
  let line = state.doc.lineAt(pos);
  while (line.number > 1 && /\S/.test(state.doc.line(line.number - 1).text)) line = state.doc.line(line.number - 1);
  return /^(import|export)\b/.test(line.text);
}

// Dark theme for the editor's tooltips (autocomplete dropdown, completion info, LSP hover and
// signature help). The studio styles the surface via plain CSS, so CodeMirror thinks it's light and
// renders low-contrast tooltips; `{ dark: true }` flips its tooltip base theme and these rules,
// carrying theme-level specificity, repaint them with the app tokens.
const tooltipTheme = EditorView.theme(
  {
    ".cm-tooltip": {
      background: "var(--bg-2)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius)",
      color: "var(--fg)",
      boxShadow: "var(--shadow-pop)",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul": {
      fontFamily: "var(--mono)",
      fontSize: "12.5px",
      maxHeight: "18em",
    },
    ".cm-tooltip-autocomplete > ul > li": { padding: "3px 9px", color: "var(--fg-dim)", lineHeight: "1.6" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": { background: "var(--accent-strong)", color: "#fff" },
    ".cm-completionLabel": { color: "var(--fg)" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionLabel": { color: "#fff" },
    ".cm-completionMatchedText": { color: "var(--accent)", textDecoration: "none", fontWeight: "600" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionMatchedText": { color: "#fff" },
    ".cm-completionDetail": { color: "var(--fg-dim)", fontStyle: "italic", marginLeft: "0.6em" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail": { color: "rgba(255,255,255,0.85)" },
    ".cm-completionIcon": { color: "var(--fg-dim)", opacity: "0.85" },
    ".cm-tooltip.cm-completionInfo": {
      background: "var(--bg-3)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius)",
      color: "var(--fg)",
      padding: "8px 11px",
      maxWidth: "360px",
      fontFamily: "var(--sans)",
      fontSize: "12px",
      lineHeight: "1.55",
    },
    ".cm-tooltip.cm-tooltip-hover, .cm-tooltip-section": { color: "var(--fg)" },
    ".cm-tooltip pre": { margin: "0", whiteSpace: "pre-wrap", fontFamily: "var(--mono)", fontSize: "12px" },
    // Resolved completion info: the type signature (detail) above its JSDoc (documentation).
    ".cm-lsp-completion-detail": {
      fontFamily: "var(--mono)",
      fontSize: "11.5px",
      color: "var(--fg)",
      whiteSpace: "pre-wrap",
      paddingBottom: "6px",
      marginBottom: "6px",
      borderBottom: "1px solid var(--border-subtle)",
    },
    ".cm-lsp-completion-doc": { color: "var(--fg-dim)", fontSize: "12px", lineHeight: "1.5" },
    ".cm-lsp-completion-doc p": { margin: "0 0 6px" },
    ".cm-lsp-completion-doc code": { fontFamily: "var(--mono)", background: "var(--bg)", padding: "0.1em 0.3em", borderRadius: "4px" },
  },
  { dark: true },
);

interface PopoverState {
  left: number;
  top: number;
  cursor: number;
  selection: Range | null;
  anchor: { from: number; to: number; text: string };
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(props, ref) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const revRef = useRef<DocRev>(props.rev);
  // The last text this editor knows to be on disk (a save ack, or an applied remote write); the
  // base a remote update's diff is computed against so it can be rebased onto local edits.
  const lastSyncedTextRef = useRef<string>(props.initialText);
  const appliedVersionRef = useRef<number>(props.remoteUpdate?.version ?? 0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  // Timestamp of the first unsaved keystroke since the last successful save, so scheduleSave can
  // bound the debounce with a max-wait (otherwise sustained typing resets it forever).
  const firstDirtyAtRef = useRef<number | null>(null);
  // Buffer diverges from the last-acked disk rev (unsaved local edits). Drives whether a
  // resumed autosave (after a turn lock / conflict suspension lifts) has anything to flush.
  const dirtyRef = useRef(false);
  // Latest callbacks/props, read by the long-lived CM extensions without re-creating the view.
  const cb = useRef(props);
  cb.current = props;

  const [popover, setPopover] = useState<PopoverState | null>(null);
  const popoverInputRef = useRef<HTMLInputElement | null>(null);
  // Set when an autosave was rejected as stale and rebased onto the disk rev, so the
  // author sees that a concurrent write happened rather than losing edits silently.
  const [staleRebased, setStaleRebased] = useState(false);
  // Set when a save failed transiently (not stale-rev) and is being retried against the
  // same rev, so the author knows edits aren't lost, just not persisted yet.
  const [saveError, setSaveError] = useState(false);

  // ---- autosave ----

  type PutOutcome = "saved" | "stale" | "error";

  // One PUT of the current buffer against the tracked base rev. Classifies the result but
  // never reschedules; callers decide. Mutates revRef only on a genuine ack or a genuine
  // stale-rev; every other (off-contract / transient) response leaves revRef untouched.
  async function putCurrent(): Promise<PutOutcome> {
    const view = viewRef.current;
    if (!view) return "saved"; // nothing to persist
    const text = view.state.doc.toString();
    let res: PutDocResponse;
    try {
      res = await putDoc({ path: cb.current.path, text, baseRev: revRef.current });
    } catch {
      // Network / parse failure: transient. Do not touch revRef.
      return "error";
    }
    if (res.ok) {
      revRef.current = res.rev;
      cb.current.onRev(cb.current.path, res.rev);
      lastSyncedTextRef.current = text;
      // If no keystrokes landed during the await, the buffer now matches disk.
      if (view.state.doc.toString() === text) dirtyRef.current = false;
      return "saved";
    }
    // Per the frozen protocol a non-ok body is `{error:"stale-rev",currentRev}`, but the
    // sidecar can also return an off-contract `{error:string}` 500 (e.g. body too large)
    // with no currentRev. Guard on the actual runtime shape: only a genuine stale-rev
    // carrying a currentRev rebases onto the disk rev. Never set revRev to a non-rev.
    const body = res as { error?: string; currentRev?: DocRev };
    if (body.error === "stale-rev" && body.currentRev) {
      revRef.current = body.currentRev;
      cb.current.onRev(cb.current.path, body.currentRev);
      return "stale";
    }
    return "error";
  }

  // Debounced autosave / transient-retry tick. Holds off while a conflict banner is up (autosave
  // would clobber the external change); that gate resumes it via the effect below.
  async function save(): Promise<void> {
    clearSaveTimers();
    if (cb.current.suspendSave) return;
    if (!dirtyRef.current) return; // nothing diverged since the last ack
    const outcome = await putCurrent();
    if (outcome === "saved") {
      retryCountRef.current = 0;
      firstDirtyAtRef.current = null;
      setStaleRebased(false);
      setSaveError(false);
      return;
    }
    if (outcome === "stale") {
      // Rebased onto the fresh disk rev; re-save this buffer against it so edits still land.
      retryCountRef.current = 0;
      setSaveError(false);
      setStaleRebased(true);
      scheduleSave();
      return;
    }
    // Transient failure: keep the same rev, tell the author, and retry (bounded).
    retryCountRef.current += 1;
    setStaleRebased(false);
    setSaveError(true);
    scheduleRetry();
  }

  function clearSaveTimers(): void {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }

  function scheduleSave(): void {
    clearSaveTimers();
    if (firstDirtyAtRef.current === null) firstDirtyAtRef.current = Date.now();
    // Trailing debounce, capped by a max-wait: during sustained typing the debounce keeps
    // resetting, so bound the delay by how long we've already waited, guaranteeing a flush
    // (and preview refresh) at least every AUTOSAVE_MAX_WAIT_MS instead of only on a pause.
    const waited = Date.now() - firstDirtyAtRef.current;
    const delay = Math.max(0, Math.min(AUTOSAVE_MS, AUTOSAVE_MAX_WAIT_MS - waited));
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void save();
    }, delay);
  }

  function scheduleRetry(): void {
    if (retryTimerRef.current) return;
    if (retryCountRef.current >= SAVE_RETRY_MAX) return; // bounded: stop hammering the sidecar
    const attempt = retryCountRef.current;
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      void save();
    }, SAVE_RETRY_MS * attempt);
  }

  // Flush for save-before-prompt: persist the buffer now, or throw so the caller blocks the
  // prompt instead of letting the agent read stale on-disk bytes. Resolves only when the
  // buffer is genuinely persisted (or there was nothing to persist).
  async function flush(): Promise<void> {
    clearSaveTimers();
    // A conflict banner is already up; the human must resolve it before dispatching.
    if (cb.current.suspendSave) throw new Error("save-suspended");
    if (!dirtyRef.current) return; // already persisted at the current rev
    const outcome = await putCurrent();
    if (outcome === "saved") {
      retryCountRef.current = 0;
      firstDirtyAtRef.current = null;
      setStaleRebased(false);
      setSaveError(false);
      return;
    }
    if (outcome === "stale") {
      // Disk advanced under us: do not silently proceed. Surface it and block the prompt so
      // the human resolves the on-disk change first (the reload banner is the resolution UI).
      setSaveError(false);
      setStaleRebased(true);
      throw new Error("stale-rev");
    }
    setStaleRebased(false);
    setSaveError(true);
    throw new Error("save-failed");
  }

  function pushEditorState(): void {
    const view = viewRef.current;
    const onState = cb.current.onEditorState;
    if (!view || !onState) return;
    const sel = view.state.selection.main;
    const selection: Range | null = sel.empty ? null : { from: sel.from, to: sel.to };
    const vp = view.viewport;
    onState(sel.head, selection, { from: vp.from, to: vp.to });
  }

  function scheduleEditorState(): void {
    if (!cb.current.onEditorState) return;
    if (stateTimerRef.current) return;
    stateTimerRef.current = setTimeout(() => {
      stateTimerRef.current = null;
      pushEditorState();
    }, EDITOR_STATE_MS);
  }

  function openPromptPopover(view: EditorView): void {
    const sel = view.state.selection.main;
    const coords = view.coordsAtPos(sel.head);
    const left = coords ? coords.left : 24;
    const top = coords ? coords.bottom + 4 : 48;
    // Resolve the target region now, at the caret, so an inline prompt edits *this* thing: the
    // selection if there is one, else the caret's current line (its text + exact byte range).
    const anchor = sel.empty
      ? (() => {
          const line = view.state.doc.lineAt(sel.head);
          return { from: line.from, to: line.to, text: line.text };
        })()
      : { from: sel.from, to: sel.to, text: view.state.sliceDoc(sel.from, sel.to) };
    setPopover({
      left,
      top,
      cursor: sel.head,
      selection: sel.empty ? null : { from: sel.from, to: sel.to },
      anchor,
    });
  }

  // ---- mount once ----
  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    // Register the completion sources via language data (not autocompletion({override})) so they
    // compose with each other and with the LSP plugin's source; an override would suppress them.
    const md = mdx();
    // The MDX language server (completion, hover, signature help), when a real sidecar is present.
    // Composes with the two built-in sources above; languageId "mdx" is mandatory or the server
    // won't attach its MDX/TS service. Null under the mock / tokenless dev.
    const lspClient = getLspClient();
    const extensions = [
      basicSetup,
      // Tokyo Night dark theme: editor surface plus a dark-tuned highlight style that takes
      // precedence over basicSetup's light-oriented default. studio.css leaves the editor's
      // colors (surface, gutter, cursor, selection, syntax) to it. Its default foreground (#787c99)
      // is too dim for plain prose, so brighten the base text to Tokyo Night's #c0caf5.
      tokyoNightInit({ settings: { foreground: "#c0caf5" } }),
      md,
      // MDX comments are {/* */}, not markdown's HTML <!-- -->, and prose/expressions have no
      // meaningful // syntax, so force block-comment tokens for the toggle-comment keybinding
      // everywhere except a real ESM import/export line (mdx.ts's `esm` block) — that's genuine JS
      // mounted into TSX, so its own commentTokens (which include //) should stand. A plain
      // md.language.data / tsxLanguage.data override can't make that distinction: an existing
      // {/* */} comment is parsed as a mounted TSX node, so it resolves language data through
      // tsxLanguage's own commentTokens (which also has a `line: "//"` CodeMirror always prefers
      // over block) — same as an ESM line's mount, with no facet-level way to tell them apart.
      Prec.highest(
        EditorState.languageData.of((state, pos) =>
          isEsmLine(state, pos) ? [] : [{ commentTokens: { block: { open: "{/*", close: "*/}" } } }],
        ),
      ),
      md.language.data.of({ autocomplete: frontmatterCompletionSource }),
      md.language.data.of({ autocomplete: recipeSnippetSource }),
      ...(lspClient
        ? [
            lspClient.plugin(filePathToUri(cb.current.path), "mdx"),
            // LSP completion with resolved detail/docs (the library's source omits them). Registered
            // via global language data, not markdown-scoped: inside a `<Component …>` tag markdown
            // switches to embedded HTML, so a markdown-scoped source wouldn't fire there.
            EditorState.languageData.of(() => [{ autocomplete: docResolvingCompletionSource }]),
          ]
        : []),
      // After the LSP plugin so it overrides that plugin's bundled tooltip theme.
      tooltipTheme,
      EditorView.lineWrapping,
      Prec.highest(
        keymap.of([
          {
            key: "Mod-k",
            preventDefault: true,
            run: (view) => {
              // One agent turn at a time: swallow ⌘K while a turn is in flight.
              if (cb.current.promptInFlight) return true;
              openPromptPopover(view);
              return true;
            },
          },
        ]),
      ),
      EditorView.updateListener.of((update) => {
        const isRemote = update.transactions.some((t) => t.annotation(remoteAnnotation));
        if (update.docChanged && !isRemote) {
          dirtyRef.current = true;
          scheduleSave();
        }
        if (update.selectionSet || update.docChanged || update.viewportChanged) scheduleEditorState();
      }),
    ];

    const view = new EditorView({
      state: EditorState.create({ doc: cb.current.initialText, extensions }),
      parent,
    });
    viewRef.current = view;

    return () => {
      clearSaveTimers();
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      view.destroy();
      viewRef.current = null;
    };
    // Mount-once; prop changes are handled by the effects below.
  }, []);

  // Keep the autosave base rev in sync with app-owned rev updates (remote writes, etc).
  useEffect(() => {
    revRef.current = props.rev;
  }, [props.rev]);

  // Apply a remote write to the buffer without re-triggering autosave. "reload" covers the
  // author's explicit banner choice and any store-mediated rewrite that means to win outright
  // (revert, revertUrl, relayout) — a hard replace. "agent" is a live turn's own write, rebased
  // onto whatever the author has kept typing since `lastSyncedTextRef` so it lands without
  // discarding those edits.
  useEffect(() => {
    const view = viewRef.current;
    const update = props.remoteUpdate;
    if (!view || !update) return;
    if (update.version === appliedVersionRef.current) return;
    appliedVersionRef.current = update.version;
    const liveText = view.state.doc.toString();
    if (update.text === liveText) {
      revRef.current = props.rev;
      lastSyncedTextRef.current = update.text;
      dirtyRef.current = false;
      return;
    }
    const stillDirty = update.kind === "agent" && dirtyRef.current;
    if (update.kind === "reload") {
      // A full-document replace: every position falls inside the replaced range, so CodeMirror's
      // default selection-mapping collapses the caret to 0. Clamp the old head instead.
      const nextHead = Math.min(view.state.selection.main.head, update.text.length);
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: update.text },
        selection: { anchor: nextHead },
        annotations: remoteAnnotation.of(true),
      });
    } else {
      // Leave `selection` unset: the rebase only touches specific spans, so CodeMirror's default
      // mapping of the existing selection through `changes` keeps the caret sensible.
      view.dispatch({
        changes: rebaseRemoteChange(lastSyncedTextRef.current, update.text, liveText),
        annotations: remoteAnnotation.of(true),
      });
    }
    revRef.current = props.rev;
    lastSyncedTextRef.current = update.text;
    dirtyRef.current = stillDirty;
    setStaleRebased(false);
    setSaveError(false);
    // The author's still-unsaved edits just got carried onto the new base; get them to disk
    // rather than waiting on whatever's left of the debounce.
    if (stillDirty) scheduleSave();
  }, [props.remoteUpdate, props.rev]);

  // React to the conflict suspension. NB: declared after the remote-update effect so that,
  // on a Reload (which sets remoteUpdate and clears suspendSave in the same commit), the
  // buffer has already adopted disk and dirtyRef is false before we decide to resume.
  useEffect(() => {
    if (props.suspendSave) {
      // Banner up: cancel pending saves/retries so none clobbers the external change.
      clearSaveTimers();
    } else if (dirtyRef.current) {
      // Banner cleared via Keep-mine with local edits still outstanding: persist them
      // (over the external change, against the now-advanced rev) as the author chose.
      scheduleSave();
    }
  }, [props.suspendSave]);

  useImperativeHandle(
    ref,
    () => ({
      flush,
      getText: () => viewRef.current?.state.doc.toString() ?? null,
      openPrompt: () => {
        const view = viewRef.current;
        if (view && !cb.current.promptInFlight) openPromptPopover(view);
      },
    }),
    [],
  );

  // Focus the popover input when it opens.
  useEffect(() => {
    if (popover) popoverInputRef.current?.focus();
  }, [popover]);

  function submitPopover(text: string): void {
    const p = popover;
    setPopover(null);
    const trimmed = text.trim();
    if (!p || trimmed.length === 0) return;
    // A turn may have started while the popover was open; don't stack a second one.
    if (cb.current.promptInFlight) return;
    cb.current.onPrompt(trimmed, { path: cb.current.path, cursor: p.cursor, selection: p.selection, anchor: p.anchor });
    viewRef.current?.focus();
  }

  return (
    <div className="editor">
      <div className="editor__surface" ref={hostRef} />
      {staleRebased && (
        <div className="editor__notice" role="status">
          The file changed on disk — your edits were rebased onto the latest version and re-saved.
        </div>
      )}
      {saveError && (
        <div className="editor__notice" role="status">
          Couldn't save your latest edits — retrying… (your changes are safe in the editor)
        </div>
      )}
      {popover && (
        <div className="editor__popover" style={{ left: popover.left, top: popover.top }} role="dialog" aria-label="Ask the agent">
          <input
            ref={popoverInputRef}
            className="editor__popover-input"
            placeholder="Ask the agent about this spot…"
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") submitPopover(e.currentTarget.value);
              else if (e.key === "Escape") {
                setPopover(null);
                viewRef.current?.focus();
              }
            }}
          />
          <span className="editor__popover-hint">Enter to send · Esc to cancel</span>
        </div>
      )}
    </div>
  );
});
