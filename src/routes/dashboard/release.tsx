import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../lib/auth";
import { supabase, type ChecklistItem, type ReleaseChecklist } from "../../lib/supabase";

export const Route = createFileRoute("/dashboard/release")({
  component: ReleasePage,
});

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "1",  label: "Finalize master recording",                   done: false },
  { id: "2",  label: "Commission / approve album artwork",          done: false },
  { id: "3",  label: "Register song with PRO (ASCAP / BMI / SESAC)", done: false },
  { id: "4",  label: "Submit to distributor (DistroKid / TuneCore)", done: false },
  { id: "5",  label: "Create pre-save link (Toneden / Hypeddit)",   done: false },
  { id: "6",  label: "Pitch to Spotify Editorial playlist team",    done: false },
  { id: "7",  label: "Pitch to Apple Music curators",               done: false },
  { id: "8",  label: "Reach out to music blogs & press",            done: false },
  { id: "9",  label: "Record TikTok / Instagram Reels content",     done: false },
  { id: "10", label: "Schedule social media announcement posts",    done: false },
  { id: "11", label: "Create YouTube lyric or visualizer video",    done: false },
  { id: "12", label: "Plan release show, stream, or event",         done: false },
  { id: "13", label: "Send to Vault curators for playlist/review",  done: false },
];

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function ReleasePage() {
  const { user } = useAuth();
  const [releases, setReleases] = useState<ReleaseChecklist[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [addingRelease, setAddingRelease] = useState(false);
  const [newReleaseName, setNewReleaseName] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const active = releases.find((r) => r.id === activeId) ?? null;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("release_checklists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as ReleaseChecklist[];
        setReleases(list);
        if (list.length > 0) setActiveId(list[0].id);
        setLoading(false);
      });
  }, [user]);

  async function createRelease() {
    if (!user || !newReleaseName.trim()) return;
    const { data, error } = await supabase
      .from("release_checklists")
      .insert({
        user_id: user.id,
        release_name: newReleaseName.trim(),
        items: DEFAULT_ITEMS,
      })
      .select()
      .single();
    if (!error && data) {
      const r = data as ReleaseChecklist;
      setReleases((prev) => [r, ...prev]);
      setActiveId(r.id);
      setNewReleaseName("");
      setAddingRelease(false);
    }
  }

  async function persistItems(items: ChecklistItem[]) {
    if (!activeId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase
        .from("release_checklists")
        .update({ items, updated_at: new Date().toISOString() })
        .eq("id", activeId);
    }, 600);
  }

  function toggleItem(id: string) {
    if (!active) return;
    const updated = active.items.map((it) =>
      it.id === id ? { ...it, done: !it.done } : it
    );
    updateItems(updated);
  }

  function updateItems(items: ChecklistItem[]) {
    setReleases((prev) =>
      prev.map((r) => (r.id === activeId ? { ...r, items } : r))
    );
    persistItems(items);
  }

  function addItem() {
    if (!newLabel.trim() || !active) return;
    const updated = [
      ...active.items,
      { id: genId(), label: newLabel.trim(), done: false },
    ];
    updateItems(updated);
    setNewLabel("");
  }

  function removeItem(id: string) {
    if (!active) return;
    updateItems(active.items.filter((it) => it.id !== id));
  }

  async function deleteRelease(id: string) {
    await supabase.from("release_checklists").delete().eq("id", id);
    const remaining = releases.filter((r) => r.id !== id);
    setReleases(remaining);
    setActiveId(remaining.length > 0 ? remaining[0].id : null);
  }

  const done = active?.items.filter((i) => i.done).length ?? 0;
  const total = active?.items.length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">⊕ Planner</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Release Planner</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Checklist-based planning from rough mix to release day.
          </p>
        </div>
        <button
          onClick={() => setAddingRelease(true)}
          className="rounded-full bg-accent/10 px-5 py-2 text-xs font-semibold text-accent hover:bg-accent/20"
        >
          + New Release
        </button>
      </div>

      {/* New release input */}
      {addingRelease && (
        <div className="flex gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <input
            type="text"
            value={newReleaseName}
            onChange={(e) => setNewReleaseName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createRelease(); }}
            className="vault-input py-2"
            placeholder="Release name (e.g. 'Midnight Sessions EP')"
            autoFocus
          />
          <button
            onClick={createRelease}
            className="shrink-0 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-zinc-950"
          >
            Create
          </button>
          <button
            onClick={() => setAddingRelease(false)}
            className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-zinc-900/40" />)}
        </div>
      ) : releases.length === 0 && !addingRelease ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/60 p-14 text-center">
          <p className="text-3xl">⊕</p>
          <p className="mt-3 text-sm font-medium text-zinc-400">No releases yet</p>
          <p className="mt-1 text-xs text-zinc-600">Create your first release to start planning.</p>
          <button
            onClick={() => setAddingRelease(true)}
            className="mt-4 inline-flex items-center rounded-full bg-accent/10 px-5 py-2 text-xs font-semibold text-accent hover:bg-accent/20"
          >
            + Create Release
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[200px,1fr]">
          {/* Release list */}
          <div className="space-y-1">
            <p className="mb-2 px-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-700">Releases</p>
            {releases.map((r) => {
              const done = r.items.filter((i) => i.done).length;
              const total = r.items.length;
              return (
                <div
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={[
                    "group cursor-pointer rounded-xl px-3 py-3 transition-all",
                    activeId === r.id
                      ? "border border-accent/20 bg-accent/10"
                      : "hover:bg-zinc-800/40",
                  ].join(" ")}
                >
                  <p className={`text-sm font-medium ${activeId === r.id ? "text-accent" : "text-zinc-300"}`}>
                    {r.release_name}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-zinc-700">
                    {done}/{total} done
                  </p>
                </div>
              );
            })}
          </div>

          {/* Checklist */}
          {active && (
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-zinc-100">
                    {active.release_name}
                  </h2>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                    {done} of {total} tasks complete
                  </p>
                </div>
                <button
                  onClick={() => deleteRelease(active.id)}
                  className="rounded-lg px-3 py-1.5 font-mono text-[9px] text-zinc-700 hover:text-rose-400"
                >
                  Delete
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-zinc-700">Progress</span>
                  <span className="font-mono text-[9px] text-accent">{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct === 100 && (
                  <p className="mt-2 font-mono text-[10px] text-accent">
                    ✦ Release ready. Go live.
                  </p>
                )}
              </div>

              {/* Items */}
              <ul className="space-y-2">
                {active.items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-center gap-3 rounded-xl border border-zinc-800/40 bg-zinc-900/40 px-4 py-3 transition-all hover:border-zinc-700/60"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={[
                        "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all",
                        item.done
                          ? "border-accent bg-accent text-zinc-950"
                          : "border-zinc-700 hover:border-accent",
                      ].join(" ")}
                    >
                      {item.done && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${item.done ? "text-zinc-600 line-through" : "text-zinc-300"}`}>
                      {item.label}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 text-zinc-800 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              {/* Add custom item */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
                  className="vault-input py-2.5 text-sm"
                  placeholder="Add a custom task..."
                />
                <button
                  onClick={addItem}
                  disabled={!newLabel.trim()}
                  className="shrink-0 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/20 disabled:opacity-30"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
