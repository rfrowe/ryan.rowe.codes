// Enumerates prior sessions for the picker. Reads session metadata via the Agent SDK
// (`listSessions` per project dir), maps it through the pure `toPickerViewModel`, and
// merges the blog repo's sessions with any recently-used build repos (post-hoc /
// cross-repo authoring). Detail (`getSessionMessages`) is left lazy: the picker only
// needs the summary and mtime the list already carries.

import { listSessions } from "@anthropic-ai/claude-agent-sdk";

import type { SessionsService } from "../shared/services";
import { toPickerViewModel, type RawSession, type SessionListItem } from "../sessions/pickerViewModel";

export interface SessionsDeps {
  /** Absolute path of the blog repo; always listed. */
  blogRepoDir: string;
  /** Additional repos to surface (e.g. recently-used build repos). */
  buildRepoDirs?: string[];
  /**
   * Seam over the SDK's `listSessions` for testing. Defaults to the real SDK call.
   */
  listSessionsImpl?: typeof listSessions;
}

/** Map one SDK `SDKSessionInfo` into the pure view-model's `RawSession`. */
function toRawSession(info: Awaited<ReturnType<typeof listSessions>>[number]): RawSession {
  return {
    sessionId: info.sessionId,
    summary: info.customTitle ?? info.summary,
    firstUserMessage: info.firstPrompt,
    mtime: info.lastModified,
    sizeBytes: info.fileSize,
    repoPath: info.cwd,
  };
}

export function createSessionsService(deps: SessionsDeps): SessionsService {
  const list = deps.listSessionsImpl ?? listSessions;
  // De-dupe repo dirs while preserving order (blog repo first).
  const dirs = [...new Set([deps.blogRepoDir, ...(deps.buildRepoDirs ?? [])])];

  return {
    async list(): Promise<SessionListItem[]> {
      const perDir = await Promise.all(
        dirs.map(async (dir) => {
          try {
            // Terminal/IDE-picker parity: skip programmatic/headless sessions.
            return await list({ dir, includeProgrammatic: false });
          } catch {
            // A missing or unreadable project dir shouldn't sink the whole picker.
            return [];
          }
        }),
      );

      const seen = new Set<string>();
      const raw: RawSession[] = [];
      for (const infos of perDir) {
        for (const info of infos) {
          if (seen.has(info.sessionId)) continue;
          seen.add(info.sessionId);
          raw.push(toRawSession(info));
        }
      }

      return toPickerViewModel(raw);
    },
  };
}
