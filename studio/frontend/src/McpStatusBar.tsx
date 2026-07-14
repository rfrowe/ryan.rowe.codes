// MCP status chip (bottom-right). Shows connected/total servers from the `mcp.status`
// broadcast; clicking opens a popover listing each server's status with an enable/disable
// toggle that maps to `mcp.setEnabled`. Re-renders whenever a new mcp.status arrives.

import { useEffect, useRef, useState } from "react";

export interface McpServerStatus {
  name: string;
  status: string;
  enabled: boolean;
}

interface McpStatusBarProps {
  servers: McpServerStatus[];
  onToggle: (server: string, enabled: boolean) => void;
}

// Known status strings from the protocol: connected / needs-auth / failed / disabled.
function statusLabel(status: string): string {
  switch (status) {
    case "connected":
      return "connected";
    case "needs-auth":
      return "needs auth";
    case "failed":
      return "failed";
    case "disabled":
      return "disabled";
    default:
      return status;
  }
}

export function McpStatusBar({ servers, onToggle }: McpStatusBarProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const total = servers.length;
  const connected = servers.filter((s) => s.status === "connected").length;
  // Aggregate health for the chip's dot: green when everything that's on is connected,
  // amber when a server wants attention (needs-auth / failed), else neutral (all disabled).
  const attention = servers.some((s) => s.status === "needs-auth" || s.status === "failed");
  const allGood = total > 0 && !attention && connected === servers.filter((s) => s.enabled).length;
  const dotState = attention ? "warn" : allGood ? "ok" : "idle";

  // Dismiss the popover on an outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="mcp" ref={rootRef}>
      <button
        type="button"
        className={`mcp__chip ${open ? "mcp__chip--open" : ""}`}
        aria-expanded={open}
        title="MCP servers"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`mcp__dot mcp__dot--${dotState}`} />
        {total} {total === 1 ? "server" : "servers"}
      </button>

      {open && (
        <div className="mcp__popover" role="dialog" aria-label="MCP servers">
          <div className="mcp__popover-head">MCP servers</div>
          {servers.length === 0 && <div className="mcp__empty">No MCP servers reported.</div>}
          {servers.map((s) => (
            <div key={s.name} className="mcp__row">
              <span className={`mcp__status-dot mcp__status-dot--${s.status}`} />
              <span className="mcp__name" title={s.name}>
                {s.name}
              </span>
              <span className="mcp__status">{statusLabel(s.status)}</span>
              <label className="mcp__toggle" title={s.enabled ? "Disable" : "Enable"}>
                <input type="checkbox" checked={s.enabled} onChange={(e) => onToggle(s.name, e.target.checked)} />
                <span className="mcp__toggle-track" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
