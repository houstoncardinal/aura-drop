import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { supabase, type Submission } from "../../lib/supabase";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const TOOLS = [
  {
    to: "/dashboard/submissions",
    icon: "◎",
    label: "Submissions",
    desc: "Track every pitch you've sent and see curator feedback.",
    color: "from-blue-950/40 to-blue-900/10 border-blue-800/30",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.3)]",
  },
  {
    to: "/dashboard/bio",
    icon: "△",
    label: "Bio & Press Kit",
    desc: "Build a one-sheet that opens doors — blogs, playlists, labels.",
    color: "from-accent/10 to-accent/5 border-accent/20",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(52,211,153,0.3)]",
  },
  {
    to: "/dashboard/lyrics",
    icon: "✦",
    label: "Lyrics Notepad",
    desc: "Private scratchpad for lyrics, hooks, concepts, and verses.",
    color: "from-purple-950/40 to-purple-900/10 border-purple-800/30",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(168,85,247,0.3)]",
  },
  {
    to: "/dashboard/release",
    icon: "⊕",
    label: "Release Planner",
    desc: "Checklist-based planner to take a track from rough to released.",
    color: "from-amber-950/40 to-amber-900/10 border-amber-800/30",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(245,158,11,0.3)]",
  },
] as const;

function StatusBadge({ status }: { status: Submission["status"] }) {
  const map = {
    pending:  "bg-amber-950/50 text-amber-400 border-amber-800/40",
    reviewed: "bg-blue-950/50 text-blue-400 border-blue-800/40",
    accepted: "bg-accent/10 text-accent border-accent/30",
    passed:   "bg-rose-950/50 text-rose-400 border-rose-800/40",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}

function DashboardHome() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const artistName: string = user?.user_metadata?.artist_name ?? user?.email?.split("@")[0] ?? "Artist";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setSubmissions((data ?? []) as Submission[]);
        setLoading(false);
      });
  }, [user]);

  const pending = submissions.filter((s) => s.status === "pending").length;
  const accepted = submissions.filter((s) => s.status === "accepted").length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
          △ The Vault — Artist Studio
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          Welcome back,{" "}
          <span className="text-gradient-accent">{artistName}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your creative command center. Everything you need, in one place.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Submissions", value: loading ? "—" : submissions.length > 0 ? submissions.length : "0", note: "All time" },
          { label: "Pending Review",    value: loading ? "—" : pending,                                                note: "Awaiting curator" },
          { label: "Accepted",          value: loading ? "—" : accepted,                                               note: "Approved tracks" },
          { label: "Response Rate",     value: submissions.length ? `${Math.round(((submissions.length - pending) / submissions.length) * 100)}%` : "—", note: "Curator engagement" },
        ].map(({ label, value, note }) => (
          <div key={label} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">{note}</p>
            <p className="mt-1 font-display text-3xl font-bold text-zinc-100">{value}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
          Creative Tools
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOOLS.map(({ to, icon, label, desc, color, glow }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-start gap-4 rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${color} ${glow}`}
            >
              <span className="mt-0.5 font-mono text-2xl text-accent">{icon}</span>
              <div>
                <p className="font-display text-base font-semibold text-zinc-100 transition-colors group-hover:text-accent">
                  {label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      {!loading && submissions.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
              Recent Submissions
            </h2>
            <Link to="/dashboard/submissions" className="font-mono text-[10px] uppercase tracking-wider text-accent hover:text-accent/80">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">{s.track_title || s.track_url}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                    {s.genre} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800/60 p-10 text-center">
          <p className="text-3xl">◎</p>
          <p className="mt-3 text-sm font-medium text-zinc-400">No submissions yet</p>
          <p className="mt-1 text-xs text-zinc-600">Head to the homepage and submit your first track.</p>
          <a
            href="/#submit"
            className="mt-4 inline-flex items-center rounded-full bg-accent/10 px-5 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
          >
            Submit Music →
          </a>
        </div>
      )}
    </div>
  );
}
