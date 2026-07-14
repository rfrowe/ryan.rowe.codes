// Injectable side-effect seams so sidecar logic is unit-testable without touching
// the real filesystem, git, or wall clock. The sidecar's testable logic depends on
// these interfaces; concrete implementations live in the sidecar.

export interface Fs {
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  code: number;
}

export interface GitRunner {
  /** Run a `git` subcommand. Rejects on timeout; resolves with the full result otherwise. */
  git(args: readonly string[], opts?: { cwd?: string; timeoutMs?: number }): Promise<RunResult>;
  /** Run the `gh` CLI similarly. */
  gh(args: readonly string[], opts?: { cwd?: string; timeoutMs?: number }): Promise<RunResult>;
}

export interface Clock {
  now(): number;
}
