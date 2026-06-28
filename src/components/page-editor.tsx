import { useEffect, useState } from "react";
import { useEditor } from "../lib/editor";
import { useAuth } from "../lib/auth";

// ─── Deploy status copy ────────────────────────────────────────

const DEPLOY_COPY: Record<string, { label: string; color: string }> = {
  idle:      { label: "Deploy",        color: "text-zinc-300 hover:text-zinc-50" },
  deploying: { label: "Deploying…",    color: "text-amber-400" },
  done:      { label: "✓ Live",        color: "text-accent" },
  cooldown:  { label: "Wait 5 min",    color: "text-zinc-500" },
  error:     { label: "Deploy failed", color: "text-red-400" },
};

// ─── PageEditor ───────────────────────────────────────────────
// Renders two things:
//   1. A "Edit page" pill (bottom-right, only for logged-in admins, only when NOT editing)
//   2. The full editor bar across the top (only when editing)

export function PageEditor() {
  const { user } = useAuth();
  const {
    isEditing, enableEdit, exitEdit,
    isDirty, isSaving, saveAll, lastSaved,
    deployStatus, triggerPageDeploy, canDeploy,
    selectedKey,
  } = useEditor();

  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setSaveFlash(true);
      const t = setTimeout(() => setSaveFlash(false), 2500);
      return () => clearTimeout(t);
    }
  }, [lastSaved]);

  if (!user) return null;

  // ── Edit toggle button (not in edit mode) ──────────────────
  if (!isEditing) {
    return (
      <button
        onClick={enableEdit}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/95 px-4 py-2.5 text-[12px] font-semibold text-zinc-300 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all hover:border-accent/50 hover:text-accent hover:shadow-[0_0_20px_-4px_rgba(52,211,153,0.4)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Page
      </button>
    );
  }

  // ── Editor bar (full editing mode) ────────────────────────
  const deployMeta = DEPLOY_COPY[deployStatus];

  return (
    <>
      {/* Top bar — pushes page content down via padding in __root */}
      <div className="fixed left-0 right-0 top-0 z-[200] flex items-center justify-between gap-4 border-b border-accent/20 bg-zinc-950/98 px-5 py-2.5 backdrop-blur-xl shadow-[0_1px_0_0_rgba(52,211,153,0.08),0_4px_24px_-4px_rgba(0,0,0,0.6)]">

        {/* Left: status */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-2 shrink-0 rounded-full bg-accent animate-pulse" />
          <span className="text-[13px] font-semibold text-zinc-100">Editing</span>
          <span className="hidden text-[11px] text-zinc-500 md:block">
            Click any highlighted text to edit it
          </span>
          {selectedKey && (
            <code className="hidden rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-accent/80 md:block">
              {selectedKey}
            </code>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Save status / auto-save indicator */}
          {saveFlash && (
            <span className="hidden animate-fade-in text-[11px] text-accent md:block">
              ✓ Saved
            </span>
          )}
          {isDirty && !isSaving && (
            <span className="hidden text-[11px] text-amber-400 md:block">
              Unsaved changes
            </span>
          )}
          {isSaving && (
            <span className="hidden text-[11px] text-zinc-500 md:block">Saving…</span>
          )}

          {/* Deploy button */}
          <button
            onClick={triggerPageDeploy}
            disabled={!canDeploy || deployStatus === "deploying"}
            title={
              !canDeploy
                ? "Deploys are rate-limited to once every 5 minutes"
                : "Trigger a production deploy"
            }
            className={`flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-3.5 py-1.5 text-[11px] font-medium transition-all ${deployMeta.color} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {deployStatus === "deploying" ? (
              <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
            {deployMeta.label}
          </button>

          {/* Save All */}
          <button
            onClick={saveAll}
            disabled={!isDirty || isSaving}
            className="rounded-full bg-zinc-800 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-200 transition-all hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>

          {/* Exit */}
          <button
            onClick={exitEdit}
            className="rounded-full bg-accent px-3.5 py-1.5 text-[11px] font-bold text-zinc-950 transition-all hover:bg-accent/80"
          >
            Done
          </button>
        </div>
      </div>

      {/* Help hint at bottom */}
      <div className="fixed bottom-5 left-1/2 z-[150] -translate-x-1/2 pointer-events-none">
        <div className="flex items-center gap-3 rounded-full border border-zinc-800/80 bg-zinc-950/90 px-4 py-2 backdrop-blur-xl shadow-xl">
          <span className="size-1.5 rounded-full bg-accent/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Click text to edit · Blur to auto-save · Esc to deselect
          </span>
        </div>
      </div>
    </>
  );
}
