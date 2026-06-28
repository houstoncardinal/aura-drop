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

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [artistName, setArtistName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyStep, setVerifyStep] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { artist_name: artistName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setVerifyStep(true);
      setLoading(false);
    }
  }

  if (verifyStep) {
    return (
      <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
        <Cursor />
        <ClickRipple />
        <LiveBackground />
        <CipherRain />
        <SiteNav />
        <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20">
          <div className="w-full max-w-md text-center">
            <EyeOfRa className="mx-auto mb-6 w-16 text-accent/30 animate-eye-pulse" />
            <h2 className="font-display text-2xl font-bold">Check your inbox</h2>
            <p className="mt-3 text-sm text-zinc-400">
              We sent a confirmation link to <span className="text-zinc-100">{email}</span>.
              Click it to activate your account and access your dashboard.
            </p>
            <p className="mt-6 text-xs text-zinc-600">
              Already confirmed?{" "}
              <Link to="/login" className="text-accent hover:text-accent/80">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
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
            <h1 className="font-display text-3xl font-bold tracking-tight">Join The Vault</h1>
            <p className="mt-2 text-sm text-zinc-500">Create your free artist account</p>
          </div>

          <div className="vault-glow rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-8 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="vault-input"
                  placeholder="Your artist or band name"
                  required
                />
              </div>
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
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link to="/login" className="text-accent transition-colors hover:text-accent/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
