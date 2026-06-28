import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../lib/auth";
import { supabase, type LyricNote } from "../../lib/supabase";

export const Route = createFileRoute("/dashboard/lyrics")({
  component: LyricsPage,
});

function LyricsPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LyricNote[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const active = notes.find((n) => n.id === activeId) ?? null;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("lyric_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as LyricNote[];
        setNotes(list);
        if (list.length > 0) openNote(list[0]);
        setLoading(false);
      });
  }, [user]);

  function openNote(note: LyricNote) {
    setActiveId(note.id);
    setTitle(note.title);
    setContent(note.content);
  }

  function scheduleContentSave(val: string) {
    setContent(val);
    setSaving(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(title, val), 1500);
  }

  function scheduleTitleSave(val: string) {
    setTitle(val);
    setSaving(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(val, content), 1500);
  }

  async function doSave(t: string, c: string) {
    if (!activeId || !user) return;
    setSaving(true);
    const now = new Date().toISOString();
    await supabase
      .from("lyric_notes")
      .update({ title: t || "Untitled", content: c, updated_at: now })
      .eq("id", activeId);
    setNotes((prev) =>
      prev
        .map((n) => (n.id === activeId ? { ...n, title: t || "Untitled", content: c, updated_at: now } : n))
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    );
    setSaving(false);
  }

  async function createNote() {
    if (!user) return;
    const { data, error } = await supabase
      .from("lyric_notes")
      .insert({ user_id: user.id, title: "Untitled", content: "" })
      .select()
      .single();
    if (!error && data) {
      const note = data as LyricNote;
      setNotes((prev) => [note, ...prev]);
      openNote(note);
    }
  }

  async function deleteNote(id: string) {
    await supabase.from("lyric_notes").delete().eq("id", id);
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    setConfirmDelete(null);
    if (activeId === id) {
      if (remaining.length > 0) openNote(remaining[0]);
      else { setActiveId(null); setTitle(""); setContent(""); }
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 0;

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">✦ Lyrics</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Lyrics Notepad</h1>
          <p className="mt-1 text-sm text-zinc-500">Private. Auto-saves. Write your music here.</p>
        </div>
        <button
          onClick={createNote}
          className="rounded-full bg-accent/10 px-5 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          + New Note
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        {/* Note list */}
        <div className="flex w-56 shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30">
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-800/40" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <p className="text-2xl">✦</p>
              <p className="mt-2 text-xs text-zinc-600">No notes yet</p>
              <button
                onClick={createNote}
                className="mt-3 text-xs text-accent hover:text-accent/80"
              >
                Create first note
              </button>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto p-2">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className={[
                    "group relative flex cursor-pointer items-start justify-between rounded-xl px-3 py-3 transition-all",
                    activeId === note.id
                      ? "bg-accent/10"
                      : "hover:bg-zinc-800/40",
                  ].join(" ")}
                  onClick={() => openNote(note)}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${activeId === note.id ? "text-accent" : "text-zinc-300"}`}>
                      {note.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] text-zinc-700">
                      {new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {confirmDelete === note.id ? (
                    <div className="ml-2 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold text-rose-400 hover:bg-rose-900/30"
                      >
                        Del
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                        className="rounded px-1.5 py-0.5 text-[9px] text-zinc-600 hover:bg-zinc-800"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(note.id); }}
                      className="ml-2 shrink-0 opacity-0 text-zinc-700 transition-opacity group-hover:opacity-100 hover:text-rose-400"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30">
          {activeId ? (
            <>
              {/* Title bar */}
              <div className="flex items-center gap-4 border-b border-zinc-800/50 px-5 py-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => scheduleTitleSave(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent font-display text-lg font-semibold text-zinc-100 placeholder-zinc-700 outline-none"
                  placeholder="Untitled"
                />
                <span className={`shrink-0 font-mono text-[9px] transition-opacity ${saving ? "text-accent opacity-100" : "text-zinc-700 opacity-50"}`}>
                  {saving ? "Saving…" : "Auto-saved"}
                </span>
              </div>

              {/* Text area */}
              <textarea
                value={content}
                onChange={(e) => scheduleContentSave(e.target.value)}
                className="flex-1 resize-none bg-transparent p-5 font-mono text-sm leading-7 text-zinc-300 placeholder-zinc-800 outline-none"
                placeholder={`Start writing…\n\nTips:\n• Line 1 — hook\n• Line 2 — verse\n• [Chorus] to mark sections\n• Just write. Don't edit yet.`}
                spellCheck
              />

              {/* Footer stats */}
              <div className="flex items-center gap-5 border-t border-zinc-800/50 px-5 py-2.5">
                <span className="font-mono text-[9px] text-zinc-700">{wordCount} words</span>
                <span className="font-mono text-[9px] text-zinc-700">{lineCount} lines</span>
                <span className="font-mono text-[9px] text-zinc-700">{content.length} chars</span>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-3xl text-zinc-800">✦</p>
              <p className="mt-3 text-sm text-zinc-600">Select a note or create one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
