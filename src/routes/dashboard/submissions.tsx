import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { supabase, type Submission } from "../../lib/supabase";

export const Route = createFileRoute("/dashboard/submissions")({
  component: SubmissionsPage,
});

const STATUS_CONFIG = {
  pending:  { label: "Pending",  cls: "bg-amber-950/50 text-amber-400 border-amber-800/40",     dot: "bg-amber-400" },
  reviewed: { label: "Reviewed", cls: "bg-blue-950/50 text-blue-400 border-blue-800/40",        dot: "bg-blue-400"  },
  accepted: { label: "Accepted", cls: "bg-accent/10 text-accent border-accent/30",              dot: "bg-accent"    },
  passed:   { label: "Passed",   cls: "bg-rose-950/50 text-rose-400 border-rose-800/40",        dot: "bg-rose-400"  },
};

function StatusBadge({ status }: { status: Submission["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${cfg.cls}`}>
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<Submission["status"] | "all">("all");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubmissions((data ?? []) as Submission[]);
        setLoading(false);
      });
  }, [user]);

  const filtered =
    filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  const counts = submissions.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">◎ Tracker</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">My Submissions</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Every track you've submitted, with live status from curators.
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "reviewed", "accepted", "passed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={[
              "rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all",
              filter === s
                ? "border-accent bg-accent/10 text-accent"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
            ].join(" ")}
          >
            {s === "all" ? `All (${submissions.length})` : `${STATUS_CONFIG[s].label} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-900/40" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800/60 p-14 text-center">
          <p className="text-3xl">◎</p>
          <p className="mt-3 text-sm font-medium text-zinc-400">
            {filter === "all" ? "No submissions yet" : `No ${filter} submissions`}
          </p>
          {filter === "all" && (
            <>
              <p className="mt-1 text-xs text-zinc-600">Submit your first track to get started.</p>
              <a
                href="/#submit"
                className="mt-4 inline-flex items-center rounded-full bg-accent/10 px-5 py-2 text-xs font-semibold text-accent hover:bg-accent/20"
              >
                Submit Music →
              </a>
            </>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((sub) => {
            const isOpen = expanded === sub.id;
            return (
              <div
                key={sub.id}
                className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 transition-all"
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : sub.id)}
                >
                  <div className="flex items-center gap-4">
                    <StatusBadge status={sub.status} />
                    <div>
                      <p className="font-medium text-zinc-100">
                        {sub.track_title || "Untitled Track"}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-600">
                        {sub.genre} · {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-zinc-600 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-800/40 px-6 py-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Track Link</p>
                        <a
                          href={sub.track_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block truncate text-sm text-accent hover:underline"
                        >
                          {sub.track_url}
                        </a>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Platform</p>
                        <p className="mt-1 text-sm text-zinc-300">{sub.platform ?? "—"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Your Pitch</p>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{sub.pitch}</p>
                      </div>
                      {sub.curator_notes && (
                        <div className="sm:col-span-2">
                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                            Curator Notes
                          </p>
                          <div className="mt-1 rounded-xl border border-accent/20 bg-accent/5 p-4">
                            <p className="text-sm leading-relaxed text-zinc-300">{sub.curator_notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
