import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        subscription.unsubscribe();
        navigate({ to: "/dashboard" });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/dashboard" });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex items-center gap-3 text-zinc-400">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
        <span className="font-mono text-sm uppercase tracking-widest">Unlocking the vault...</span>
      </div>
    </div>
  );
}
