import { createFileRoute, Outlet, Link, useNavigate, useMatchRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../lib/auth";
import { CipherRain, ClickRipple, Cursor, LiveBackground, SiteNav } from "../components/site-shell";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard" as const,             label: "Overview",        icon: "◈", exact: true  },
  { to: "/dashboard/submissions" as const, label: "Submissions",     icon: "◎", exact: false },
  { to: "/dashboard/bio" as const,         label: "Bio & Press Kit", icon: "△", exact: false },
  { to: "/dashboard/lyrics" as const,      label: "Lyrics",          icon: "✦", exact: false },
  { to: "/dashboard/release" as const,     label: "Release Planner", icon: "⊕", exact: false },
] as const;

function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
      </div>
    );
  }
  if (!user) return null;

  const artistName: string = user.user_metadata?.artist_name ?? user.email?.split("@")[0] ?? "Artist";
  const initial = artistName.charAt(0).toUpperCase();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <Cursor />
      <ClickRipple />
      <LiveBackground />
      <CipherRain />
      <SiteNav />

      <div className="relative z-10 flex min-h-screen pt-20">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 bottom-0 hidden w-56 flex-col border-r border-zinc-800/60 bg-zinc-950/70 backdrop-blur-xl lg:flex">
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
              Studio
            </p>
            <ul className="space-y-0.5">
              {NAV.map(({ to, label, icon, exact }) => {
                const active = matchRoute({ to, fuzzy: !exact });
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={[
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "border-l-2 border-accent bg-accent/10 pl-[10px] text-accent"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100",
                      ].join(" ")}
                    >
                      <span className="font-mono text-base">{icon}</span>
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Profile + sign out */}
          <div className="border-t border-zinc-800/60 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-zinc-900/60 p-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-zinc-950">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">{artistName}</p>
                <p className="truncate font-mono text-[10px] text-zinc-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full rounded-lg py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600 transition-colors hover:text-red-400"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-56">
          <div className="min-h-full p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
