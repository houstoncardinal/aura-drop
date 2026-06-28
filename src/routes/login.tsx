import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CipherRain,
  ClickRipple,
  Cursor,
  EyeOfRa,
  LiveBackground,
  SiteNav,
} from "../components/site-shell";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <Cursor />
      <ClickRipple />
      <LiveBackground />
      <CipherRain />
      <SiteNav />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <EyeOfRa className="mx-auto mb-5 w-14 text-accent/25 animate-eye-pulse" />
            <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-zinc-500">Sign in to your Vault account</p>
          </div>

          <div className="vault-glow rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-8 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vault-input"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vault-input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-full bg-accent py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:shadow-[0_0_40px_-6px_rgba(52,211,153,0.7)] disabled:opacity-50"
              >
                <span className="shimmer pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100" />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-zinc-500">
                No account?{" "}
                <Link to="/signup" className="text-accent transition-colors hover:text-accent/80">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
